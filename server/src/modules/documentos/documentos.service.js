import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';
import { cloudinary } from '../../config/cloudinary.js';
import { assegurarAcesso } from '../estagios/estagios.service.js';

/**
 * Upload de um documento para um estágio.
 *
 * Regras inegociáveis (CLAUDE.md 2.3):
 *   - Documento é APPEND-ONLY: cada chamada é um INSERT, nunca UPDATE.
 *   - Reenvio (mesmo `tipoDocumentoId` no mesmo `estagioId`) gera versão N+1.
 *     A versão antiga continua existindo, com seu status (reprovado, em geral).
 *
 * Fluxo:
 *   1. Autorização: aluno só posta no próprio estágio; coordenador posta em qualquer.
 *      (Orientador NÃO posta documento — só dá parecer. Bloqueamos aqui.)
 *   2. Validação cruzada: tipoDocumento pertence ao curso da turma do estágio.
 *   3. Upload do buffer para Cloudinary via stream.
 *   4. Em transação Prisma: calcular próxima versão + INSERT.
 *      A transação reduz a janela de race condition (duas requisições
 *      concorrentes calculando a mesma versão). Não elimina 100% sem
 *      uma constraint UNIQUE no banco — anotado como melhoria futura.
 */
export async function criar({ estagioId, tipoDocumentoId, arquivo, usuario }) {
  if (usuario.papel === 'orientador') {
    throw new AppError('orientador não envia documentos — apenas analisa', 403);
  }

  await assegurarAcesso(estagioId, usuario);

  // Validação cruzada: o tipo precisa pertencer ao curso da turma do estágio.
  // Carrega tudo de uma vez para evitar 3 round-trips no banco.
  const [estagio, tipo] = await Promise.all([
    prisma.estagio.findUnique({
      where: { id: estagioId },
      select: { id: true, turma: { select: { cursoId: true } } },
    }),
    prisma.tipoDocumento.findUnique({
      where: { id: tipoDocumentoId },
      select: { id: true, fase: { select: { cursoId: true } } },
    }),
  ]);
  if (!estagio) throw new AppError('estágio não encontrado', 404);
  if (!tipo) throw new AppError('tipo de documento não encontrado', 404);
  if (tipo.fase.cursoId !== estagio.turma.cursoId) {
    throw new AppError('tipo de documento não pertence ao curso do estágio', 400);
  }

  if (!arquivo) {
    throw new AppError('arquivo é obrigatório no campo `file`', 400);
  }

  // 1. Upload para o Cloudinary via stream.
  const uploadResult = await uploadStream(arquivo.buffer, {
    folder: `portal-estagio/estagios/${estagioId}/${tipoDocumentoId}`,
    resource_type: 'auto', // detecta pdf vs imagem automaticamente
  });

  // 2. Versionar e inserir em transação.
  return prisma.$transaction(async (tx) => {
    const agg = await tx.documento.aggregate({
      where: { estagioId, tipoDocumentoId },
      _max: { versao: true },
    });
    const proximaVersao = (agg._max.versao ?? 0) + 1;

    return tx.documento.create({
      data: {
        estagioId,
        tipoDocumentoId,
        versao: proximaVersao,
        status: 'enviado',
        arquivoUrl: uploadResult.secure_url,
      },
    });
  });
}

/**
 * Lista documentos de um estágio agrupados por tipo, com todas as versões
 * em ordem decrescente. Esse formato é o que a UI vai consumir.
 */
export async function listarPorEstagio(estagioId, usuario) {
  await assegurarAcesso(estagioId, usuario);

  // Carrega TODOS os tipos de documento do curso do estágio + os documentos
  // já enviados. Tipos sem documento aparecem com `versoes: []` (status pendente).
  const estagio = await prisma.estagio.findUnique({
    where: { id: estagioId },
    select: {
      id: true,
      turma: {
        select: {
          curso: {
            select: {
              fases: {
                orderBy: { ordem: 'asc' },
                include: { tipos: true },
              },
            },
          },
        },
      },
    },
  });
  if (!estagio) throw new AppError('estágio não encontrado', 404);

  const tipos = estagio.turma.curso.fases.flatMap((f) =>
    f.tipos.map((t) => ({ ...t, faseOrdem: f.ordem, faseNome: f.nome }))
  );

  const documentos = await prisma.documento.findMany({
    where: { estagioId },
    orderBy: [{ versao: 'desc' }],
    include: {
      pareceres: {
        orderBy: { criadoEm: 'desc' },
        include: { autor: { select: { id: true, nome: true } } },
      },
    },
  });

  const porTipo = tipos.map((tipo) => {
    const versoes = documentos.filter((d) => d.tipoDocumentoId === tipo.id);
    return {
      tipoDocumento: {
        id: tipo.id,
        nome: tipo.nome,
        obrigatorio: tipo.obrigatorio,
        faseId: tipo.faseId,
        faseOrdem: tipo.faseOrdem,
        faseNome: tipo.faseNome,
      },
      versoes,
    };
  });

  return porTipo;
}

export async function buscarPorId(id, usuario) {
  const doc = await prisma.documento.findUnique({
    where: { id },
    include: {
      tipoDocumento: { include: { fase: true } },
      pareceres: {
        orderBy: { criadoEm: 'desc' },
        include: { autor: { select: { id: true, nome: true } } },
      },
      estagio: {
        select: { id: true, alunoId: true, turma: { select: { orientadorId: true } } },
      },
    },
  });
  if (!doc) throw new AppError('documento não encontrado', 404);

  // Reutiliza a regra de acesso do estágio.
  await assegurarAcesso(doc.estagioId, usuario);
  return doc;
}

/**
 * Lista documentos visíveis para o orientador (a "fila de análise").
 * Filtra apenas documentos cujo estagio.turma.orientadorId === orientador.id,
 * para que um orientador nunca veja documentos de turmas que não orienta.
 *
 * Filtros opcionais: `status` (qualquer um do enum DocumentoStatus).
 * Ordenação: enviadoEm asc (FIFO — mais antigos primeiro, justo para o aluno).
 */
export async function listarFilaDoOrientador(orientadorId, { status } = {}) {
  return prisma.documento.findMany({
    where: {
      ...(status && { status }),
      estagio: { turma: { orientadorId } },
    },
    orderBy: [{ enviadoEm: 'asc' }],
    include: {
      tipoDocumento: { select: { id: true, nome: true, obrigatorio: true } },
      estagio: {
        select: {
          id: true,
          aluno: { select: { id: true, nome: true, ra: true } },
          turma: { select: { id: true, periodo: true } },
        },
      },
    },
  });
}

// Wrapper que adapta `cloudinary.uploader.upload_stream` (callback-based)
// para uma Promise — fica fácil usar com await no service.
function uploadStream(buffer, opcoes) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(opcoes, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';

/**
 * Cria um parecer e transita o status do documento em uma única transação.
 *
 * Regras (CLAUDE.md 2.2):
 *   - Documento precisa estar em `enviado` para receber parecer
 *     (pulamos `em_analise` por decisão da etapa).
 *   - Apenas o ORIENTADOR DA TURMA do estágio do documento pode dar parecer.
 *     Não basta ser papel `orientador` — precisa ser o da turma específica.
 *   - Documento NÃO é atualizado em mais nada além do `status`.
 *     A linha continua intacta; só o `status` reflete o veredito.
 *
 * A transação garante atomicidade: parecer + transição de status nunca
 * ficam desincronizados. Se algo falhar no meio, o banco volta inteiro.
 */
export async function criarParecer({ documentoId, autorId, decisao, comentario }) {
  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
    select: {
      id: true,
      status: true,
      estagio: {
        select: { id: true, turma: { select: { orientadorId: true } } },
      },
    },
  });
  if (!documento) throw new AppError('documento não encontrado', 404);

  if (documento.estagio.turma.orientadorId !== autorId) {
    // Mensagem específica para deixar claro o motivo (não é "papel errado",
    // é "papel certo mas turma errada").
    throw new AppError('apenas o orientador da turma pode dar parecer', 403);
  }

  if (documento.status !== 'enviado') {
    throw new AppError(
      `documento já foi avaliado (status atual: ${documento.status})`,
      409
    );
  }

  return prisma.$transaction(async (tx) => {
    const parecer = await tx.parecer.create({
      data: { documentoId, autorId, decisao, comentario },
      include: { autor: { select: { id: true, nome: true } } },
    });
    const documentoAtualizado = await tx.documento.update({
      where: { id: documentoId },
      data: { status: decisao },
    });
    return { parecer, documento: documentoAtualizado };
  });
}

import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';
import { mapearErroPrisma } from '../../lib/prismaErrors.js';

export async function criar(cursoId, { nome, ordem }) {
  await garantirCurso(cursoId);
  try {
    return await prisma.fase.create({
      data: { cursoId, nome, ordem },
    });
  } catch (err) {
    throw mapearErroPrisma(err, {
      p2002: `já existe uma fase com ordem ${ordem} nesse curso`,
    });
  }
}

export async function listarPorCurso(cursoId) {
  await garantirCurso(cursoId);
  return prisma.fase.findMany({
    where: { cursoId },
    orderBy: { ordem: 'asc' },
  });
}

export async function buscarPorId(id) {
  const fase = await prisma.fase.findUnique({
    where: { id },
    include: { tipos: true },
  });
  if (!fase) throw new AppError('fase não encontrada', 404);
  return fase;
}

export async function atualizar(id, { nome }) {
  await garantirFase(id);
  return prisma.fase.update({
    where: { id },
    data: { nome },
  });
}

export async function remover(id) {
  await garantirFase(id);
  const tipos = await prisma.tipoDocumento.count({ where: { faseId: id } });
  if (tipos > 0) {
    throw new AppError(`fase possui ${tipos} tipo(s) de documento — remova-os antes`, 409);
  }
  await prisma.fase.delete({ where: { id } });
}

/**
 * Reordena todas (ou parte) das fases de um curso atomicamente.
 *
 * O `@@unique([cursoId, ordem])` impede um swap ingênuo (não dá para colocar
 * uma fase na ordem de outra sem violar a constraint). Resolvemos em DUAS
 * passadas dentro de uma transação:
 *   1. Move cada fase afetada para uma ordem temporária NEGATIVA (livre por def.).
 *   2. Move cada fase para a ordem final positiva.
 *
 * Validação garante que: todas as fases pertencem ao cursoId, IDs/ordens são
 * únicas no payload (Zod já validou isso), e nenhuma das ordens finais bate
 * com uma fase NÃO mencionada no payload (caso contrário haveria colisão
 * na segunda passada).
 */
export async function reordenar(cursoId, ordens) {
  await garantirCurso(cursoId);

  return prisma.$transaction(async (tx) => {
    const ids = ordens.map((o) => o.id);
    const fasesNoCurso = await tx.fase.findMany({
      where: { cursoId },
      select: { id: true, ordem: true },
    });

    const idsNoCurso = new Set(fasesNoCurso.map((f) => f.id));
    for (const id of ids) {
      if (!idsNoCurso.has(id)) {
        throw new AppError(`fase ${id} não pertence ao curso`, 400);
      }
    }

    // Detectar colisão com fases NÃO mencionadas: se o payload mira ordem 2
    // mas existe fase fora do payload com ordem 2, a segunda passada falharia.
    const idsAfetados = new Set(ids);
    const ordensFinais = new Set(ordens.map((o) => o.ordem));
    for (const f of fasesNoCurso) {
      if (!idsAfetados.has(f.id) && ordensFinais.has(f.ordem)) {
        throw new AppError(
          `ordem ${f.ordem} já é usada por uma fase fora do payload — inclua-a também`,
          409
        );
      }
    }

    // 1ª passada: parquear nas ordens negativas.
    for (const o of ordens) {
      await tx.fase.update({
        where: { id: o.id },
        data: { ordem: -o.ordem },
      });
    }
    // 2ª passada: atribuir as ordens finais.
    for (const o of ordens) {
      await tx.fase.update({
        where: { id: o.id },
        data: { ordem: o.ordem },
      });
    }

    return tx.fase.findMany({
      where: { cursoId },
      orderBy: { ordem: 'asc' },
    });
  });
}

async function garantirCurso(cursoId) {
  const c = await prisma.curso.findUnique({ where: { id: cursoId }, select: { id: true } });
  if (!c) throw new AppError('curso não encontrado', 404);
}

async function garantirFase(id) {
  const f = await prisma.fase.findUnique({ where: { id }, select: { id: true } });
  if (!f) throw new AppError('fase não encontrada', 404);
}

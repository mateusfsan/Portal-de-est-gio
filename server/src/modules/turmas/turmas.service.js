import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';

// Reutilizamos esse `select` para nunca devolver senhaHash junto dos relacionamentos.
const orientadorSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
};

export async function criar({ cursoId, orientadorId, periodo }) {
  await garantirCurso(cursoId);
  await garantirOrientador(orientadorId);
  return prisma.turma.create({
    data: { cursoId, orientadorId, periodo },
    include: { curso: true, orientador: { select: orientadorSelect } },
  });
}

export async function listar({ cursoId } = {}) {
  return prisma.turma.findMany({
    where: cursoId ? { cursoId } : undefined,
    orderBy: [{ periodo: 'desc' }, { id: 'asc' }],
    include: { curso: true, orientador: { select: orientadorSelect } },
  });
}

export async function buscarPorId(id) {
  const turma = await prisma.turma.findUnique({
    where: { id },
    include: { curso: true, orientador: { select: orientadorSelect } },
  });
  if (!turma) throw new AppError('turma não encontrada', 404);
  return turma;
}

export async function atualizar(id, { orientadorId, periodo }) {
  await garantirTurma(id);
  await garantirOrientador(orientadorId);
  return prisma.turma.update({
    where: { id },
    data: { orientadorId, periodo },
    include: { curso: true, orientador: { select: orientadorSelect } },
  });
}

export async function remover(id) {
  await garantirTurma(id);
  const estagios = await prisma.estagio.count({ where: { turmaId: id } });
  if (estagios > 0) {
    throw new AppError(`turma possui ${estagios} estágio(s) vinculado(s)`, 409);
  }
  await prisma.turma.delete({ where: { id } });
}

async function garantirCurso(cursoId) {
  const c = await prisma.curso.findUnique({ where: { id: cursoId }, select: { id: true } });
  if (!c) throw new AppError('curso não encontrado', 404);
}

async function garantirTurma(id) {
  const t = await prisma.turma.findUnique({ where: { id }, select: { id: true } });
  if (!t) throw new AppError('turma não encontrada', 404);
}

// Validação cruzada: o usuário escolhido como orientador da turma precisa,
// de fato, ter papel `orientador`. Sem essa checagem, o coordenador poderia
// colocar um aluno como "orientador" e violar o modelo de RBAC.
async function garantirOrientador(orientadorId) {
  const u = await prisma.usuario.findUnique({
    where: { id: orientadorId },
    select: { id: true, papel: true },
  });
  if (!u) throw new AppError('orientador não encontrado', 404);
  if (u.papel !== 'orientador') {
    throw new AppError('usuário não tem papel orientador', 409);
  }
}

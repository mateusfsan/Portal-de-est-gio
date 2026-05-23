import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';

export async function criar({ nome }) {
  return prisma.curso.create({ data: { nome } });
}

export async function listar() {
  return prisma.curso.findMany({
    orderBy: { nome: 'asc' },
  });
}

export async function buscarPorId(id) {
  const curso = await prisma.curso.findUnique({
    where: { id },
    // Inclui fases ordenadas; o painel do coordenador precisa ver a hierarquia montada.
    include: {
      fases: {
        orderBy: { ordem: 'asc' },
        include: { tipos: true },
      },
    },
  });
  if (!curso) throw new AppError('curso não encontrado', 404);
  return curso;
}

export async function atualizar(id, { nome }) {
  await garantirExistencia(id);
  return prisma.curso.update({
    where: { id },
    data: { nome },
  });
}

export async function remover(id) {
  await garantirExistencia(id);
  // Gate defensivo: nunca apagar um curso que ainda tem estrutura ou turmas vinculadas.
  // Coordenador precisa primeiro desmontar manualmente.
  const [fases, turmas] = await Promise.all([
    prisma.fase.count({ where: { cursoId: id } }),
    prisma.turma.count({ where: { cursoId: id } }),
  ]);
  if (fases > 0 || turmas > 0) {
    throw new AppError(
      `curso possui ${fases} fase(s) e ${turmas} turma(s) vinculadas — remova-as antes`,
      409
    );
  }
  await prisma.curso.delete({ where: { id } });
}

async function garantirExistencia(id) {
  const existe = await prisma.curso.findUnique({ where: { id }, select: { id: true } });
  if (!existe) throw new AppError('curso não encontrado', 404);
}

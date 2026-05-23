import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';

export async function criar(faseId, { nome, obrigatorio }) {
  await garantirFase(faseId);
  return prisma.tipoDocumento.create({
    data: { faseId, nome, obrigatorio },
  });
}

export async function listarPorFase(faseId) {
  await garantirFase(faseId);
  return prisma.tipoDocumento.findMany({
    where: { faseId },
    orderBy: { nome: 'asc' },
  });
}

export async function buscarPorId(id) {
  const tipo = await prisma.tipoDocumento.findUnique({ where: { id } });
  if (!tipo) throw new AppError('tipo de documento não encontrado', 404);
  return tipo;
}

export async function atualizar(id, { nome, obrigatorio }) {
  await garantirTipo(id);
  return prisma.tipoDocumento.update({
    where: { id },
    data: { nome, obrigatorio },
  });
}

export async function remover(id) {
  await garantirTipo(id);
  // Gate crítico: nunca apagar um tipo que já foi usado em fluxo real.
  // A regra de imutabilidade (CLAUDE.md 2.3) só faz sentido se a definição
  // do que foi enviado também sobrevive.
  const documentos = await prisma.documento.count({ where: { tipoDocumentoId: id } });
  if (documentos > 0) {
    throw new AppError(
      `tipo possui ${documentos} documento(s) já enviado(s) — não pode ser removido`,
      409
    );
  }
  await prisma.tipoDocumento.delete({ where: { id } });
}

async function garantirFase(faseId) {
  const f = await prisma.fase.findUnique({ where: { id: faseId }, select: { id: true } });
  if (!f) throw new AppError('fase não encontrada', 404);
}

async function garantirTipo(id) {
  const t = await prisma.tipoDocumento.findUnique({ where: { id }, select: { id: true } });
  if (!t) throw new AppError('tipo de documento não encontrado', 404);
}

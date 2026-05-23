import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';

export async function criar(dados) {
  return prisma.empresa.create({ data: dados });
}

export async function listar() {
  return prisma.empresa.findMany({ orderBy: { razaoSocial: 'asc' } });
}

export async function buscarPorId(id) {
  const empresa = await prisma.empresa.findUnique({ where: { id } });
  if (!empresa) throw new AppError('empresa não encontrada', 404);
  return empresa;
}

export async function atualizar(id, dados) {
  await garantirEmpresa(id);
  return prisma.empresa.update({ where: { id }, data: dados });
}

export async function remover(id) {
  await garantirEmpresa(id);
  const estagios = await prisma.estagio.count({ where: { empresaId: id } });
  if (estagios > 0) {
    throw new AppError(`empresa possui ${estagios} estágio(s) vinculado(s)`, 409);
  }
  await prisma.empresa.delete({ where: { id } });
}

async function garantirEmpresa(id) {
  const e = await prisma.empresa.findUnique({ where: { id }, select: { id: true } });
  if (!e) throw new AppError('empresa não encontrada', 404);
}

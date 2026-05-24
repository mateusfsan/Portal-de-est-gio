import { prisma } from '../../lib/prisma.js';

// Select público — nunca devolver senhaHash.
const publicSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  ra: true,
  fotoUrl: true,
};

export async function listar({ papel } = {}) {
  return prisma.usuario.findMany({
    where: papel ? { papel } : undefined,
    orderBy: { nome: 'asc' },
    select: publicSelect,
  });
}

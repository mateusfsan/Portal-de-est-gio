import { PrismaClient } from '@prisma/client';

// Instância única do Prisma para o processo inteiro.
// O `globalThis` evita criar várias conexões quando o `node --watch` recarrega o módulo em dev.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

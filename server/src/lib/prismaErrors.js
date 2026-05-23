import { Prisma } from '@prisma/client';
import { AppError } from './appError.js';

/**
 * Traduz erros conhecidos do Prisma em AppError com a mensagem certa.
 * Centraliza o que senão viraria um switch repetido em cada service.
 *
 * Uso:
 *   try { await prisma.x.create(...) }
 *   catch (err) { throw mapearErroPrisma(err, { p2002: 'nome já existe' }) }
 *
 * Se o erro não for um dos conhecidos, devolve o mesmo erro para subir ao errorHandler.
 *
 * @param {unknown} err
 * @param {{ p2002?: string, p2025?: string }} mensagens
 */
export function mapearErroPrisma(err, mensagens = {}) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return new AppError(mensagens.p2002 ?? 'recurso duplicado', 409);
    }
    if (err.code === 'P2025') {
      return new AppError(mensagens.p2025 ?? 'recurso não encontrado', 404);
    }
  }
  return err;
}

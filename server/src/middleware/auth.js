import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/appError.js';

// Lê o JWT do header Authorization, carrega o usuário do banco e o injeta em req.usuario.
// Buscar do banco a cada request (em vez de confiar só no payload) garante que mudanças
// de papel ou exclusão de conta tenham efeito imediato.
export async function auth(req, _res, next) {
  try {
    const header = req.headers.authorization ?? '';
    const [tipo, token] = header.split(' ');

    if (tipo !== 'Bearer' || !token) {
      throw new AppError('token ausente ou inválido', 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError('token inválido ou expirado', 401);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: { id: true, nome: true, email: true, papel: true, ra: true },
    });

    if (!usuario) {
      throw new AppError('usuário não encontrado', 401);
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    next(err);
  }
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';
import { env } from '../../config/env.js';

// 10 rounds é o padrão recomendado: forte o suficiente sem custo proibitivo no login.
const BCRYPT_ROUNDS = 10;

// `select` reutilizado para nunca devolver senhaHash em nenhuma resposta.
const usuarioSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  ra: true,
  fotoUrl: true,
  criadoEm: true,
};

export async function registrar({ nome, email, senha, papel, ra }) {
  const jaExiste = await prisma.usuario.findUnique({ where: { email } });
  if (jaExiste) {
    throw new AppError('email já cadastrado', 409);
  }

  if (ra) {
    const raEmUso = await prisma.usuario.findUnique({ where: { ra } });
    if (raEmUso) {
      throw new AppError('ra já cadastrado', 409);
    }
  }

  const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash, papel, ra: ra ?? null },
    select: usuarioSelect,
  });

  return usuario;
}

export async function login({ email, senha }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  // Mensagem genérica de propósito: não revelamos se o email existe ou não.
  if (!usuario) {
    throw new AppError('credenciais inválidas', 401);
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaConfere) {
    throw new AppError('credenciais inválidas', 401);
  }

  const token = jwt.sign(
    { sub: usuario.id, papel: usuario.papel },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  // Reconsulta com o select público para não vazar senhaHash.
  const usuarioPublico = await prisma.usuario.findUnique({
    where: { id: usuario.id },
    select: usuarioSelect,
  });

  return { token, usuario: usuarioPublico };
}

export async function buscarMe(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: usuarioSelect,
  });
  if (!usuario) {
    throw new AppError('usuário não encontrado', 404);
  }
  return usuario;
}

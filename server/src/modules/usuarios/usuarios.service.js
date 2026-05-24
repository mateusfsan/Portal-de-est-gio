import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';
import { mapearErroPrisma } from '../../lib/prismaErrors.js';
import { cloudinary } from '../../config/cloudinary.js';

const BCRYPT_ROUNDS = 10;

// Select público — nunca devolver senhaHash.
const publicSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  ra: true,
  fotoUrl: true,
  criadoEm: true,
};

export async function listar({ papel } = {}) {
  return prisma.usuario.findMany({
    where: papel ? { papel } : undefined,
    orderBy: { nome: 'asc' },
    select: publicSelect,
  });
}

export async function criar({ nome, email, senha, papel, ra }, arquivoFoto) {
  const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);

  let usuario;
  try {
    usuario = await prisma.usuario.create({
      data: { nome, email, senhaHash, papel, ra: ra ?? null },
      select: publicSelect,
    });
  } catch (err) {
    throw mapearErroPrisma(err, { p2002: 'email ou ra já cadastrado' });
  }

  // Upload da foto DEPOIS do create — precisamos do id do usuário no path
  // do Cloudinary. Se o upload falhar, o usuário existe sem foto (estado
  // aceitável; coord pode tentar de novo editando).
  if (arquivoFoto) {
    const url = await uploadAvatarCloudinary(usuario.id, arquivoFoto);
    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { fotoUrl: url },
      select: publicSelect,
    });
  }

  return usuario;
}

export async function atualizar(id, { nome, email, papel, ra, novaSenha }, arquivoFoto, autor) {
  const alvo = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, papel: true },
  });
  if (!alvo) throw new AppError('usuário não encontrado', 404);

  // Coord não pode rebaixar a si mesmo — evita travar o sistema sem coord.
  if (autor.id === alvo.id && alvo.papel === 'coordenador' && papel !== 'coordenador') {
    throw new AppError('não pode rebaixar o próprio coordenador', 400);
  }

  const data = {
    nome,
    email,
    papel,
    ra: papel === 'aluno' ? ra : null,
  };
  if (novaSenha && novaSenha.length > 0) {
    data.senhaHash = await bcrypt.hash(novaSenha, BCRYPT_ROUNDS);
  }

  let usuario;
  try {
    usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: publicSelect,
    });
  } catch (err) {
    throw mapearErroPrisma(err, { p2002: 'email ou ra já cadastrado' });
  }

  if (arquivoFoto) {
    const url = await uploadAvatarCloudinary(id, arquivoFoto);
    usuario = await prisma.usuario.update({
      where: { id },
      data: { fotoUrl: url },
      select: publicSelect,
    });
  }

  return usuario;
}

export async function remover(id, autor) {
  if (autor.id === id) {
    throw new AppError('não pode deletar a própria conta', 400);
  }

  const alvo = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!alvo) throw new AppError('usuário não encontrado', 404);

  // Gates de dependência: preservam auditoria e integridade referencial.
  const [estagios, turmas, pareceres] = await Promise.all([
    prisma.estagio.count({ where: { alunoId: id } }),
    prisma.turma.count({ where: { orientadorId: id } }),
    prisma.parecer.count({ where: { autorId: id } }),
  ]);
  if (estagios > 0) throw new AppError(`usuário possui ${estagios} estágio(s) vinculado(s)`, 409);
  if (turmas > 0) throw new AppError(`usuário orienta ${turmas} turma(s)`, 409);
  if (pareceres > 0) throw new AppError(`usuário tem ${pareceres} parecer(es) autorado(s) — não pode ser removido (auditoria)`, 409);

  await prisma.usuario.delete({ where: { id } });
}

// Sobe a foto com `public_id` fixo `avatar` dentro de uma pasta por usuário.
// `overwrite: true` faz com que novos uploads SOBRESCREVAM o anterior,
// mantendo a URL canônica do avatar (não acumula lixo no Cloudinary).
async function uploadAvatarCloudinary(userId, arquivo) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `portal-estagio/usuarios/${userId}`,
        public_id: 'avatar',
        overwrite: true,
        resource_type: 'image',
      },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(arquivo.buffer);
  });
}

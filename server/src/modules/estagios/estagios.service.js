import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/appError.js';
import { calcularFaseAtual as calcular } from '../../lib/calcularFaseAtual.js';

// `include` reutilizado: nunca devolver senhaHash do orientador/aluno;
// trazer curso/turma/empresa para o cliente exibir contexto sem N+1.
const estagioInclude = {
  aluno: {
    select: { id: true, nome: true, email: true, papel: true, ra: true, fotoUrl: true },
  },
  turma: {
    include: {
      curso: true,
      orientador: { select: { id: true, nome: true, email: true, papel: true } },
    },
  },
  empresa: true,
};

export async function criar({ alunoId, turmaId, empresaId, inicio }) {
  await garantirAluno(alunoId);
  await garantirTurma(turmaId);
  await garantirEmpresa(empresaId);

  // Evitar duplicidade: um aluno só pode ter um estágio ativo por turma.
  // (Não bloqueia "ter outro estágio em turma diferente", que é válido.)
  const jaExiste = await prisma.estagio.findFirst({
    where: { alunoId, turmaId },
    select: { id: true },
  });
  if (jaExiste) {
    throw new AppError('aluno já possui estágio nessa turma', 409);
  }

  return prisma.estagio.create({
    data: { alunoId, turmaId, empresaId, inicio },
    include: estagioInclude,
  });
}

export async function listar({ turmaId, alunoId } = {}) {
  return prisma.estagio.findMany({
    where: {
      ...(turmaId && { turmaId }),
      ...(alunoId && { alunoId }),
    },
    orderBy: [{ inicio: 'desc' }],
    include: estagioInclude,
  });
}

export async function buscarPorId(id, usuario) {
  await assegurarAcesso(id, usuario);
  return prisma.estagio.findUnique({
    where: { id },
    include: estagioInclude,
  });
}

export async function listarDoAluno(alunoId) {
  return prisma.estagio.findMany({
    where: { alunoId },
    orderBy: [{ inicio: 'desc' }],
    include: estagioInclude,
  });
}

export async function atualizar(id, { empresaId, inicio }) {
  await garantirEstagio(id);
  await garantirEmpresa(empresaId);
  return prisma.estagio.update({
    where: { id },
    data: { empresaId, inicio },
    include: estagioInclude,
  });
}

export async function remover(id) {
  await garantirEstagio(id);
  const documentos = await prisma.documento.count({ where: { estagioId: id } });
  if (documentos > 0) {
    throw new AppError(`estágio possui ${documentos} documento(s) — não pode ser removido`, 409);
  }
  await prisma.estagio.delete({ where: { id } });
}

/**
 * Verifica se `usuario` pode acessar o estágio `id`. Será reutilizado por
 * documentos (3.2/3.3) — é o gate de autorização por relacionamento, que
 * complementa o RBAC por papel.
 *
 * Regras:
 *   - coordenador: pode tudo.
 *   - orientador: precisa ser o orientador da turma do estágio.
 *   - aluno: precisa ser o aluno do estágio.
 *
 * Lança AppError 404 se o estágio nem existe (não revelamos existência
 * para usuário sem acesso) ou 403 se existe mas não tem permissão.
 */
export async function assegurarAcesso(estagioId, usuario) {
  const estagio = await prisma.estagio.findUnique({
    where: { id: estagioId },
    select: { id: true, alunoId: true, turma: { select: { orientadorId: true } } },
  });
  if (!estagio) throw new AppError('estágio não encontrado', 404);

  if (usuario.papel === 'coordenador') return estagio;
  if (usuario.papel === 'orientador' && estagio.turma.orientadorId === usuario.id) return estagio;
  if (usuario.papel === 'aluno' && estagio.alunoId === usuario.id) return estagio;

  throw new AppError('acesso negado', 403);
}

/**
 * Wrapper sobre lib/calcularFaseAtual com checagem de acesso.
 * Reusa `assegurarAcesso` para que aluno/orientador só vejam a fase
 * atual dos estágios que podem acessar.
 */
export async function faseAtual(estagioId, usuario) {
  await assegurarAcesso(estagioId, usuario);
  return calcular(estagioId);
}

async function garantirEstagio(id) {
  const e = await prisma.estagio.findUnique({ where: { id }, select: { id: true } });
  if (!e) throw new AppError('estágio não encontrado', 404);
}

async function garantirAluno(alunoId) {
  const u = await prisma.usuario.findUnique({
    where: { id: alunoId },
    select: { id: true, papel: true },
  });
  if (!u) throw new AppError('aluno não encontrado', 404);
  if (u.papel !== 'aluno') {
    throw new AppError('usuário não tem papel aluno', 409);
  }
}

async function garantirTurma(turmaId) {
  const t = await prisma.turma.findUnique({ where: { id: turmaId }, select: { id: true } });
  if (!t) throw new AppError('turma não encontrada', 404);
}

async function garantirEmpresa(empresaId) {
  const e = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { id: true } });
  if (!e) throw new AppError('empresa não encontrada', 404);
}

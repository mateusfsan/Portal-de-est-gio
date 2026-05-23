import { z } from 'zod';

export const idParam = z.object({
  id: z.string().uuid('id inválido'),
});

export const listarQuery = z.object({
  turmaId: z.string().uuid().optional(),
  alunoId: z.string().uuid().optional(),
});

export const criarEstagioSchema = z.object({
  alunoId: z.string().uuid('alunoId inválido'),
  turmaId: z.string().uuid('turmaId inválido'),
  empresaId: z.string().uuid('empresaId inválido'),
  inicio: z.coerce.date(),
});

// aluno e turma são imutáveis após criação — mudar isso quebraria o histórico
// de documentos vinculados ao estágio.
export const atualizarEstagioSchema = z.object({
  empresaId: z.string().uuid('empresaId inválido'),
  inicio: z.coerce.date(),
});

import { z } from 'zod';

const periodo = z
  .string()
  .trim()
  .min(4, 'período inválido (ex.: "2026/1")')
  .max(20);

export const idParam = z.object({
  id: z.string().uuid('id inválido'),
});

export const listarQuery = z.object({
  cursoId: z.string().uuid().optional(),
});

export const criarTurmaSchema = z.object({
  cursoId: z.string().uuid('cursoId inválido'),
  orientadorId: z.string().uuid('orientadorId inválido'),
  periodo,
});

// cursoId não muda após criação — uma turma "pertence" a um curso.
export const atualizarTurmaSchema = z.object({
  orientadorId: z.string().uuid('orientadorId inválido'),
  periodo,
});

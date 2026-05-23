import { z } from 'zod';

const nomeCurso = z.string().trim().min(2, 'nome deve ter pelo menos 2 caracteres').max(120);

export const idParam = z.object({
  id: z.string().uuid('id inválido'),
});

export const criarCursoSchema = z.object({
  nome: nomeCurso,
});

export const atualizarCursoSchema = z.object({
  nome: nomeCurso,
});

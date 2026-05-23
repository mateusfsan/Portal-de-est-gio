import { z } from 'zod';

const nomeTipo = z.string().trim().min(2, 'nome deve ter pelo menos 2 caracteres').max(120);

export const idParam = z.object({
  id: z.string().uuid('id inválido'),
});

export const faseIdParam = z.object({
  faseId: z.string().uuid('faseId inválido'),
});

export const criarTipoSchema = z.object({
  nome: nomeTipo,
  obrigatorio: z.boolean().optional().default(true),
});

export const atualizarTipoSchema = z.object({
  nome: nomeTipo,
  obrigatorio: z.boolean(),
});

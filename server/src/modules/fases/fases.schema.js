import { z } from 'zod';

const nomeFase = z.string().trim().min(2, 'nome deve ter pelo menos 2 caracteres').max(120);
const ordemFase = z.number().int().positive('ordem deve ser um inteiro positivo');

export const idParam = z.object({
  id: z.string().uuid('id inválido'),
});

export const cursoIdParam = z.object({
  cursoId: z.string().uuid('cursoId inválido'),
});

export const criarFaseSchema = z.object({
  nome: nomeFase,
  ordem: ordemFase,
});

export const atualizarFaseSchema = z.object({
  nome: nomeFase,
});

export const reordenarSchema = z
  .object({
    ordens: z
      .array(
        z.object({
          id: z.string().uuid('id inválido'),
          ordem: ordemFase,
        })
      )
      .min(1, 'forneça ao menos uma fase'),
  })
  .refine(
    // IDs únicos no payload.
    (data) => new Set(data.ordens.map((o) => o.id)).size === data.ordens.length,
    { message: 'ids duplicados no payload', path: ['ordens'] }
  )
  .refine(
    // Ordens únicas no payload (a transação cuida do swap, mas duplicar no input é erro lógico).
    (data) => new Set(data.ordens.map((o) => o.ordem)).size === data.ordens.length,
    { message: 'ordens duplicadas no payload', path: ['ordens'] }
  );

import { z } from 'zod';

export const listarQuery = z.object({
  papel: z.enum(['aluno', 'orientador', 'coordenador']).optional(),
});

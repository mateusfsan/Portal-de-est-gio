import { z } from 'zod';

const papelEnum = z.enum(['aluno', 'orientador', 'coordenador']);

export const registerSchema = z
  .object({
    nome: z.string().trim().min(2, 'nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('email inválido').toLowerCase(),
    senha: z.string().min(8, 'senha deve ter pelo menos 8 caracteres'),
    papel: papelEnum,
    // RA é opcional no schema, mas obrigatório para alunos — checado no refine abaixo.
    ra: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.papel !== 'aluno' || !!data.ra, {
    message: 'ra é obrigatório quando papel é aluno',
    path: ['ra'],
  });

export const loginSchema = z.object({
  email: z.string().email('email inválido').toLowerCase(),
  senha: z.string().min(1, 'senha é obrigatória'),
});

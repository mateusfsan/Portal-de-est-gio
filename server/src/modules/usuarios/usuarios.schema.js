import { z } from 'zod';

const papelEnum = z.enum(['aluno', 'orientador', 'coordenador']);

export const idParam = z.object({
  id: z.string().uuid('id inválido'),
});

export const listarQuery = z.object({
  papel: papelEnum.optional(),
});

// Body do POST /api/usuarios. Aceita JSON ou multipart; ambos chegam
// como string nos campos (multer não converte). RA é obrigatório se aluno.
export const criarSchema = z
  .object({
    nome: z.string().trim().min(2, 'nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('email inválido').toLowerCase(),
    senha: z.string().min(8, 'senha deve ter pelo menos 8 caracteres'),
    papel: papelEnum,
    ra: z.string().trim().min(1).optional(),
  })
  .refine((d) => d.papel !== 'aluno' || !!d.ra, {
    message: 'ra é obrigatório quando papel é aluno',
    path: ['ra'],
  });

// PUT: novaSenha é opcional (se vazia, preserva). Aceita string vazia
// porque multipart manda "" e não undefined para campos não preenchidos.
export const atualizarSchema = z
  .object({
    nome: z.string().trim().min(2),
    email: z.string().email().toLowerCase(),
    papel: papelEnum,
    ra: z.string().trim().min(1).optional().or(z.literal('')),
    novaSenha: z.string().min(8).optional().or(z.literal('')),
  })
  .refine((d) => d.papel !== 'aluno' || (d.ra && d.ra.length > 0), {
    message: 'ra é obrigatório quando papel é aluno',
    path: ['ra'],
  });

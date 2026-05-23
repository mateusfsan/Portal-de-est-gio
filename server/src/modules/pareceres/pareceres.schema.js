import { z } from 'zod';

// Body do POST /api/documentos/:id/parecer.
// Comentário é obrigatório SEMPRE — mesmo numa aprovação o orientador
// pode (e deve) escrever feedback.
export const criarParecerSchema = z.object({
  decisao: z.enum(['aprovado', 'reprovado']),
  comentario: z.string().trim().min(3, 'comentário deve ter pelo menos 3 caracteres').max(2000),
});

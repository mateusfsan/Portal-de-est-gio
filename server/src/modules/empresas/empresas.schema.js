import { z } from 'zod';

const empresaBody = z.object({
  razaoSocial: z.string().trim().min(2, 'razão social deve ter pelo menos 2 caracteres').max(160),
  supervisorNome: z.string().trim().min(2, 'nome do supervisor deve ter pelo menos 2 caracteres'),
  supervisorEmail: z.string().email('email do supervisor inválido').toLowerCase(),
});

export const idParam = z.object({
  id: z.string().uuid('id inválido'),
});

export const criarEmpresaSchema = empresaBody;
export const atualizarEmpresaSchema = empresaBody;

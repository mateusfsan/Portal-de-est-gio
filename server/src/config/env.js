import 'dotenv/config';
import { z } from 'zod';

// Validar env no boot faz o servidor falhar cedo e claro,
// em vez de quebrar dentro de uma rota meses depois.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Cloudinary — credenciais para upload de arquivos (PDF + imagens).
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME é obrigatória'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY é obrigatória'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET é obrigatória'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

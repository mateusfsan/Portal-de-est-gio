import { z } from 'zod';

export const idParam = z.object({
  id: z.string().uuid('id inválido'),
});

export const estagioIdParam = z.object({
  estagioId: z.string().uuid('estagioId inválido'),
});

// O body do upload chega via multipart/form-data — multer parseia.
// O `tipoDocumentoId` é um form field comum (string).
export const uploadBodySchema = z.object({
  tipoDocumentoId: z.string().uuid('tipoDocumentoId inválido'),
});

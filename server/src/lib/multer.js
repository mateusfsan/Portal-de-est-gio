import multer from 'multer';
import { AppError } from './appError.js';

// Tipos MIME aceitos para documentos do portal.
// O CLAUDE.md 8.3 + decisão da etapa 3: PDF + imagens (JPG/PNG).
const MIMES_PERMITIDOS = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const LIMITE_BYTES = 10 * 1024 * 1024; // 10 MB

// `memoryStorage` mantém o arquivo em RAM como Buffer. Bom porque vamos
// repassar direto para o Cloudinary via stream — não toca em disco local.
export const uploadDocumento = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (MIMES_PERMITIDOS.has(file.mimetype)) {
      cb(null, true);
    } else {
      // AppError vira 400 no errorHandler central.
      cb(new AppError(`tipo de arquivo não permitido: ${file.mimetype}`, 400));
    }
  },
});

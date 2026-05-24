import multer from 'multer';
import { AppError } from './appError.js';

// Tipos MIME aceitos para DOCUMENTOS do portal (PDF + imagens).
const MIMES_DOCUMENTO = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

// AVATARES só aceitam imagem (sem PDF). Limite menor — 2 MB é folgado
// para foto de perfil e evita upload acidental de imagens enormes.
const MIMES_AVATAR = new Set([
  'image/jpeg',
  'image/png',
]);

const LIMITE_DOCUMENTO = 10 * 1024 * 1024; // 10 MB
const LIMITE_AVATAR = 2 * 1024 * 1024;     // 2 MB

// `memoryStorage` mantém o arquivo em RAM como Buffer. Bom porque vamos
// repassar direto para o Cloudinary via stream — não toca em disco local.
export const uploadDocumento = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_DOCUMENTO },
  fileFilter: (_req, file, cb) => {
    if (MIMES_DOCUMENTO.has(file.mimetype)) {
      cb(null, true);
    } else {
      // AppError vira 400 no errorHandler central.
      cb(new AppError(`tipo de arquivo não permitido: ${file.mimetype}`, 400));
    }
  },
});

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_AVATAR },
  fileFilter: (_req, file, cb) => {
    if (MIMES_AVATAR.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`avatar deve ser image/jpeg ou image/png (recebido: ${file.mimetype})`, 400));
    }
  },
});

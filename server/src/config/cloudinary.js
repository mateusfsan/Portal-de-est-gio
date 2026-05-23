import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

// Configura a SDK uma única vez no boot. Todas as chamadas subsequentes
// (uploader.upload_stream, etc.) reusam essa configuração.
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true, // sempre usar HTTPS nas URLs
});

export { cloudinary };

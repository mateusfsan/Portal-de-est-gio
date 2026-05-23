import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function criarApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Healthcheck simples para verificar que o servidor está de pé.
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);

  // Handler de erros precisa ser registrado por último.
  app.use(errorHandler);

  return app;
}

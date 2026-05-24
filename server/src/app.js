import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import cursosRoutes from './modules/cursos/cursos.routes.js';
import fasesRoutes from './modules/fases/fases.routes.js';
import tiposDocumentoRoutes from './modules/tipos-documento/tiposDocumento.routes.js';
import empresasRoutes from './modules/empresas/empresas.routes.js';
import turmasRoutes from './modules/turmas/turmas.routes.js';
import estagiosRoutes from './modules/estagios/estagios.routes.js';
import documentosRoutes from './modules/documentos/documentos.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';
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
  app.use('/api/cursos', cursosRoutes);
  // Os routers abaixo declaram o prefixo aninhado internamente
  // (ex.: `/cursos/:cursoId/fases`), por isso montam em `/api`.
  app.use('/api', fasesRoutes);
  app.use('/api', tiposDocumentoRoutes);
  app.use('/api/empresas', empresasRoutes);
  app.use('/api/turmas', turmasRoutes);
  app.use('/api/estagios', estagiosRoutes);
  // Documentos expõe paths em /estagios/:estagioId/documentos E /documentos/:id.
  app.use('/api', documentosRoutes);
  app.use('/api/usuarios', usuariosRoutes);

  // Handler de erros precisa ser registrado por último.
  app.use(errorHandler);

  return app;
}

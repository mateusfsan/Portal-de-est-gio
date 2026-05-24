import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

const router = Router();

// /register é o cadastro JSON sem foto, restrito a coordenador. Existia
// antes do módulo `usuarios` (sub-etapa 4.6) — mantido protegido para
// scripts/curl. A UI usa POST /api/usuarios (multipart, com foto).
router.post(
  '/register',
  auth,
  exigePapel('coordenador'),
  validate({ body: registerSchema }),
  authController.registrar
);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.get('/me', auth, authController.me);

export default router;

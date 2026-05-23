import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  atualizarFaseSchema,
  criarFaseSchema,
  cursoIdParam,
  idParam,
  reordenarSchema,
} from './fases.schema.js';
import * as fasesController from './fases.controller.js';

const router = Router();

// Auth/RBAC vão APLICADOS POR ROTA — não como `router.use(...)` global.
// Este router está montado em `/api` (porque tem paths aninhados em /cursos
// e em /fases), então um middleware global rodaria para qualquer URL /api/*,
// inclusive de outros módulos (descoberto bloqueando /api/estagios/me).
const guards = [auth, exigePapel('coordenador')];

// Rotas aninhadas em curso — criação, listagem e reordenação.
router.post(
  '/cursos/:cursoId/fases',
  ...guards,
  validate({ params: cursoIdParam, body: criarFaseSchema }),
  fasesController.criar
);
router.get(
  '/cursos/:cursoId/fases',
  ...guards,
  validate({ params: cursoIdParam }),
  fasesController.listarPorCurso
);
router.patch(
  '/cursos/:cursoId/fases/ordem',
  ...guards,
  validate({ params: cursoIdParam, body: reordenarSchema }),
  fasesController.reordenar
);

// Operações por ID ficam no recurso raiz.
router.get('/fases/:id', ...guards, validate({ params: idParam }), fasesController.buscarPorId);
router.put(
  '/fases/:id',
  ...guards,
  validate({ params: idParam, body: atualizarFaseSchema }),
  fasesController.atualizar
);
router.delete('/fases/:id', ...guards, validate({ params: idParam }), fasesController.remover);

export default router;

import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  atualizarTipoSchema,
  criarTipoSchema,
  faseIdParam,
  idParam,
} from './tiposDocumento.schema.js';
import * as tiposController from './tiposDocumento.controller.js';

const router = Router();

// Por que `guards` por rota em vez de `router.use(...)` global:
// este router está montado em `/api` (porque expõe paths aninhados em
// /fases e em /tipos-documento), e middlewares globais aqui rodariam
// para qualquer URL /api/*, derrubando rotas de outros módulos.
const guards = [auth, exigePapel('coordenador')];

// Aninhado em fase para criação e listagem.
router.post(
  '/fases/:faseId/tipos',
  ...guards,
  validate({ params: faseIdParam, body: criarTipoSchema }),
  tiposController.criar
);
router.get(
  '/fases/:faseId/tipos',
  ...guards,
  validate({ params: faseIdParam }),
  tiposController.listarPorFase
);

// Operações por ID no recurso raiz.
router.get('/tipos-documento/:id', ...guards, validate({ params: idParam }), tiposController.buscarPorId);
router.put(
  '/tipos-documento/:id',
  ...guards,
  validate({ params: idParam, body: atualizarTipoSchema }),
  tiposController.atualizar
);
router.delete('/tipos-documento/:id', ...guards, validate({ params: idParam }), tiposController.remover);

export default router;

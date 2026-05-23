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

router.use(auth, exigePapel('coordenador'));

// Aninhado em fase para criação e listagem.
router.post(
  '/fases/:faseId/tipos',
  validate({ params: faseIdParam, body: criarTipoSchema }),
  tiposController.criar
);
router.get(
  '/fases/:faseId/tipos',
  validate({ params: faseIdParam }),
  tiposController.listarPorFase
);

// Operações por ID no recurso raiz.
router.get('/tipos-documento/:id', validate({ params: idParam }), tiposController.buscarPorId);
router.put(
  '/tipos-documento/:id',
  validate({ params: idParam, body: atualizarTipoSchema }),
  tiposController.atualizar
);
router.delete('/tipos-documento/:id', validate({ params: idParam }), tiposController.remover);

export default router;

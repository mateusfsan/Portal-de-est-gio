import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  atualizarTurmaSchema,
  criarTurmaSchema,
  idParam,
  listarQuery,
} from './turmas.schema.js';
import * as turmasController from './turmas.controller.js';

const router = Router();

router.use(auth, exigePapel('coordenador'));

router.post('/', validate({ body: criarTurmaSchema }), turmasController.criar);
router.get('/', validate({ query: listarQuery }), turmasController.listar);
router.get('/:id', validate({ params: idParam }), turmasController.buscarPorId);
router.put(
  '/:id',
  validate({ params: idParam, body: atualizarTurmaSchema }),
  turmasController.atualizar
);
router.delete('/:id', validate({ params: idParam }), turmasController.remover);

export default router;

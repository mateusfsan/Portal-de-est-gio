import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  atualizarEmpresaSchema,
  criarEmpresaSchema,
  idParam,
} from './empresas.schema.js';
import * as empresasController from './empresas.controller.js';

const router = Router();

router.use(auth, exigePapel('coordenador'));

router.post('/', validate({ body: criarEmpresaSchema }), empresasController.criar);
router.get('/', empresasController.listar);
router.get('/:id', validate({ params: idParam }), empresasController.buscarPorId);
router.put(
  '/:id',
  validate({ params: idParam, body: atualizarEmpresaSchema }),
  empresasController.atualizar
);
router.delete('/:id', validate({ params: idParam }), empresasController.remover);

export default router;

import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { atualizarCursoSchema, criarCursoSchema, idParam } from './cursos.schema.js';
import * as cursosController from './cursos.controller.js';

const router = Router();

// Toda configuração é privilégio do coordenador.
router.use(auth, exigePapel('coordenador'));

router.post('/', validate({ body: criarCursoSchema }), cursosController.criar);
router.get('/', cursosController.listar);
router.get('/:id', validate({ params: idParam }), cursosController.buscarPorId);
router.put(
  '/:id',
  validate({ params: idParam, body: atualizarCursoSchema }),
  cursosController.atualizar
);
router.delete('/:id', validate({ params: idParam }), cursosController.remover);

export default router;

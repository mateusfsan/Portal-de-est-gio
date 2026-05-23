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

router.use(auth, exigePapel('coordenador'));

// Rotas aninhadas em curso — criação, listagem e reordenação.
// `mergeParams` deixaria o aninhamento mais limpo; aqui montamos o path completo
// para manter cada router auto-contido (não depende de quem o monta).
router.post(
  '/cursos/:cursoId/fases',
  validate({ params: cursoIdParam, body: criarFaseSchema }),
  fasesController.criar
);
router.get(
  '/cursos/:cursoId/fases',
  validate({ params: cursoIdParam }),
  fasesController.listarPorCurso
);
router.patch(
  '/cursos/:cursoId/fases/ordem',
  validate({ params: cursoIdParam, body: reordenarSchema }),
  fasesController.reordenar
);

// Operações por ID ficam no recurso raiz.
router.get('/fases/:id', validate({ params: idParam }), fasesController.buscarPorId);
router.put(
  '/fases/:id',
  validate({ params: idParam, body: atualizarFaseSchema }),
  fasesController.atualizar
);
router.delete('/fases/:id', validate({ params: idParam }), fasesController.remover);

export default router;

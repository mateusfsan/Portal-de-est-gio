import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  atualizarEstagioSchema,
  criarEstagioSchema,
  idParam,
  listarQuery,
} from './estagios.schema.js';
import * as estagiosController from './estagios.controller.js';

const router = Router();

router.use(auth);

// "/me" precisa vir ANTES de "/:id" — senão o Express interpretaria "me" como id.
// Acessível ao papel `aluno` apenas; coordenador/orientador veem via /api/estagios.
router.get('/me', exigePapel('aluno'), estagiosController.listarMeus);

// Endpoints só do coordenador (criar, listar todos, atualizar, remover).
router.post(
  '/',
  exigePapel('coordenador'),
  validate({ body: criarEstagioSchema }),
  estagiosController.criar
);
router.get('/', exigePapel('coordenador'), validate({ query: listarQuery }), estagiosController.listar);
router.put(
  '/:id',
  exigePapel('coordenador'),
  validate({ params: idParam, body: atualizarEstagioSchema }),
  estagiosController.atualizar
);
router.delete(
  '/:id',
  exigePapel('coordenador'),
  validate({ params: idParam }),
  estagiosController.remover
);

// GET /:id liberado para os 3 papéis — o service faz a checagem de propriedade.
router.get('/:id', validate({ params: idParam }), estagiosController.buscarPorId);

// Fase atual DERIVADA. Mesma regra de acesso do GET /:id.
// IMPORTANTE: este endpoint NUNCA persiste; sempre recalcula (CLAUDE.md 2.4).
router.get('/:id/fase-atual', validate({ params: idParam }), estagiosController.faseAtual);

export default router;

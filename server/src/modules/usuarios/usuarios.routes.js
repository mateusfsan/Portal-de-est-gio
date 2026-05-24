import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { listarQuery } from './usuarios.schema.js';
import * as usuariosController from './usuarios.controller.js';

const router = Router();

// Apenas coordenador lista usuários (popula dropdowns das telas
// de Turma e Estágio).
router.use(auth, exigePapel('coordenador'));
router.get('/', validate({ query: listarQuery }), usuariosController.listar);

export default router;

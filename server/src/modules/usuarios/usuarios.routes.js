import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { exigePapel } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { uploadAvatar } from '../../lib/multer.js';
import {
  atualizarSchema,
  criarSchema,
  idParam,
  listarQuery,
} from './usuarios.schema.js';
import * as usuariosController from './usuarios.controller.js';

const router = Router();

// Todas as rotas exigem coordenador.
router.use(auth, exigePapel('coordenador'));

router.get('/', validate({ query: listarQuery }), usuariosController.listar);

// POST e PUT são multipart porque podem incluir foto.
// `uploadAvatar.single('file')` parseia primeiro; depois o validate
// roda em cima de req.body (que vira objeto de strings).
router.post(
  '/',
  uploadAvatar.single('file'),
  validate({ body: criarSchema }),
  usuariosController.criar
);
router.put(
  '/:id',
  uploadAvatar.single('file'),
  validate({ params: idParam, body: atualizarSchema }),
  usuariosController.atualizar
);
router.delete('/:id', validate({ params: idParam }), usuariosController.remover);

export default router;

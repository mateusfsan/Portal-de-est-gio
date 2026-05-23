import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { uploadDocumento } from '../../lib/multer.js';
import {
  estagioIdParam,
  idParam,
  uploadBodySchema,
} from './documentos.schema.js';
import * as documentosController from './documentos.controller.js';

const router = Router();

// Guards por rota (mesmo motivo do fix em fases/tipos-documento: este router
// está montado em /api e middleware global afetaria outras URLs).
// `auth` é comum a todas as rotas; a checagem fina de quem pode upload/ver
// fica no service (assegurarAcesso) — depende de relacionamento, não só papel.

// Upload de novo documento (cria nova versão automaticamente).
// `uploadDocumento.single('file')` parseia o multipart e injeta req.file + req.body.
router.post(
  '/estagios/:estagioId/documentos',
  auth,
  uploadDocumento.single('file'),
  validate({ params: estagioIdParam, body: uploadBodySchema }),
  documentosController.upload
);

// Listagem por estágio (agrupado por tipo, com todas as versões).
router.get(
  '/estagios/:estagioId/documentos',
  auth,
  validate({ params: estagioIdParam }),
  documentosController.listarPorEstagio
);

// Detalhe de um documento específico.
router.get('/documentos/:id', auth, validate({ params: idParam }), documentosController.buscarPorId);

export default router;

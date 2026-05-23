import * as documentosService from './documentos.service.js';

export async function upload(req, res, next) {
  try {
    const documento = await documentosService.criar({
      estagioId: req.params.estagioId,
      tipoDocumentoId: req.body.tipoDocumentoId,
      arquivo: req.file, // populado por multer
      usuario: req.usuario,
    });
    res.status(201).json({ documento });
  } catch (err) {
    next(err);
  }
}

export async function listarPorEstagio(req, res, next) {
  try {
    const porTipo = await documentosService.listarPorEstagio(
      req.params.estagioId,
      req.usuario
    );
    res.json({ porTipo });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const documento = await documentosService.buscarPorId(req.params.id, req.usuario);
    res.json({ documento });
  } catch (err) {
    next(err);
  }
}

import * as documentosService from './documentos.service.js';
import * as pareceresService from '../pareceres/pareceres.service.js';

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

export async function listarFila(req, res, next) {
  try {
    const documentos = await documentosService.listarFilaDoOrientador(
      req.usuario.id,
      req.query
    );
    res.json({ documentos });
  } catch (err) {
    next(err);
  }
}

export async function darParecer(req, res, next) {
  try {
    const resultado = await pareceresService.criarParecer({
      documentoId: req.params.id,
      autorId: req.usuario.id,
      decisao: req.body.decisao,
      comentario: req.body.comentario,
    });
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

import * as tiposService from './tiposDocumento.service.js';

export async function criar(req, res, next) {
  try {
    const tipo = await tiposService.criar(req.params.faseId, req.body);
    res.status(201).json({ tipo });
  } catch (err) {
    next(err);
  }
}

export async function listarPorFase(req, res, next) {
  try {
    const tipos = await tiposService.listarPorFase(req.params.faseId);
    res.json({ tipos });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const tipo = await tiposService.buscarPorId(req.params.id);
    res.json({ tipo });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const tipo = await tiposService.atualizar(req.params.id, req.body);
    res.json({ tipo });
  } catch (err) {
    next(err);
  }
}

export async function remover(req, res, next) {
  try {
    await tiposService.remover(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

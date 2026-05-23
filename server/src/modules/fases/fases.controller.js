import * as fasesService from './fases.service.js';

export async function criar(req, res, next) {
  try {
    const fase = await fasesService.criar(req.params.cursoId, req.body);
    res.status(201).json({ fase });
  } catch (err) {
    next(err);
  }
}

export async function listarPorCurso(req, res, next) {
  try {
    const fases = await fasesService.listarPorCurso(req.params.cursoId);
    res.json({ fases });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const fase = await fasesService.buscarPorId(req.params.id);
    res.json({ fase });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const fase = await fasesService.atualizar(req.params.id, req.body);
    res.json({ fase });
  } catch (err) {
    next(err);
  }
}

export async function remover(req, res, next) {
  try {
    await fasesService.remover(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function reordenar(req, res, next) {
  try {
    const fases = await fasesService.reordenar(req.params.cursoId, req.body.ordens);
    res.json({ fases });
  } catch (err) {
    next(err);
  }
}

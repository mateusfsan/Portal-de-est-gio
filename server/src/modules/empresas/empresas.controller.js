import * as empresasService from './empresas.service.js';

export async function criar(req, res, next) {
  try {
    const empresa = await empresasService.criar(req.body);
    res.status(201).json({ empresa });
  } catch (err) {
    next(err);
  }
}

export async function listar(_req, res, next) {
  try {
    const empresas = await empresasService.listar();
    res.json({ empresas });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const empresa = await empresasService.buscarPorId(req.params.id);
    res.json({ empresa });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const empresa = await empresasService.atualizar(req.params.id, req.body);
    res.json({ empresa });
  } catch (err) {
    next(err);
  }
}

export async function remover(req, res, next) {
  try {
    await empresasService.remover(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

import * as cursosService from './cursos.service.js';

export async function criar(req, res, next) {
  try {
    const curso = await cursosService.criar(req.body);
    res.status(201).json({ curso });
  } catch (err) {
    next(err);
  }
}

export async function listar(_req, res, next) {
  try {
    const cursos = await cursosService.listar();
    res.json({ cursos });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const curso = await cursosService.buscarPorId(req.params.id);
    res.json({ curso });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const curso = await cursosService.atualizar(req.params.id, req.body);
    res.json({ curso });
  } catch (err) {
    next(err);
  }
}

export async function remover(req, res, next) {
  try {
    await cursosService.remover(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

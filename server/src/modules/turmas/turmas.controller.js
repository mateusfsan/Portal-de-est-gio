import * as turmasService from './turmas.service.js';

export async function criar(req, res, next) {
  try {
    const turma = await turmasService.criar(req.body);
    res.status(201).json({ turma });
  } catch (err) {
    next(err);
  }
}

export async function listar(req, res, next) {
  try {
    const turmas = await turmasService.listar(req.query);
    res.json({ turmas });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const turma = await turmasService.buscarPorId(req.params.id);
    res.json({ turma });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const turma = await turmasService.atualizar(req.params.id, req.body);
    res.json({ turma });
  } catch (err) {
    next(err);
  }
}

export async function remover(req, res, next) {
  try {
    await turmasService.remover(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

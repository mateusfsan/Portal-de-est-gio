import * as estagiosService from './estagios.service.js';

export async function criar(req, res, next) {
  try {
    const estagio = await estagiosService.criar(req.body);
    res.status(201).json({ estagio });
  } catch (err) {
    next(err);
  }
}

export async function listar(req, res, next) {
  try {
    const estagios = await estagiosService.listar(req.query);
    res.json({ estagios });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const estagio = await estagiosService.buscarPorId(req.params.id, req.usuario);
    res.json({ estagio });
  } catch (err) {
    next(err);
  }
}

export async function listarMeus(req, res, next) {
  try {
    const estagios = await estagiosService.listarDoAluno(req.usuario.id);
    res.json({ estagios });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const estagio = await estagiosService.atualizar(req.params.id, req.body);
    res.json({ estagio });
  } catch (err) {
    next(err);
  }
}

export async function remover(req, res, next) {
  try {
    await estagiosService.remover(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function faseAtual(req, res, next) {
  try {
    const resultado = await estagiosService.faseAtual(req.params.id, req.usuario);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

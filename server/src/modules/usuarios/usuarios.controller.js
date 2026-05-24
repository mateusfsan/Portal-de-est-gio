import * as usuariosService from './usuarios.service.js';

export async function listar(req, res, next) {
  try {
    const usuarios = await usuariosService.listar(req.query);
    res.json({ usuarios });
  } catch (err) {
    next(err);
  }
}

export async function criar(req, res, next) {
  try {
    const usuario = await usuariosService.criar(req.body, req.file);
    res.status(201).json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const usuario = await usuariosService.atualizar(
      req.params.id,
      req.body,
      req.file,
      req.usuario
    );
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function remover(req, res, next) {
  try {
    await usuariosService.remover(req.params.id, req.usuario);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

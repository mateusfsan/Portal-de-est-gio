import * as usuariosService from './usuarios.service.js';

export async function listar(req, res, next) {
  try {
    const usuarios = await usuariosService.listar(req.query);
    res.json({ usuarios });
  } catch (err) {
    next(err);
  }
}

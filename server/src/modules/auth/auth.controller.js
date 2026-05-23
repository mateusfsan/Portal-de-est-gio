import * as authService from './auth.service.js';

// Controllers magros: só recebem, chamam o service e respondem.
// Toda regra de negócio mora no service (ver CLAUDE.md, seção 6).

export async function registrar(req, res, next) {
  try {
    const usuario = await authService.registrar(req.body);
    res.status(201).json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const usuario = await authService.buscarMe(req.usuario.id);
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

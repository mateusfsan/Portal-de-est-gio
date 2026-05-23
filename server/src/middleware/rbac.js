import { AppError } from '../lib/appError.js';

// Factory: exigePapel('coordenador') ou exigePapel('orientador', 'coordenador').
// Deve ser usada SEMPRE depois do middleware `auth`, que popula req.usuario.
export function exigePapel(...papeis) {
  return (req, _res, next) => {
    if (!req.usuario) {
      return next(new AppError('não autenticado', 401));
    }
    if (!papeis.includes(req.usuario.papel)) {
      return next(new AppError('acesso negado', 403));
    }
    next();
  };
}

import { ZodError } from 'zod';
import { AppError } from '../lib/appError.js';

// Único lugar do código que traduz erro em resposta HTTP.
// Express identifica este handler pelo arity de 4 argumentos.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: 'dados inválidos',
      detalhes: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message });
  }

  // Qualquer outro erro é tratado como falha inesperada do servidor.
  // Logamos o stack para diagnóstico, mas nunca o expomos ao cliente.
  console.error(err);
  return res.status(500).json({ erro: 'erro interno do servidor' });
}

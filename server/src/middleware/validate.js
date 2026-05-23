import { ZodError } from 'zod';

// Factory de middleware: validate({ body, params, query }).
// Cada chave é opcional; só valida o que for passado.
// Substitui req.body/params/query pelo objeto parseado (já com defaults aplicados).
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Erro de validação tem um shape próprio (com `issues`),
        // o errorHandler central trata isso.
        err.statusCode = 400;
      }
      next(err);
    }
  };
}

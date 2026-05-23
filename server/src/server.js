// Importar env primeiro garante que a validação rode antes de qualquer outro módulo
// (Prisma, JWT, etc.) tentar usar variáveis de ambiente.
import { env } from './config/env.js';
import { criarApp } from './app.js';

const app = criarApp();

app.listen(env.PORT, () => {
  console.log(`Portal de Estágio — API ouvindo em http://localhost:${env.PORT}`);
});

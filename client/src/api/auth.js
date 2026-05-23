import { api } from './client.js';

/**
 * POST /api/auth/login
 * @param {{ email: string, senha: string }} creds
 * @returns {Promise<{ token: string, usuario: object }>}
 */
export async function login(creds) {
  const { data } = await api.post('/api/auth/login', creds);
  return data;
}

/**
 * GET /api/auth/me — usado para hidratar o usuário no boot,
 * a partir de um token guardado no localStorage.
 * @returns {Promise<object>} dados do usuário sem senhaHash
 */
export async function buscarMe() {
  const { data } = await api.get('/api/auth/me');
  return data.usuario;
}

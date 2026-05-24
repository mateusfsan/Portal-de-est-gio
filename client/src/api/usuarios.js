import { api } from './client.js';

export async function listar({ papel } = {}) {
  const { data } = await api.get('/api/usuarios', {
    params: papel ? { papel } : undefined,
  });
  return data.usuarios;
}

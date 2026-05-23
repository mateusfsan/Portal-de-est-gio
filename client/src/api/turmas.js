import { api } from './client.js';

export async function listar({ cursoId } = {}) {
  const { data } = await api.get('/api/turmas', {
    params: cursoId ? { cursoId } : undefined,
  });
  return data.turmas;
}

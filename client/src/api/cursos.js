import { api } from './client.js';

export async function listar() {
  const { data } = await api.get('/api/cursos');
  return data.cursos;
}

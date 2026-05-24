import { api } from './client.js';

export async function listar() {
  const { data } = await api.get('/api/cursos');
  return data.cursos;
}

export async function buscarPorId(id) {
  const { data } = await api.get(`/api/cursos/${id}`);
  return data.curso;
}

export async function criar({ nome }) {
  const { data } = await api.post('/api/cursos', { nome });
  return data.curso;
}

export async function atualizar(id, { nome }) {
  const { data } = await api.put(`/api/cursos/${id}`, { nome });
  return data.curso;
}

export async function remover(id) {
  await api.delete(`/api/cursos/${id}`);
}

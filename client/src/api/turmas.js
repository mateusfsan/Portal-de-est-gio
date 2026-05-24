import { api } from './client.js';

export async function listar({ cursoId } = {}) {
  const { data } = await api.get('/api/turmas', {
    params: cursoId ? { cursoId } : undefined,
  });
  return data.turmas;
}

export async function buscarPorId(id) {
  const { data } = await api.get(`/api/turmas/${id}`);
  return data.turma;
}

export async function criar({ cursoId, orientadorId, periodo }) {
  const { data } = await api.post('/api/turmas', { cursoId, orientadorId, periodo });
  return data.turma;
}

export async function atualizar(id, { orientadorId, periodo }) {
  const { data } = await api.put(`/api/turmas/${id}`, { orientadorId, periodo });
  return data.turma;
}

export async function remover(id) {
  await api.delete(`/api/turmas/${id}`);
}

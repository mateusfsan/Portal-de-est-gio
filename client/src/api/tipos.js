import { api } from './client.js';

export async function listarPorFase(faseId) {
  const { data } = await api.get(`/api/fases/${faseId}/tipos`);
  return data.tipos;
}

export async function criar(faseId, { nome, obrigatorio = true }) {
  const { data } = await api.post(`/api/fases/${faseId}/tipos`, { nome, obrigatorio });
  return data.tipo;
}

export async function atualizar(id, { nome, obrigatorio }) {
  const { data } = await api.put(`/api/tipos-documento/${id}`, { nome, obrigatorio });
  return data.tipo;
}

export async function remover(id) {
  await api.delete(`/api/tipos-documento/${id}`);
}

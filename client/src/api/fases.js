import { api } from './client.js';

export async function listarPorCurso(cursoId) {
  const { data } = await api.get(`/api/cursos/${cursoId}/fases`);
  return data.fases;
}

export async function criar(cursoId, { nome, ordem }) {
  const { data } = await api.post(`/api/cursos/${cursoId}/fases`, { nome, ordem });
  return data.fase;
}

export async function atualizar(id, { nome }) {
  const { data } = await api.put(`/api/fases/${id}`, { nome });
  return data.fase;
}

export async function remover(id) {
  await api.delete(`/api/fases/${id}`);
}

/**
 * PATCH atômico de reordenação. Backend faz duas passadas em transação
 * para evitar colisão com @@unique([cursoId, ordem]).
 * @param {string} cursoId
 * @param {Array<{id: string, ordem: number}>} ordens
 */
export async function reordenar(cursoId, ordens) {
  const { data } = await api.patch(`/api/cursos/${cursoId}/fases/ordem`, { ordens });
  return data.fases;
}

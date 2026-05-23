import { api } from './client.js';

export async function listarMeus() {
  const { data } = await api.get('/api/estagios/me');
  return data.estagios;
}

export async function buscarPorId(id) {
  const { data } = await api.get(`/api/estagios/${id}`);
  return data.estagio;
}

export async function faseAtual(id) {
  const { data } = await api.get(`/api/estagios/${id}/fase-atual`);
  return data;
}

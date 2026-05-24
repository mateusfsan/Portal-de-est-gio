import { api } from './client.js';

export async function listarMeus() {
  const { data } = await api.get('/api/estagios/me');
  return data.estagios;
}

/**
 * Lista todos os estágios (uso do coordenador). Filtros opcionais
 * são `turmaId` e `alunoId` — backend não aceita `cursoId` direto;
 * a tela do dashboard resolve "filtrar por curso" filtrando em
 * memória ou via combinação de turmas do curso.
 */
export async function listarTodos({ turmaId, alunoId } = {}) {
  const { data } = await api.get('/api/estagios', {
    params: { turmaId, alunoId },
  });
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

export async function criar({ alunoId, turmaId, empresaId, inicio }) {
  const { data } = await api.post('/api/estagios', {
    alunoId,
    turmaId,
    empresaId,
    inicio,
  });
  return data.estagio;
}

export async function atualizar(id, { empresaId, inicio }) {
  const { data } = await api.put(`/api/estagios/${id}`, { empresaId, inicio });
  return data.estagio;
}

export async function remover(id) {
  await api.delete(`/api/estagios/${id}`);
}

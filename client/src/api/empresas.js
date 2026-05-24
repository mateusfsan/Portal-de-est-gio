import { api } from './client.js';

export async function listar() {
  const { data } = await api.get('/api/empresas');
  return data.empresas;
}

export async function criar({ razaoSocial, supervisorNome, supervisorEmail }) {
  const { data } = await api.post('/api/empresas', {
    razaoSocial,
    supervisorNome,
    supervisorEmail,
  });
  return data.empresa;
}

export async function atualizar(id, { razaoSocial, supervisorNome, supervisorEmail }) {
  const { data } = await api.put(`/api/empresas/${id}`, {
    razaoSocial,
    supervisorNome,
    supervisorEmail,
  });
  return data.empresa;
}

export async function remover(id) {
  await api.delete(`/api/empresas/${id}`);
}

import { api } from './client.js';

export async function listar({ papel } = {}) {
  const { data } = await api.get('/api/usuarios', {
    params: papel ? { papel } : undefined,
  });
  return data.usuarios;
}

/**
 * Constrói FormData adicionando só campos não-vazios + arquivo opcional.
 * Multer + Zod no backend toleram ambos (multipart e JSON), mas usar
 * FormData sempre simplifica o front quando às vezes há foto.
 */
function toFormData(dados, file) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(dados)) {
    if (v !== undefined && v !== null && v !== '') fd.append(k, v);
  }
  if (file) fd.append('file', file);
  return fd;
}

export async function criar({ nome, email, senha, papel, ra, file }) {
  const fd = toFormData({ nome, email, senha, papel, ra }, file);
  const { data } = await api.post('/api/usuarios', fd);
  return data.usuario;
}

export async function atualizar(id, { nome, email, papel, ra, novaSenha, file }) {
  const fd = toFormData({ nome, email, papel, ra, novaSenha }, file);
  const { data } = await api.put(`/api/usuarios/${id}`, fd);
  return data.usuario;
}

export async function remover(id) {
  await api.delete(`/api/usuarios/${id}`);
}

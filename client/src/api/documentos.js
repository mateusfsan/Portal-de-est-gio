import { api } from './client.js';

export async function listarPorEstagio(estagioId) {
  const { data } = await api.get(`/api/estagios/${estagioId}/documentos`);
  return data.porTipo;
}

/**
 * Upload de novo documento. Cria nova versão automaticamente no backend
 * (versao = MAX(versao)+1, regra append-only do CLAUDE.md 2.3).
 *
 * @param {{ estagioId: string, tipoDocumentoId: string, file: File }} args
 */
export async function upload({ estagioId, tipoDocumentoId, file }) {
  const form = new FormData();
  form.append('file', file);
  form.append('tipoDocumentoId', tipoDocumentoId);
  // Axios detecta FormData e seta Content-Type: multipart/form-data
  // com boundary automaticamente. Não passar header manualmente.
  const { data } = await api.post(`/api/estagios/${estagioId}/documentos`, form);
  return data.documento;
}

export async function listarFila(status = 'enviado') {
  const { data } = await api.get('/api/documentos', { params: { status } });
  return data.documentos;
}

/**
 * @param {{ documentoId: string, decisao: 'aprovado'|'reprovado', comentario: string }} args
 */
export async function darParecer({ documentoId, decisao, comentario }) {
  const { data } = await api.post(`/api/documentos/${documentoId}/parecer`, {
    decisao,
    comentario,
  });
  return data;
}

import axios from 'axios';

// Chave única para o token no localStorage. Centralizamos aqui para evitar typos.
export const TOKEN_KEY = 'portal_estagio_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: injeta o JWT em todas as requisições quando ele existir.
// Em uma única instância de axios — qualquer chamada do app passa por aqui.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

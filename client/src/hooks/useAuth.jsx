import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth.js';
import { TOKEN_KEY } from '../api/client.js';

const AuthContext = createContext(null);

/**
 * Provider único de estado de autenticação.
 *
 * Por que aqui (e não em TanStack Query):
 *   - usuário precisa estar disponível SÍNCRONO em todo render (rotas
 *     protegidas, layout, ações de UI). useQuery sempre tem 1 frame de
 *     loading; Context evita esse flash.
 *   - login/logout são imperativos (apertou botão → muda estado), não
 *     declarativos como uma query.
 *
 * O token é a fonte de verdade persistida (localStorage); o `usuario`
 * derivado dele é re-hidratado a cada boot via GET /api/auth/me. Se o
 * token estiver expirado/inválido, o /me responde 401 e fazemos logout.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setCarregando(false);
      return;
    }
    authApi
      .buscarMe()
      .then(setUsuario)
      .catch(() => {
        // Token velho/inválido: limpa e segue como deslogado.
        localStorage.removeItem(TOKEN_KEY);
        setUsuario(null);
      })
      .finally(() => setCarregando(false));
  }, []);

  async function login(creds) {
    const { token, usuario: u } = await authApi.login(creds);
    localStorage.setItem(TOKEN_KEY, token);
    setUsuario(u);
    return u;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
    // Limpa cache do TanStack — evita que tela do papel anterior
    // pisque dados antigos quando outro usuário fizer login.
    queryClient.clear();
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

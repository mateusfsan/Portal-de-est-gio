import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

/**
 * Gate de rota:
 * - Sem usuário → manda pro /login.
 * - Com usuário mas papel não permitido → manda pra home do papel dele.
 *
 * @param {{ papeis?: string[], children: React.ReactNode }} props
 */
export default function ProtectedRoute({ papeis, children }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <p style={{ padding: 'var(--space-8)' }}>Carregando…</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (papeis && !papeis.includes(usuario.papel)) {
    return <Navigate to={homeDoPapel(usuario.papel)} replace />;
  }

  return children;
}

export function homeDoPapel(papel) {
  if (papel === 'aluno') return '/me/perfil';
  if (papel === 'orientador') return '/orientacao/fila';
  if (papel === 'coordenador') return '/coordenacao';
  return '/login';
}

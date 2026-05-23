import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import ProtectedRoute, { homeDoPapel } from '../components/ProtectedRoute/ProtectedRoute.jsx';
import Layout from '../components/Layout/Layout.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import PerfilPage from '../features/aluno/PerfilPage.jsx';
import FilaPage from '../features/orientador/FilaPage.jsx';
import DashboardPage from '../features/coordenador/DashboardPage.jsx';

/**
 * Redireciona "/" para a home do papel do usuário logado.
 * Se não logado, ProtectedRoute leva pra /login antes mesmo de chegar aqui.
 */
function RedirectToHome() {
  const { usuario } = useAuth();
  return <Navigate to={homeDoPapel(usuario?.papel)} replace />;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas autenticadas, dentro do Layout (header + main). */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/me/perfil"
            element={
              <ProtectedRoute papeis={['aluno']}>
                <PerfilPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orientacao/fila"
            element={
              <ProtectedRoute papeis={['orientador']}>
                <FilaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordenacao"
            element={
              <ProtectedRoute papeis={['coordenador']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<RedirectToHome />} />
        </Route>

        {/* Qualquer URL desconhecida cai aqui. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

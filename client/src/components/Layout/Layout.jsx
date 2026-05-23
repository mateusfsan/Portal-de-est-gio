import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from '../Button/Button.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.logo}>Portal de Estágio</div>
        {usuario && (
          <div className={styles.user}>
            <span className={styles.nome}>{usuario.nome}</span>
            <span className={styles.papel}>{usuario.papel}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        )}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

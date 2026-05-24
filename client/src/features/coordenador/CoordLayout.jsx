import { NavLink, Outlet } from 'react-router-dom';
import styles from './CoordLayout.module.css';

const TABS = [
  { to: '/coordenacao', label: 'Dashboard', end: true },
  { to: '/coordenacao/cursos', label: 'Cursos' },
  { to: '/coordenacao/turmas', label: 'Turmas' },
  { to: '/coordenacao/empresas', label: 'Empresas' },
  { to: '/coordenacao/estagios', label: 'Estágios' },
];

export default function CoordLayout() {
  return (
    <div className={styles.shell}>
      <nav className={styles.tabs} aria-label="Coordenação">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.tabAtiva : ''}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

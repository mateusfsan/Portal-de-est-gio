import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { homeDoPapel } from '../../components/ProtectedRoute/ProtectedRoute.jsx';
import styles from './LoginPage.module.css';

/**
 * Tela de login com visual de glassmorphism e nova paleta de marca
 * (encapsulada em LoginPage.module.css). Lógica de auth (useAuth +
 * navigate) é idêntica à versão anterior — só o visual muda.
 *
 * Não usa Card/Input/Button compartilhados porque o tema escuro/glass
 * é incompatível com o design system claro dos tokens.css. Quando
 * promovermos o rebrand pro app inteiro, esses componentes serão
 * atualizados também.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const u = await login({ email, senha });
      const destino = location.state?.from?.pathname ?? homeDoPapel(u.papel);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.response?.data?.erro ?? 'erro ao autenticar');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <h1 className={styles.titulo}>Portal de Estágio</h1>
        <p className={styles.subtitulo}>Entre com seu email institucional.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {erro && (
            <div className={styles.erro} role="alert">
              {erro}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="senha" className={styles.label}>Senha</label>
            <input
              id="senha"
              type="password"
              className={styles.input}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.botao}
            disabled={enviando || !email || !senha}
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

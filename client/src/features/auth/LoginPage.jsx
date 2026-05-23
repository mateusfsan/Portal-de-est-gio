import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import Input from '../../components/Input/Input.jsx';
import { homeDoPapel } from '../../components/ProtectedRoute/ProtectedRoute.jsx';
import styles from './LoginPage.module.css';

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
      // Se o usuário tinha tentado abrir uma rota protegida antes,
      // honra essa intenção; senão, vai pra home do papel.
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
      <Card>
        <div className={styles.card}>
          <h1 className={styles.titulo}>Portal de Estágio</h1>
          <p className={styles.subtitulo}>Entre com seu email institucional.</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            {erro && <div className={styles.erro}>{erro}</div>}
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
            <Input
              id="senha"
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" disabled={enviando || !email || !senha}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

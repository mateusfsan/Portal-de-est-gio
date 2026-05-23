import { useEffect, useState } from 'react';
import { api } from './api/client.js';

// Tela mínima de saúde da etapa 1. Bate em /api/health e mostra o status,
// só para confirmar que client e server estão conversando.
// As telas reais (login, perfil, fila, dashboard) entram nas etapas seguintes.
export default function App() {
  const [estado, setEstado] = useState({ status: 'verificando', dados: null });

  useEffect(() => {
    api
      .get('/api/health')
      .then((res) => setEstado({ status: 'ok', dados: res.data }))
      .catch((err) =>
        setEstado({ status: 'erro', dados: err.message ?? 'desconhecido' })
      );
  }, []);

  return (
    <main
      style={{
        minHeight: '100%',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-8)',
      }}
    >
      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: 'var(--space-8)',
          maxWidth: '32rem',
          width: '100%',
        }}
      >
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
          Portal de Estágio
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Setup inicial — etapa 1: autenticação.
        </p>

        <Status estado={estado} />
      </section>
    </main>
  );
}

function Status({ estado }) {
  const cores = {
    verificando: {
      bg: 'var(--status-em-analise-bg)',
      text: 'var(--status-em-analise-text)',
      label: 'verificando backend...',
    },
    ok: {
      bg: 'var(--status-aprovado-bg)',
      text: 'var(--status-aprovado-text)',
      label: 'backend respondendo',
    },
    erro: {
      bg: 'var(--status-reprovado-bg)',
      text: 'var(--status-reprovado-text)',
      label: `falha: ${estado.dados}`,
    },
  };
  const c = cores[estado.status];

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: c.bg,
        color: c.text,
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
      }}
    >
      {c.label}
    </span>
  );
}

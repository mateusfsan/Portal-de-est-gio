import { useQuery } from '@tanstack/react-query';
import { faseAtual } from '../../api/estagios.js';
import Card from '../../components/Card/Card.jsx';
import styles from './FaseAtualCard.module.css';

/**
 * Cartão com a fase atual DERIVADA do estágio (CLAUDE.md 2.4).
 * Não toma nenhuma decisão de domínio — só renderiza o que o backend
 * calcula em GET /api/estagios/:id/fase-atual.
 */
export default function FaseAtualCard({ estagioId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['estagios', estagioId, 'fase-atual'],
    queryFn: () => faseAtual(estagioId),
    enabled: !!estagioId,
  });

  if (isLoading) return <Card>Carregando fase…</Card>;
  if (error) return <Card>Erro ao carregar fase atual.</Card>;

  const { faseAtual: atual, faseCompletada, totalFases, progressoFaseAtual } = data;
  const concluido = atual === null;
  const pct = progressoFaseAtual
    ? Math.round((progressoFaseAtual.aprovados / Math.max(progressoFaseAtual.totalObrigatorios, 1)) * 100)
    : 100;

  return (
    <Card>
      <div className={styles.shell}>
        <span className={styles.label}>Fase atual</span>
        {concluido ? (
          <h2 className={`${styles.faseAtual} ${styles.concluido}`}>Estágio concluído</h2>
        ) : (
          <h2 className={styles.faseAtual}>
            {atual.nome} <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
              · fase {atual.ordem} de {totalFases}
            </span>
          </h2>
        )}

        {faseCompletada && (
          <span className={styles.completada}>
            Última fase concluída: {faseCompletada.nome}
          </span>
        )}

        {!concluido && (
          <>
            <div className={styles.barraTrack}>
              <div className={styles.barraFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.progresso}>
              {progressoFaseAtual.aprovados} de {progressoFaseAtual.totalObrigatorios} documentos obrigatórios aprovados
            </span>
          </>
        )}
      </div>
    </Card>
  );
}

import styles from './StatusBadge.module.css';

const LABELS = {
  pendente: 'pendente',
  enviado: 'enviado',
  em_analise: 'em análise',
  aprovado: 'aprovado',
  reprovado: 'reprovado',
};

/**
 * Pílula visual para um status do enum DocumentoStatus do schema Prisma.
 * @param {{ status: 'pendente'|'enviado'|'em_analise'|'aprovado'|'reprovado' }} props
 */
export default function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {LABELS[status] ?? status}
    </span>
  );
}

import Modal from '../Modal/Modal.jsx';
import Button from '../Button/Button.jsx';

/**
 * Modal de confirmação para ações destrutivas (delete).
 * Reusado em todos os CRUDs do coordenador.
 *
 * @param {{
 *   open: boolean,
 *   title?: string,
 *   message: string | React.ReactNode,
 *   confirmLabel?: string,
 *   loading?: boolean,
 *   error?: string | null,
 *   onConfirm: () => void,
 *   onClose: () => void,
 * }} props
 */
export default function ConfirmModal({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  loading = false,
  error = null,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {error && (
          <div
            style={{
              backgroundColor: 'var(--status-reprovado-bg)',
              color: 'var(--status-reprovado-text)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {error}
          </div>
        )}
        <p style={{ margin: 0, color: 'var(--color-text)' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Aguarde…' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

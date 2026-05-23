import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

/**
 * Wrapper sobre <dialog> HTML nativo. Vantagens: foco e Esc gerenciados
 * pelo browser, scroll do body bloqueado automaticamente, backdrop nativo.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title: string,
 *   children: React.ReactNode,
 * }} props
 */
export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Esc nativo do <dialog> dispara cancel; também tratamos backdrop click.
  function handleClick(e) {
    if (e.target === ref.current) onClose();
  }

  return (
    <dialog ref={ref} className={styles.dialog} onCancel={onClose} onClick={handleClick}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button
          type="button"
          className={styles.close}
          aria-label="Fechar"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}

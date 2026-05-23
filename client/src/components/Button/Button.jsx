import styles from './Button.module.css';

/**
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'danger',
 *   type?: 'button' | 'submit',
 *   disabled?: boolean,
 *   onClick?: () => void,
 *   children: React.ReactNode,
 * }} props
 */
export default function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  children,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

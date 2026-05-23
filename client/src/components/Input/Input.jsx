import styles from './Input.module.css';

/**
 * Input controlado com label e mensagem de erro.
 * Para textarea, passe `as="textarea"`.
 */
export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  as = 'input',
  ...rest
}) {
  const Tag = as === 'textarea' ? 'textarea' : 'input';
  const className = `${styles[as === 'textarea' ? 'textarea' : 'input']} ${error ? styles.invalid : ''}`;
  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <Tag
        id={id}
        type={as === 'input' ? type : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        {...rest}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

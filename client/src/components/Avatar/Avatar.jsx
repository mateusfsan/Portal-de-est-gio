import styles from './Avatar.module.css';

function iniciais(nome) {
  if (!nome) return '?';
  return nome
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Avatar circular. Mostra foto se houver, senão iniciais.
 *
 * @param {{
 *   nome: string,
 *   fotoUrl?: string | null,
 *   size?: 'sm' | 'md' | 'lg',
 *   alt?: string,
 * }} props
 */
export default function Avatar({ nome, fotoUrl, size = 'md', alt }) {
  return (
    <div className={`${styles.avatar} ${styles[size]}`} aria-label={alt ?? nome}>
      {fotoUrl ? (
        <img src={fotoUrl} alt={alt ?? nome} className={styles.img} />
      ) : (
        iniciais(nome)
      )}
    </div>
  );
}

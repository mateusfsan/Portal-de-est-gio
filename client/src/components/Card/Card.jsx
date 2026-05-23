import styles from './Card.module.css';

export default function Card({ children, tight = false, style }) {
  return (
    <div className={`${styles.card} ${tight ? styles.tight : ''}`} style={style}>
      {children}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { noteCategories } from '../../data/notes';
import styles from './NotesLanding.module.css';

export function NotesLanding() {
  const total = noteCategories.reduce((n, c) => n + c.notes.length, 0);

  return (
    <article className={styles.landing}>
      <h1 className={styles.title}>筆記總覽</h1>
      <p className={styles.meta}>
        共 {total} 篇筆記，分 {noteCategories.length} 個分類
      </p>
      <div className={styles.cardGrid}>
        {noteCategories.map((cat) => (
          <Link
            key={cat.key}
            to={`/notes/${cat.key}/${cat.notes[0].slug}`}
            className={styles.card}
          >
            <div className={styles.cardTitle}>{cat.label}</div>
            <div className={styles.cardCount}>{cat.notes.length} 篇</div>
            <ul className={styles.cardList}>
              {cat.notes.slice(0, 5).map((n) => (
                <li key={n.slug}>{n.title}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </article>
  );
}

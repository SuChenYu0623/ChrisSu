import { Link, Navigate, useParams } from 'react-router-dom';
import { noteCategories } from '../../data/notes';
import styles from './NotesLanding.module.css';

export function CategoryDetail() {
  const { category } = useParams<{ category: string }>();
  const cat = noteCategories.find((c) => c.key === category);

  if (!cat) return <Navigate to="/notes" replace />;

  return (
    <article className={styles.landing}>
      <nav aria-label="breadcrumb" className={styles.breadcrumb}>
        <Link to="/notes">筆記</Link>
        <span aria-hidden className={styles.breadcrumbSeparator}>
          ·
        </span>
        <span className={styles.breadcrumbCurrent}>{cat.label}</span>
      </nav>
      <h1 className={styles.title}>{cat.label}</h1>
      <p className={styles.meta}>{cat.notes.length} 篇</p>
      <div className={styles.cardGrid}>
        {cat.notes.map((note) => (
          <Link
            key={note.slug}
            to={`/notes/${cat.key}/${note.slug}`}
            className={styles.card}
          >
            <div className={styles.cardTitle}>{note.title}</div>
          </Link>
        ))}
      </div>
    </article>
  );
}

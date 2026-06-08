import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

type Props = {
  categoryLabel: string;
  noteTitle: string;
};

export function Breadcrumb({ categoryLabel, noteTitle }: Props) {
  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumb}>
      <Link to="/notes">筆記</Link>
      <span aria-hidden className={styles.separator}>
        ·
      </span>
      <span>{categoryLabel}</span>
      <span aria-hidden className={styles.separator}>
        ·
      </span>
      <span aria-current="page" className={styles.current}>
        {noteTitle}
      </span>
    </nav>
  );
}

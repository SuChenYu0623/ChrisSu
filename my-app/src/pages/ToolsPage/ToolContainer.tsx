import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './ToolsPage.module.css';

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ToolContainer({ title, description, children }: Props) {
  return (
    <article className={styles.toolContainer}>
      <nav aria-label="breadcrumb" className={styles.breadcrumb}>
        <Link to="/tools">Tools</Link>
        <span aria-hidden>·</span>
        <span className={styles.breadcrumbCurrent}>{title}</span>
      </nav>
      <h1 className={styles.toolTitle}>{title}</h1>
      <p className={styles.toolDesc}>{description}</p>
      {children}
    </article>
  );
}

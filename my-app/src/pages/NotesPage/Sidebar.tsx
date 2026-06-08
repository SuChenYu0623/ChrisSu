import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NoteCategory } from '../../types';
import styles from './NotesPage.module.css';

type Props = { categories: NoteCategory[] };

export function Sidebar({ categories }: Props) {
  return (
    <aside className={styles.sidebar}>
      {categories.map((category) => (
        <SidebarSection key={category.key} category={category} />
      ))}
    </aside>
  );
}

function SidebarSection({ category }: { category: NoteCategory }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div>
      <button
        type="button"
        className={styles.parent}
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
      >
        <span className={styles.title}>{category.label}</span>
        <span aria-hidden>{collapsed ? '▸' : '▾'}</span>
      </button>
      <ul className={collapsed ? `${styles.list} ${styles.collapsed}` : styles.list}>
        {category.notes.map((note) => (
          <li key={note.slug}>
            <Link to={`/notes/${category.key}/${note.slug}`}>{note.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { NoteCategory } from '../../types';
import styles from './NotesPage.module.css';

type Props = { categories: NoteCategory[] };

export function Sidebar({ categories }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        notes: cat.notes.filter((n) => n.title.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.notes.length > 0);
  }, [categories, query]);

  return (
    <aside className={styles.sidebar}>
      <input
        type="search"
        className={styles.search}
        placeholder="搜尋筆記..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="搜尋筆記"
      />
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>找不到符合的筆記</div>
      ) : (
        filtered.map((category) => (
          <SidebarSection key={category.key} category={category} forceExpanded={!!query} />
        ))
      )}
    </aside>
  );
}

function SidebarSection({
  category,
  forceExpanded,
}: {
  category: NoteCategory;
  forceExpanded: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isCollapsed = !forceExpanded && collapsed;

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!isCollapsed}
      >
        <span>{category.label}</span>
        <span aria-hidden>{isCollapsed ? '▸' : '▾'}</span>
      </button>
      {!isCollapsed && (
        <ul className={styles.noteList}>
          {category.notes.map((note) => (
            <li key={note.slug}>
              <NavLink
                to={`/notes/${category.key}/${note.slug}`}
                className={({ isActive }) =>
                  isActive ? `${styles.noteLink} ${styles.noteLinkActive}` : styles.noteLink
                }
                title={note.title}
              >
                {note.sidebarLabel ?? note.title}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

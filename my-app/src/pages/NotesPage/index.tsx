import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Note } from './Note';
import { NotesLanding } from './NotesLanding';
import { noteCategories } from '../../data/notes';
import styles from './NotesPage.module.css';

export default function NotesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.page} data-drawer-open={drawerOpen}>
      <div className={styles.sidebarWrapper}>
        <Sidebar categories={noteCategories} />
      </div>
      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}
      <main className={styles.main}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label="開啟筆記目錄"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Routes>
          <Route index element={<NotesLanding />} />
          <Route path=":category/:slug" element={<Note />} />
        </Routes>
      </main>
    </div>
  );
}

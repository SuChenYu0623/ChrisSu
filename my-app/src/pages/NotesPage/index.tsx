import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Note } from './Note';
import { NotesLanding } from './NotesLanding';
import { noteCategories } from '../../data/notes';
import styles from './NotesPage.module.css';

export default function NotesPage() {
  return (
    <div className={styles.page}>
      <Sidebar categories={noteCategories} />
      <main className={styles.main}>
        <Routes>
          <Route index element={<NotesLanding />} />
          <Route path=":category/:slug" element={<Note />} />
        </Routes>
      </main>
    </div>
  );
}

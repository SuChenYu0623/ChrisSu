import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Note } from './Note';
import { noteCategories } from '../../data/notes';
import styles from './NotesPage.module.css';

export default function NotesPage() {
  return (
    <div className={styles.page}>
      <Sidebar categories={noteCategories} />
      <Routes>
        <Route path=":category/:slug" element={<Note />} />
      </Routes>
    </div>
  );
}

import { Routes, Route } from 'react-router-dom';
import { PhotoLanding } from './PhotoLanding';
import { AlbumDetail } from './AlbumDetail';
import styles from './PhotoPage.module.css';

export default function PhotoPage() {
  return (
    <div className={styles.page}>
      <Routes>
        <Route index element={<PhotoLanding />} />
        <Route path=":albumId" element={<AlbumDetail />} />
      </Routes>
    </div>
  );
}

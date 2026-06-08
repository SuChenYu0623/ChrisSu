import { PhotoAlbum } from './PhotoAlbum';
import { albums } from '../../data/photos';
import styles from './PhotoPage.module.css';

export default function PhotoPage() {
  return (
    <div className={styles.page}>
      {albums.map((album) => (
        <PhotoAlbum key={album.id} album={album} />
      ))}
    </div>
  );
}

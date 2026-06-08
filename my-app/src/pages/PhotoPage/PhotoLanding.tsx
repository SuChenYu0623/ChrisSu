import { AlbumCover } from './AlbumCover';
import { albums } from '../../data/photos';
import styles from './PhotoLanding.module.css';

export function PhotoLanding() {
  const totalPhotos = albums.reduce((n, a) => n + a.photos.length, 0);

  return (
    <article className={styles.landing}>
      <h1 className={styles.title}>相片專區</h1>
      <p className={styles.meta}>
        共 {albums.length} 個相簿、{totalPhotos} 張照片
      </p>
      <div className={styles.grid}>
        {albums.map((album) => (
          <AlbumCover key={album.id} album={album} />
        ))}
      </div>
    </article>
  );
}

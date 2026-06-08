import { Link } from 'react-router-dom';
import type { Album } from '../../types';
import styles from './AlbumCover.module.css';

type Props = { album: Album };

export function AlbumCover({ album }: Props) {
  const cover = album.photos[0];
  const metaParts = [album.date, `${album.photos.length} 張`].filter(Boolean);

  return (
    <Link to={`/photos/${album.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          className={styles.image}
          src={cover.src}
          alt={`${album.title} 封面`}
          width={cover.width}
          height={cover.height}
          loading="lazy"
        />
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{album.title}</h2>
        <div className={styles.meta}>{metaParts.join(' · ')}</div>
      </div>
    </Link>
  );
}

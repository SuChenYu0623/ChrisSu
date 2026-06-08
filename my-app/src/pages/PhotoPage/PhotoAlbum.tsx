import { Link } from 'react-router-dom';
import type { Album } from '../../types';
import styles from './PhotoPage.module.css';

type Props = { album: Album };

export function PhotoAlbum({ album }: Props) {
  return (
    <Link className={styles.album} to={`/photos/${album.id}`}>
      <div className={styles.albumImages}>
        <img src={album.images[0]} alt={`${album.title} preview 1`} />
        <img src={album.images[1]} alt={`${album.title} preview 2`} />
        <img src={album.images[2]} alt={`${album.title} preview 3`} />
      </div>
      <div>{album.title}</div>
    </Link>
  );
}

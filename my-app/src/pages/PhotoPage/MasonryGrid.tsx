import type { Photo } from '../../types';
import styles from './MasonryGrid.module.css';

type Props = {
  photos: Photo[];
  onPhotoClick: (index: number) => void;
};

export function MasonryGrid({ photos, onPhotoClick }: Props) {
  return (
    <div className={styles.grid}>
      {photos.map((photo, index) => (
        <button
          key={photo.src}
          type="button"
          className={styles.figure}
          onClick={() => onPhotoClick(index)}
          aria-label={`查看 ${photo.alt}`}
        >
          <img
            className={styles.image}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}

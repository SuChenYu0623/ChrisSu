import { useEffect, useRef } from 'react';
import type { Photo } from '../../types';
import styles from './LightboxThumbnails.module.css';

type Props = {
  photos: Photo[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

export function LightboxThumbnails({ photos, currentIndex, onSelect }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentIndex]);

  return (
    <div className={styles.strip} ref={stripRef}>
      {photos.map((photo, index) => (
        <button
          key={photo.src}
          ref={index === currentIndex ? activeRef : undefined}
          type="button"
          className={
            index === currentIndex ? `${styles.thumb} ${styles.thumbActive}` : styles.thumb
          }
          onClick={() => onSelect(index)}
          aria-label={`第 ${index + 1} 張：${photo.alt}`}
          aria-current={index === currentIndex ? 'true' : undefined}
        >
          <img src={photo.src} alt="" />
        </button>
      ))}
    </div>
  );
}

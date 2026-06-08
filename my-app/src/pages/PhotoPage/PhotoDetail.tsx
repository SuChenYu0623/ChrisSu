import { useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import leftArrowImg from '../../images/leftArrow.png';
import rightArrowImg from '../../images/rightArrow.png';
import { findAlbumById } from '../../data/photos';
import { DefaultImage } from '../../components/DefaultImage';
import { PhotoActionBar } from './PhotoActionBar';
import styles from './PhotoPage.module.css';

export function PhotoDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const album = albumId ? findAlbumById(albumId) : undefined;
  const [count, setCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!album) return <Navigate to="/photos" replace />;

  const scrollBy = (delta: number) =>
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });

  return (
    <div className={styles.detail}>
      <div className={styles.container}>
        <div className={styles.header}>{album.title}</div>
        <div className={styles.content}>
          <DefaultImage
            image={album.images[count]}
            alt={`${album.title} photo ${count + 1}`}
            width="100%"
          />
          <div className={styles.bar}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => scrollBy(-100)}
              aria-label="scroll left"
            >
              <img src={leftArrowImg} alt="" width={20} />
            </button>
            <div className={styles.barContent} ref={scrollRef}>
              {album.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setCount(index)}
                  className={styles.actionButton}
                  aria-label={`select photo ${index + 1}`}
                >
                  <DefaultImage image={image} alt={`thumb ${index + 1}`} width="60px" />
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => scrollBy(100)}
              aria-label="scroll right"
            >
              <img src={rightArrowImg} alt="" width={20} />
            </button>
          </div>
        </div>
        <PhotoActionBar />
      </div>
    </div>
  );
}

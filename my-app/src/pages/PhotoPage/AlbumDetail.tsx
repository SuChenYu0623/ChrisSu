import { Link, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { findAlbumById } from '../../data/photos';
import { MasonryGrid } from './MasonryGrid';
import { Lightbox } from './Lightbox';
import styles from './AlbumDetail.module.css';

export function AlbumDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const album = albumId ? findAlbumById(albumId) : undefined;

  if (!album) return <Navigate to="/photos" replace />;

  const photoParam = searchParams.get('photo');
  const parsed = photoParam !== null ? Number(photoParam) : NaN;
  const lightboxIndex =
    Number.isInteger(parsed) && parsed >= 0 && parsed < album.photos.length ? parsed : null;

  const openLightbox = (index: number) => {
    setSearchParams({ photo: String(index) }, { replace: true });
  };
  const closeLightbox = () => {
    setSearchParams({}, { replace: true });
  };

  const metaParts = [album.date, `${album.photos.length} 張`].filter(Boolean);

  return (
    <article className={styles.detail}>
      <header className={styles.toolbar}>
        <Link to="/photos" className={styles.back}>
          ← 返回相簿總覽
        </Link>
        <div>
          <h1 className={styles.title}>{album.title}</h1>
          {metaParts.length > 0 && <div className={styles.meta}>{metaParts.join(' · ')}</div>}
        </div>
      </header>
      <MasonryGrid photos={album.photos} onPhotoClick={openLightbox} />
      {lightboxIndex !== null && (
        <Lightbox
          photos={album.photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onChangeIndex={openLightbox}
        />
      )}
    </article>
  );
}

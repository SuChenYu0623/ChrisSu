import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Photo } from '../../types';
import { LightboxThumbnails } from './LightboxThumbnails';
import styles from './Lightbox.module.css';

type Props = {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

export function Lightbox({ photos, currentIndex, onClose, onChangeIndex }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onChangeIndex(currentIndex - 1);
  }, [hasPrev, currentIndex, onChangeIndex]);

  const goNext = useCallback(() => {
    if (hasNext) onChangeIndex(currentIndex + 1);
  }, [hasNext, currentIndex, onChangeIndex]);

  // Body scroll lock + 補 scrollbar 寬度避免跳動
  useEffect(() => {
    const original = document.body.style.overflow;
    const originalPad = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = original;
      document.body.style.paddingRight = originalPad;
    };
  }, []);

  // Focus 管理：開啟時抓 active element、把 focus 給 close button；關閉時還原
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  // 鍵盤
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'Home':
          onChangeIndex(0);
          break;
        case 'End':
          onChangeIndex(photos.length - 1);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext, onChangeIndex, photos.length]);

  // 預載前後各 1 張
  useEffect(() => {
    const preload = (i: number) => {
      if (i < 0 || i >= photos.length) return;
      const img = new Image();
      img.src = photos[i].src;
    };
    preload(currentIndex - 1);
    preload(currentIndex + 1);
  }, [currentIndex, photos]);

  const handleOverlayClick = (e: ReactMouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Focus trap：只在 close / prev / next / thumbnails 之間循環
  const handleKeyDownInOverlay = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const focusable = overlayRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDownInOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="圖片檢視"
    >
      <div className={styles.header}>
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="關閉"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className={styles.counter}>
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      <div className={styles.stage}>
        <button
          type="button"
          className={
            hasPrev
              ? `${styles.nav} ${styles.navPrev}`
              : `${styles.nav} ${styles.navPrev} ${styles.navDisabled}`
          }
          onClick={goPrev}
          aria-label="上一張"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <img
          key={photo.src}
          className={styles.image}
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
        />

        <button
          type="button"
          className={
            hasNext
              ? `${styles.nav} ${styles.navNext}`
              : `${styles.nav} ${styles.navNext} ${styles.navDisabled}`
          }
          onClick={goNext}
          aria-label="下一張"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.footer}>
        <LightboxThumbnails
          photos={photos}
          currentIndex={currentIndex}
          onSelect={onChangeIndex}
        />
      </div>
    </div>
  );
}

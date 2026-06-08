# 相片專區重新設計 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 PhotoPage 從半 IG 半 demo 升級成圖庫風格：相簿封面 grid landing → masonry 內容頁 → 全螢幕 lightbox（焦點陷阱、鍵盤導航、深連結、body scroll lock）。同時清掉 5 個假相簿、移除 IG 互動按鈕、所有圖片補上 width/height。

**Architecture:**
- 路由：`/photos/*` nested，PhotoPage 內 index → PhotoLanding（封面卡 grid），`/:albumId` → AlbumDetail（masonry + Lightbox 控制）。Lightbox 不是獨立 route，靠 `?photo=N` query 控制 open/close + 深連結。
- 資料：`Photo { src, alt, width, height }` 取代 `images: string[]`。寬高用 macOS `sips` 量測手填到 `data/photos.ts`、避免 layout shift。
- 樣式：CSS Modules + 沿用 `--notes-*` 雙主題 token；Lightbox 永遠黑底不跟主題走。
- Lightbox：React 元件、focus trap 用 ref + keydown handler、body scroll lock 用 `overflow: hidden + padding-right` 補 scrollbar、預載前後各 1 張用 `new Image()`。

**Tech Stack:** Vite 8 + React 19 + TypeScript 6 strict + CSS Modules + react-router-dom 6 (HashRouter + nested Routes + useSearchParams)

**Reference spec:** `/Users/admin/Desktop/myProject/ChrisSu/docs/superpowers/specs/2026-06-09-photo-gallery-redesign.md`

**Working directory:** 除非特別註明，所有路徑都以 `/Users/admin/Desktop/myProject/ChrisSu/my-app` 為基準。

**Testing note:** scope 不含單元測試（與前次 redesign 一致），驗證以「lint + typecheck + build + 瀏覽器手動驗收」為主。每個 task 結束跑 typecheck，phase 結束跑 build + dev 視覺驗收。

**Measured photo dimensions**（sips 已實測，本 plan 直接用）：

| 檔名 | width × height |
|---|---|
| photo-1.jpg | 1477 × 1108 |
| photo-2.jpg | 1600 × 1200 |
| photo-3.jpg | 1108 × 1477 |
| photo-4.jpg | 1477 × 1108 |
| photo-5.jpg | 1108 × 1477 |
| photo-6.jpg | 1706 × 960 |

---

## Phase 0 — 前置

### Task 0.1: 建立 feature branch

**Files:** (no file changes)

- [ ] **Step 1: 確認 working tree 乾淨、master 是最新**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git status
git branch --show-current
```

Expected: `nothing to commit`、branch `master`、HEAD 是 `a109c2d` (docs: add photo gallery redesign spec) 或更新

- [ ] **Step 2: 建立 feature branch**

```bash
git checkout -b feature/photo-gallery
```

Expected: `Switched to a new branch 'feature/photo-gallery'`

---

## Phase 1 — 資料層重構

### Task 1.1: 更新 Album / 新增 Photo 型別

**Files:**
- Modify: `my-app/src/types/index.ts`

- [ ] **Step 1: 把 `Album` 換掉並新增 `Photo`**

把 `src/types/index.ts` 內既有的：

```ts
export type Album = {
  id: string;
  title: string;
  images: string[];
};
```

替換成：

```ts
export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Album = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  photos: Photo[];
};
```

- [ ] **Step 2: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -20
```

Expected: 會炸 errors（`data/photos.ts` 用舊 `images`、`PhotoAlbum.tsx`、`PhotoDetail.tsx` 也是）。**記下 error 數量，下個 task 解掉**。

### Task 1.2: 改寫 data/photos.ts — 只留胖橘日常 1，新型別

**Files:**
- Modify: `my-app/src/data/photos.ts`

- [ ] **Step 1: 完全替換檔案內容**

```ts
import type { Album } from '../types';
import photo1 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-1.jpg';
import photo2 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-2.jpg';
import photo3 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-3.jpg';
import photo4 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-4.jpg';
import photo5 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-5.jpg';
import photo6 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-6.jpg';

export const albums: Album[] = [
  {
    id: 'orange-cat-daily-1',
    title: '胖橘日常 1',
    description: '橘子在家的紀錄',
    date: '2024-03',
    photos: [
      { src: photo1, alt: '橘子翻肚', width: 1477, height: 1108 },
      { src: photo2, alt: '橘子蜷成一團', width: 1600, height: 1200 },
      { src: photo3, alt: '橘子看電視', width: 1108, height: 1477 },
      { src: photo4, alt: '橘子日常 4', width: 1477, height: 1108 },
      { src: photo5, alt: '橘子日常 5', width: 1108, height: 1477 },
      { src: photo6, alt: '橘子日常 6', width: 1706, height: 960 },
    ],
  },
];

export const findAlbumById = (id: string): Album | undefined =>
  albums.find((album) => album.id === id);
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -10
```

Expected: `data/photos.ts` 的 errors 消失；剩下 `PhotoAlbum.tsx` 與 `PhotoDetail.tsx` 的 errors（會在 Phase 2 刪檔解決）。

---

## Phase 2 — 刪除舊 PhotoPage 結構

### Task 2.1: 刪掉舊元件並暫時 stub PhotoPage

**Files:**
- Delete: `my-app/src/pages/PhotoPage/PhotoAlbum.tsx`
- Delete: `my-app/src/pages/PhotoPage/PhotoDetail.tsx`
- Delete: `my-app/src/pages/PhotoPage/PhotoActionBar.tsx`
- Modify: `my-app/src/pages/PhotoPage/index.tsx`
- Modify: `my-app/src/App.tsx`

- [ ] **Step 1: 刪掉舊元件**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
rm src/pages/PhotoPage/PhotoAlbum.tsx
rm src/pages/PhotoPage/PhotoDetail.tsx
rm src/pages/PhotoPage/PhotoActionBar.tsx
```

- [ ] **Step 2: 暫時 stub `src/pages/PhotoPage/index.tsx`** 讓 build 不炸

替換整個檔案：

```tsx
import styles from './PhotoPage.module.css';

export default function PhotoPage() {
  return <div className={styles.page}>相片頁施工中</div>;
}
```

> 這個 stub 是過渡用的，下一個 task 會被替換成正式 nested Routes。

- [ ] **Step 3: 改 `src/App.tsx`** 移除 PhotoDetail import 與 `/photos/:albumId` route

打開 `src/App.tsx`，找這兩行：

```tsx
import { PhotoDetail } from './pages/PhotoPage/PhotoDetail';
```

刪掉。

接著把：

```tsx
<Route path="/photos" element={<PhotoPage />} />
<Route path="/photos/:albumId" element={<PhotoDetail />} />
```

改成：

```tsx
<Route path="/photos/*" element={<PhotoPage />} />
```

- [ ] **Step 4: typecheck + build**

```bash
npm run typecheck 2>&1 | tail -3 && npm run build 2>&1 | tail -3
```

Expected: 0 typecheck errors、build 通過。

- [ ] **Step 5: Commit Phase 1 + 2**

```bash
rm -rf dist
cd /Users/admin/Desktop/myProject/ChrisSu
git add -A
git commit -m "refactor(photos): replace Album.images with Photo[] (w/h), remove fake albums + IG action bar"
```

---

## Phase 3 — 新元件骨架（landing + cover + detail + grid）

### Task 3.1: PhotoLanding — 相簿封面 grid

**Files:**
- Create: `my-app/src/pages/PhotoPage/PhotoLanding.tsx`
- Create: `my-app/src/pages/PhotoPage/PhotoLanding.module.css`

- [ ] **Step 1: 建 `PhotoLanding.module.css`**

```css
.landing {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-5) var(--space-4);
  font-family: var(--notes-font-sans);
  color: var(--notes-fg);
}
.title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 var(--space-2);
}
.meta {
  color: var(--notes-fg-muted);
  margin-bottom: var(--space-5);
  font-size: 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 360px));
  gap: var(--space-4);
}
```

- [ ] **Step 2: 建 `PhotoLanding.tsx`**

```tsx
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
```

- [ ] **Step 3: typecheck**

> 此時 `AlbumCover` 還沒寫，會炸 import error。下個 task 補上。

### Task 3.2: AlbumCover — 單張封面卡

**Files:**
- Create: `my-app/src/pages/PhotoPage/AlbumCover.tsx`
- Create: `my-app/src/pages/PhotoPage/AlbumCover.module.css`

- [ ] **Step 1: 建 `AlbumCover.module.css`**

```css
.card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--notes-fg);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border-radius: 8px;
  background: var(--notes-bg-subtle);
}
.card:hover {
  transform: translateY(-4px);
  color: var(--notes-fg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
[data-theme='dark'] .card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.imageWrapper {
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  background: var(--notes-bg-code);
}
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.card:hover .image {
  transform: scale(1.05);
}
.body {
  padding: var(--space-3);
}
.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}
.meta {
  font-size: 13px;
  color: var(--notes-fg-muted);
}
```

- [ ] **Step 2: 建 `AlbumCover.tsx`**

```tsx
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
```

- [ ] **Step 3: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors（PhotoLanding 的 import 解決了；但 `index.tsx` 還在 stub 階段，沒 import PhotoLanding，所以還不會被用到）。

### Task 3.3: MasonryGrid — 純展示用

**Files:**
- Create: `my-app/src/pages/PhotoPage/MasonryGrid.tsx`
- Create: `my-app/src/pages/PhotoPage/MasonryGrid.module.css`

- [ ] **Step 1: 建 `MasonryGrid.module.css`**

```css
.grid {
  column-count: 3;
  column-gap: 12px;
  margin-top: var(--space-4);
}
.figure {
  break-inside: avoid;
  margin: 0 0 12px;
  cursor: zoom-in;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  display: block;
  background: var(--notes-bg-code);
  border: 0;
  padding: 0;
  width: 100%;
}
.image {
  width: 100%;
  height: auto;
  display: block;
  filter: brightness(0.95);
  transition: filter 0.2s;
}
.figure:hover .image,
.figure:focus-visible .image {
  filter: brightness(1);
}
.figure:focus-visible {
  outline: 2px solid var(--notes-accent);
  outline-offset: 2px;
}

@media (max-width: 1024px) {
  .grid {
    column-count: 2;
  }
}
@media (max-width: 768px) {
  .grid {
    column-count: 1;
  }
}
```

- [ ] **Step 2: 建 `MasonryGrid.tsx`**

```tsx
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
```

- [ ] **Step 3: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 3.4: AlbumDetail（暫時不接 Lightbox，先把 grid + toolbar 跑起來）

**Files:**
- Create: `my-app/src/pages/PhotoPage/AlbumDetail.tsx`
- Create: `my-app/src/pages/PhotoPage/AlbumDetail.module.css`

- [ ] **Step 1: 建 `AlbumDetail.module.css`**

```css
.detail {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-3) var(--space-5);
  font-family: var(--notes-font-sans);
  color: var(--notes-fg);
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--notes-border);
}
.back {
  color: var(--notes-fg-muted);
  text-decoration: none;
  font-size: 14px;
}
.back:hover {
  color: var(--notes-accent);
}
.title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}
.meta {
  font-size: 13px;
  color: var(--notes-fg-muted);
  margin-top: 4px;
}
```

- [ ] **Step 2: 建 `AlbumDetail.tsx`**（暫時用 `console.log` 代替 lightbox 開啟，Phase 4 才接）

```tsx
import { Link, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { findAlbumById } from '../../data/photos';
import { MasonryGrid } from './MasonryGrid';
import styles from './AlbumDetail.module.css';

export function AlbumDetail() {
  const { albumId } = useParams<{ albumId: string }>();
  const [, setSearchParams] = useSearchParams();
  const album = albumId ? findAlbumById(albumId) : undefined;

  if (!album) return <Navigate to="/photos" replace />;

  const openLightbox = (index: number) => {
    setSearchParams({ photo: String(index) }, { replace: true });
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
    </article>
  );
}
```

- [ ] **Step 3: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 3.5: PhotoPage index.tsx — 接上 nested Routes

**Files:**
- Modify: `my-app/src/pages/PhotoPage/index.tsx`
- Create: `my-app/src/pages/PhotoPage/PhotoPage.module.css`（會替換掉現有）

- [ ] **Step 1: 完全替換 `PhotoPage.module.css`**

```css
.page {
  width: 100%;
  min-height: 92vh;
  background: var(--notes-bg);
  color: var(--notes-fg);
  overflow-y: auto;
}
```

- [ ] **Step 2: 替換 `src/pages/PhotoPage/index.tsx`**

```tsx
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
```

- [ ] **Step 3: lint + typecheck + build**

```bash
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
npm run build 2>&1 | tail -5
```

Expected: 0 errors、`✓ built`。

- [ ] **Step 4: dev 驗收 — 不含 lightbox**

```bash
pkill -f "vite" 2>/dev/null; sleep 1
(npm run dev > /tmp/vite-dev.log 2>&1 &)
sleep 4
grep "Local:" /tmp/vite-dev.log
```

開瀏覽器逐項驗收：

| 項目 | 期望 |
|---|---|
| `/#/photos` | 標題「相片專區」+ 副標「共 1 個相簿、6 張照片」+ 1 張封面卡 |
| 點封面 | 進到 `/#/photos/orange-cat-daily-1`、masonry 3 欄、6 張顯示 |
| 縮窗 < 1024px | masonry 變 2 欄 |
| 縮窗 < 768px | masonry 變 1 欄 |
| 點 grid 任一張 | URL 變 `?photo=N`（lightbox 還沒接、頁面不變） |
| `← 返回相簿總覽` | 回到 `/#/photos` |
| Light/Dark 切換 | 頁面背景、卡片底色都跟著切 |

```bash
pkill -f "vite" 2>/dev/null; sleep 1
```

- [ ] **Step 5: Commit Phase 3**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
rm -rf my-app/dist
git add -A
git commit -m "feat(photos): nested routes + PhotoLanding + AlbumCover + AlbumDetail + MasonryGrid (no lightbox yet)"
```

---

## Phase 4 — Lightbox

### Task 4.1: LightboxThumbnails

**Files:**
- Create: `my-app/src/pages/PhotoPage/LightboxThumbnails.tsx`
- Create: `my-app/src/pages/PhotoPage/LightboxThumbnails.module.css`

- [ ] **Step 1: 建 `LightboxThumbnails.module.css`**

```css
.strip {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  max-width: 90vw;
  margin: 0 auto;
}
.strip::-webkit-scrollbar {
  height: 6px;
}
.strip::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}
.thumb {
  flex: 0 0 auto;
  height: 60px;
  width: auto;
  background: transparent;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  opacity: 0.6;
  transition:
    opacity 0.15s,
    border-color 0.15s;
}
.thumb:hover {
  opacity: 1;
}
.thumb img {
  height: 100%;
  width: auto;
  display: block;
}
.thumbActive {
  border-color: white;
  opacity: 1;
}
```

- [ ] **Step 2: 建 `LightboxThumbnails.tsx`**

```tsx
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
```

- [ ] **Step 3: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 4.2: Lightbox 元件

**Files:**
- Create: `my-app/src/pages/PhotoPage/Lightbox.tsx`
- Create: `my-app/src/pages/PhotoPage/Lightbox.module.css`

- [ ] **Step 1: 建 `Lightbox.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  color: white;
}
.close {
  background: transparent;
  border: 0;
  color: white;
  cursor: pointer;
  opacity: 0.8;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close:hover,
.close:focus-visible {
  opacity: 1;
}
.close:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
.counter {
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  opacity: 0.8;
}

.stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 24px;
  min-height: 0;
}
.image {
  max-width: 90vw;
  max-height: 75vh;
  object-fit: contain;
  display: block;
  animation: imgFadeIn 0.25s ease-out;
}
@keyframes imgFadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  color: white;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.nav:hover {
  background: rgba(255, 255, 255, 0.1);
}
.nav:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
.navPrev {
  left: 16px;
}
.navNext {
  right: 16px;
}
.navDisabled {
  opacity: 0.3;
  pointer-events: none;
}

.footer {
  padding-bottom: 16px;
}
```

- [ ] **Step 2: 建 `Lightbox.tsx`**

```tsx
import { useCallback, useEffect, useRef } from 'react';
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Focus trap：只在 close / prev / next / thumbnails 之間循環
  const handleKeyDownInOverlay = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled])',
    );
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
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            hasPrev ? `${styles.nav} ${styles.navPrev}` : `${styles.nav} ${styles.navPrev} ${styles.navDisabled}`
          }
          onClick={goPrev}
          aria-label="上一張"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            hasNext ? `${styles.nav} ${styles.navNext}` : `${styles.nav} ${styles.navNext} ${styles.navDisabled}`
          }
          onClick={goNext}
          aria-label="下一張"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
```

- [ ] **Step 3: typecheck + lint**

```bash
npm run typecheck 2>&1 | tail -3
npm run lint 2>&1 | tail -3
```

Expected: 0 errors.

### Task 4.3: AlbumDetail 接 Lightbox

**Files:**
- Modify: `my-app/src/pages/PhotoPage/AlbumDetail.tsx`

- [ ] **Step 1: 完全替換 `AlbumDetail.tsx`**

```tsx
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
```

> 註：`openLightbox` 與 `onChangeIndex` 都複用同一個函式 — 行為都是「更新 `?photo=N`」。

- [ ] **Step 2: lint + typecheck + build**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
npm run build 2>&1 | tail -5
```

Expected: 0 errors、`✓ built`。

### Task 4.4: dev 視覺驗收 + commit Phase 4

- [ ] **Step 1: 啟 dev**

```bash
pkill -f "vite" 2>/dev/null; sleep 1
(npm run dev > /tmp/vite-dev.log 2>&1 &)
sleep 4
grep "Local:" /tmp/vite-dev.log
```

開瀏覽器逐項驗收：

| 項目 | 期望 |
|---|---|
| `/#/photos/orange-cat-daily-1` | masonry 顯示 6 張、layout 不抖 |
| 點任一張圖 | lightbox 開啟、URL 多 `?photo=N`、背景全黑 |
| `←` 鍵 / 左箭頭按鈕 | 換到前一張、URL 同步 |
| `→` 鍵 / 右箭頭按鈕 | 換到下一張、URL 同步 |
| `Esc` 鍵 | 關閉 lightbox、URL 移除 `?photo` |
| 點黑色背景 | 關閉 |
| 點圖片本身 | 不關（也不切下一張） |
| 第一張時左箭頭 | 變灰、無 hover 效果 |
| 最後一張時右箭頭 | 變灰、無 hover 效果 |
| `Home` 鍵 | 跳到第一張 |
| `End` 鍵 | 跳到最後一張 |
| 計數器（右上） | 正確顯示 `N / 6` |
| 縮圖列（底部） | 當前縮圖白色框 + opacity 1、其他 opacity 0.6 |
| 點縮圖 | 跳到該張、縮圖列自動 scroll 到 active |
| 重整 `?photo=3` | 進頁直接打開第 4 張（index 3） |
| 重整時若 `?photo=999` | lightbox 不開啟（清掉的話 URL 還在但不影響） |
| 背景 scroll lock | 開 lightbox 後背景不能捲、頁面寬度不跳動 |
| Tab 鍵在 lightbox 內 | 在 close → prev → next → thumbnails 之間循環、不跑出 |
| Esc 關閉後 | focus 回到原來點擊的 grid 圖片 |
| Light / Dark 切換 | grid 背景變、lightbox 永遠黑底 |

```bash
pkill -f "vite" 2>/dev/null; sleep 1
```

- [ ] **Step 2: Commit Phase 4**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
rm -rf my-app/dist
git add -A
git commit -m "feat(photos): Lightbox with focus trap + keyboard nav + body scroll lock + deep link"
```

---

## Phase 5 — 收尾與部署

### Task 5.1: 最終驗收

- [ ] **Step 1: 從乾淨狀態跑全套**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
rm -rf dist
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
npm run build 2>&1 | tail -5
```

Expected: 三項全綠。

- [ ] **Step 2: preview 驗證 production build**

```bash
pkill -f "vite" 2>/dev/null; sleep 1
(npm run preview > /tmp/vite-preview.log 2>&1 &)
sleep 3
grep "Local:" /tmp/vite-preview.log
```

開 `http://localhost:4173/ChrisSu/`、重跑 Phase 4 Task 4.4 的全部驗收。

```bash
pkill -f "vite" 2>/dev/null; sleep 1
```

### Task 5.2: Push + PR

- [ ] **Step 1: 確認 commit 歷史**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git log --oneline master..HEAD
```

Expected: 3 個 commit（Phase 1+2、Phase 3、Phase 4）。

- [ ] **Step 2: Push**

```bash
git push -u origin feature/photo-gallery
```

Expected: branch pushed、終端顯示 PR 連結。

- [ ] **Step 3: 在瀏覽器開 PR**

到 `https://github.com/SuChenYu0623/ChrisSu/pull/new/feature/photo-gallery`，title 與 body 範例：

```
title: feat(photos): redesign photo gallery — masonry grid + lightbox

## Summary
依 docs/superpowers/specs/2026-06-09-photo-gallery-redesign.md 重新設計相片頁：

- `Photo { src, alt, width, height }` 型別取代 `images: string[]`，避免 layout shift
- 路由改為 `/photos/*` nested，相簿頁用 `?photo=N` query 控制 lightbox 開閉（深連結）
- 新元件：PhotoLanding（封面 grid）/ AlbumCover / AlbumDetail / MasonryGrid / Lightbox / LightboxThumbnails
- 刪掉：PhotoAlbum / PhotoDetail / PhotoActionBar（IG 互動按鈕全拿掉）
- data/photos.ts 只留「胖橘日常 1」（6 張真照片，sips 量測尺寸），刪除 5 個假相簿
- Lightbox：焦點陷阱、鍵盤導航（← → Esc Home End）、body scroll lock 補 scrollbar 寬度、預載前後 1 張、雙主題（lightbox 永遠黑底）
- Masonry：CSS column-count，3 / 2 / 1 欄響應式

## Test plan
- [ ] CI 跑過（lint + typecheck + build）
- [ ] `/photos` landing 顯示封面卡、hover 浮起
- [ ] 點封面進相簿頁、masonry layout 不抖
- [ ] lightbox 全部互動（鍵盤、滑鼠、URL 同步）
- [ ] 重整 `?photo=N` 直接打開
- [ ] 響應式 < 1024 / < 768
- [ ] Light / Dark 切換
- [ ] Tab focus trap + Esc 後 focus 還原
```

---

## 驗證總表

| 項目 | 通過條件 |
|---|---|
| Build | `npm run build` 無 error |
| Typecheck | `npm run typecheck` 無 error |
| Lint | `npm run lint` 無 error |
| Landing | `/photos` 顯示「胖橘日常 1」單卡 |
| AlbumDetail | masonry 3 / 2 / 1 欄響應式、6 張顯示 |
| Lightbox 開啟 | 點圖、`?photo=N` 出現、背景黑 |
| Lightbox 切換 | ← / → / Home / End / 左右箭頭 / thumbnail 點擊都正確 |
| Lightbox 關閉 | Esc / 點背景 / 關閉按鈕 |
| Lightbox 圖片 | 點本身不關、不切換 |
| 深連結 | 重整 `?photo=3` 直接開 |
| Body lock | 開 lightbox 背景不能捲、不跳寬 |
| Focus trap | Tab 在按鈕間循環、Esc 後 focus 回 grid 觸發點 |
| 預載 | console 看 network 前後各預載 1 張 |
| Light/Dark | grid 變、lightbox 不變 |
| 既有頁面 | Introduction / Notes / Tools 視覺不受影響 |

---

## 不在這份 plan 內

- 單元 / E2E 測試
- 相簿上傳功能
- 標籤、搜尋、篩選
- EXIF 解析
- 圖片下載按鈕
- 圖片 zoom-in pan / pinch zoom
- 濾鏡、編輯
- thumbnail 縮圖 / 圖片 CDN 優化
- 替換 `--notes-*` token 為 `--photo-*`（沿用即可）
- 動其他頁面（Introduction / Notes / Tools）

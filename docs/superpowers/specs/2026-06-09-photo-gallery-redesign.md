# 相片專區 — 高質感圖庫重新設計

## Context

目前 `PhotoPage` 的問題：

- 只佔螢幕左半 50%（`.page { width: 50% }` hardcoded）
- 6 個相簿只有 1 個（胖橘日常 1）是真照片、其他都是 pngtree 假圖
- 沒有 lightbox — 「點圖看大圖」靠 carousel + 一排縮圖、視覺侷促
- IG 風的 ❤️ / 留言 / 分享 / 收藏按鈕點下去全部 `alert('未開放...')`，純裝飾
- 相簿封面三圖排版 hacky（rotate / z-index 疊上去）、不耐看
- 沒響應式、< 1024 px 整個跑版

本次重新設計：把相片頁從「半 IG 半 demo」升級到**圖庫 / Lightbox 風格**的高質感檢視體驗。

---

## 決策摘要

| 項目 | 決定 |
|---|---|
| 內容範圍 | 只保留「胖橘日常 1」（6 張真照片），其他假相簿全部刪除 |
| 視覺風格 | 圖庫 / Lightbox 風 — 頁面跟主題切，lightbox 永遠黑底 |
| Landing | 相簿封面 grid（為未來擴充保留） |
| 相簿內容 | Masonry grid（CSS `column-count`）+ 點圖開 lightbox |
| Lightbox | 全螢幕、左右箭頭、`Esc`/點背景關閉、底部縮圖列、深連結 `?photo=N` |
| IG 互動按鈕 | 全部移除（❤️ / 留言 / 分享 / 收藏） |
| 雙主題 | 沿用筆記頁 `--notes-*` token；lightbox 永遠黑底 |
| 圖片資料 | `Photo { src, alt, width, height }` — width/height 給 masonry 與 lightbox 用，避免 layout shift |

---

## 1. 路由設計

```
/photos                          → PhotoLanding（相簿封面 grid）
/photos/:albumId                 → AlbumDetail（masonry grid）
/photos/:albumId?photo=N         → 同上 + lightbox 打開第 N 張（0-indexed）
```

**設計理由**：
- `lightbox` 不是獨立路由 — 只是相簿頁的 overlay state，用 `useSearchParams` 控制
- `?photo=N` 用 `replace: true` 更新 URL（不留 history），按瀏覽器上一頁 = 關 lightbox
- 重整 `/photos/album-1?photo=3` 進來直接開 lightbox（深連結）

`App.tsx` 路由改成：

```tsx
<Route path="/photos/*" element={<PhotoPage />} />
```

PhotoPage 內部自己掛 nested `<Routes>`（跟 NotesPage 同模式）。

---

## 2. 元件結構

新增 / 改寫的檔案（全在 `src/pages/PhotoPage/`）：

| 檔案 | 角色 |
|---|---|
| `index.tsx` | 內含 `<Routes>`：index → PhotoLanding、`:albumId` → AlbumDetail |
| `PhotoLanding.tsx` | 相簿封面 grid（取代原 PhotoPage 列表） |
| `AlbumCover.tsx` | 單張封面卡（取代舊 PhotoAlbum.tsx） |
| `AlbumDetail.tsx` | 相簿頁：toolbar + MasonryGrid + Lightbox 控制 |
| `MasonryGrid.tsx` | 純展示：CSS column-count grid |
| `Lightbox.tsx` | 全螢幕檢視器：焦點陷阱、鍵盤、預載、URL 同步 |
| `LightboxThumbnails.tsx` | 底部縮圖列 |
| `PhotoPage.module.css` | 全面重寫 |

**刪除的檔案**：

- `src/pages/PhotoPage/PhotoAlbum.tsx`（→ AlbumCover）
- `src/pages/PhotoPage/PhotoDetail.tsx`（→ AlbumDetail + Lightbox）
- `src/pages/PhotoPage/PhotoActionBar.tsx`（互動按鈕全拿掉）

**不再使用的圖片資產**（可選擇刪除以縮 bundle，**保留**以免將來想用）：
- `src/images/heartClick.png` / `heartNotClick.png` / `message.png` / `send.png` / `bookmark.png`
- → **保留** 在 repo 裡、不刪（vite tree-shake 不會打包未 import 的資源）

---

## 3. 資料層

### 3.1 型別（`src/types/index.ts`）

新型別：

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
  date?: string;       // YYYY-MM
  photos: Photo[];
};
```

> 註：取代既有的 `Album { id, title, images: string[] }`。`images: string[]` 被 `photos: Photo[]` 替換。

### 3.2 資料（`src/data/photos.ts`）

只留一個相簿，其他全刪：

```ts
import type { Album } from '../types';
import photo1 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-1.jpg';
// ... import photo-2 ~ photo-6

export const albums: Album[] = [
  {
    id: 'orange-cat-daily-1',
    title: '胖橘日常 1',
    description: '橘子在家的紀錄',
    date: '2024-03',
    photos: [
      { src: photo1, alt: '橘子翻肚', width: 4032, height: 3024 },
      // ... 其他 5 張，各自帶 width/height
    ],
  },
];

export const findAlbumById = (id: string): Album | undefined =>
  albums.find((album) => album.id === id);
```

**注意**：`id` 從 `album-1` 改成有意義的 `orange-cat-daily-1`（URL 友善、未來擴充更明確）。

### 3.3 取得圖片寬高

實作時用 macOS `sips` 一次性查出 6 張的 pixelWidth / pixelHeight，手動填到 `photos.ts`。實作 plan 內會有對應 task：

```bash
for f in src/pages/PhotoPage/photoImages/orange-cat-daily-1/photo-*.jpg; do
  echo "=== $f ==="
  sips -g pixelWidth -g pixelHeight "$f"
done
```

---

## 4. PhotoLanding（`/photos`）

```
┌────────────────────────────────────────────────────────────┐
│  相片專區                                                  │
│  共 1 個相簿、6 張照片                                     │
│                                                            │
│  ┌──────────────────────┐                                  │
│  │                      │                                  │
│  │   [封面照片]         │                                  │
│  │   (4:3 ratio)        │                                  │
│  │                      │                                  │
│  └──────────────────────┘                                  │
│  胖橘日常 1                                                │
│  2024-03 · 6 張                                            │
└────────────────────────────────────────────────────────────┘
```

**規格**：

- 頁面標題 `<h1>相片專區</h1>`、副標「共 X 個相簿、Y 張照片」
- 容器：`max-width: 1280px`、置中、上下 padding 32px
- Grid：`display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 360px)); gap: 24px`
- 封面卡片：
  - 4:3 比例（用 `aspect-ratio: 4 / 3`）
  - 封面用 `album.photos[0].src`、`object-fit: cover`
  - 卡片陰影：`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`、dark mode 加深
  - hover：`transform: translateY(-4px)`、`box-shadow` 加深、圖片 `scale(1.05)`、transition `0.3s ease`
  - 標題在卡片下方（不疊在圖上）、`font-size: 18px`、`font-weight: 600`
  - meta（日期 + 張數）：`font-size: 13px`、`fg-muted`

**頁面色票**：用 `--notes-*` token（沿用筆記頁的 design tokens、不再重複定義）

---

## 5. AlbumDetail（`/photos/:albumId`）

```
┌────────────────────────────────────────────────────────────┐
│  ← 返回相簿總覽                              胖橘日常 1     │
│  ─────────────────────────────────────────────────────────  │
│                                                            │
│  ┌────────┐  ┌────────┐  ┌────────┐                       │
│  │ photo1 │  │ photo2 │  │ photo3 │                       │
│  │ (4032× │  │        │  │        │                       │
│  │  3024) │  │        │  │        │                       │
│  └────────┘  │        │  └────────┘                       │
│  ┌────────┐  └────────┘  ┌────────┐                       │
│  │ photo4 │  ┌────────┐  │ photo6 │                       │
│  │        │  │ photo5 │  │        │                       │
│  └────────┘  └────────┘  └────────┘                       │
└────────────────────────────────────────────────────────────┘
```

**Toolbar（頂部）**：

- 左：`<Link to="/photos">` 顯示「← 返回相簿總覽」、`font-size: 14px`、`fg-muted`、hover `accent`
- 右：相簿標題、`font-size: 24px`、`font-weight: 600`
- 下方 1 px 分隔線

**Masonry Grid**：

```css
.grid {
  column-count: 3;
  column-gap: 12px;
  margin-top: var(--space-4);
}
.grid figure {
  break-inside: avoid;
  margin: 0 0 12px;
  cursor: zoom-in;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
}
.grid img {
  width: 100%;
  height: auto;
  display: block;
  filter: brightness(0.95);
  transition: filter 0.2s;
}
.grid figure:hover img {
  filter: brightness(1);
}

@media (max-width: 1024px) {
  .grid { column-count: 2; }
}
@media (max-width: 768px) {
  .grid { column-count: 1; }
}
```

**圖片元素**：

```tsx
<figure onClick={() => openLightbox(index)}>
  <img
    src={photo.src}
    alt={photo.alt}
    width={photo.width}
    height={photo.height}
    loading="lazy"
  />
</figure>
```

> `width` / `height` 屬性給瀏覽器算 aspect ratio、避免載入時 layout shift。`loading="lazy"` 給原生 lazy load（< 1024 px 變單欄、第一張之後的會在進視窗才載）。

**找不到相簿**：`if (!album) return <Navigate to="/photos" replace />`

---

## 6. Lightbox

### 6.1 視覺

```
┌────────────────────────────────────────────────────────────┐
│  ✕                                              3 / 6      │
│                                                            │
│                                                            │
│  ‹           ┌──────────────────────────┐           ›     │
│              │                          │                  │
│              │                          │                  │
│              │       [大圖]             │                  │
│              │  max-width 90vw          │                  │
│              │  max-height 75vh         │                  │
│              │  object-fit contain      │                  │
│              │                          │                  │
│              └──────────────────────────┘                  │
│                                                            │
│              ▢ ▢ ▢ ▣ ▢ ▢                                  │
└────────────────────────────────────────────────────────────┘
```

- 背景：`position: fixed; inset: 0; z-index: 100; background: rgba(0, 0, 0, 0.95)`
- 大圖：`max-width: 90vw; max-height: 75vh; object-fit: contain`、載入時 fade-in（opacity 0 → 1, 0.2s）
- 左/右箭頭：垂直置中、邊距 32px、圓形透明按鈕 48 × 48、white chevron SVG、hover `background: rgba(255,255,255,0.1)`
  - 第一張：左箭頭 `opacity: 0.3; pointer-events: none`
  - 最後一張：右箭頭 `opacity: 0.3; pointer-events: none`
- 關閉按鈕（左上）：白色 ✕、28 × 28、`opacity: 0.8`、hover `opacity: 1`
- 計數器（右上）：白色文字、`font-variant-numeric: tabular-nums`、`font-size: 14px`、`{current + 1} / {total}`
- Thumbnail strip：底部水平捲動條、縮圖高 60px、選中項 `outline: 2px solid white`

### 6.2 互動

**鍵盤**：
- `←` → previous
- `→` → next
- `Esc` → close
- `Home` → 第一張
- `End` → 最後一張

**滑鼠 / 觸控**：
- 點背景（非圖片本身） → close
- 點圖片本身 → **不做任何事**（避免誤關、也不切下一張）
- 點箭頭按鈕 → 切換
- 點縮圖 → 跳到該張
- 不做 swipe 手勢、不做 cursor 變化（左右切換完全由箭頭與鍵盤負責）

**深連結 / URL 同步**：
- 進 lightbox → `setSearchParams({ photo: String(index) }, { replace: true })`
- 切圖 → 同上更新
- 關 lightbox → `setSearchParams({}, { replace: true })`
- 進頁時若 `searchParams.get('photo')` 有合法 index → 自動開 lightbox

### 6.3 焦點與可訪性

- 開 lightbox 時：`previousFocus = document.activeElement`，把 focus 移到 close 按鈕
- Focus trap：tab 鍵在 `[close, prev, next, ...thumbnails]` 之間循環、不會跑出 lightbox
- 關閉時：focus 回 `previousFocus`（通常是觸發的 grid 圖片）
- `role="dialog"`、`aria-modal="true"`、`aria-label="圖片檢視"`

### 6.4 Body scroll lock

開 lightbox 時鎖住背景捲動。**不要用 `position: fixed`**（會跳到頁首），用：

```ts
useEffect(() => {
  const original = document.body.style.overflow;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`; // 補 scrollbar 寬度避免跳動
  return () => {
    document.body.style.overflow = original;
    document.body.style.paddingRight = '';
  };
}, []);
```

### 6.5 預載

當前圖 index = N：用瀏覽器 `<link rel="preload">` 或建立 `new Image()` 預載 N-1 與 N+1（若存在）。實作用 `useEffect`：

```ts
useEffect(() => {
  const preload = (i: number) => {
    if (i < 0 || i >= photos.length) return;
    const img = new Image();
    img.src = photos[i].src;
  };
  preload(currentIndex - 1);
  preload(currentIndex + 1);
}, [currentIndex, photos]);
```

---

## 7. CSS 與 Design Tokens

不新增 token。沿用筆記頁的 `--notes-*` token（背景、文字、邊框、accent）。Lightbox 用寫死 `rgba(0,0,0,0.95)` 跟白色（不跟主題走）。

---

## 8. App.tsx 路由變更

從：

```tsx
<Route path="/photos" element={<PhotoPage />} />
<Route path="/photos/:albumId" element={<PhotoDetail />} />
```

改成：

```tsx
<Route path="/photos/*" element={<PhotoPage />} />
```

`PhotoDetail` 元件從 App.tsx import 拿掉（已被刪除）。

---

## 9. Scope（明確排除）

- 不做相簿上傳功能
- 不做標籤、搜尋、篩選
- 不解析 EXIF（拍攝時間、相機型號、GPS）
- 不做下載按鈕
- 不做圖片 zoom-in pan / pinch zoom
- 不做圖片濾鏡、編輯
- 不做 thumbnail 縮圖優化（直接用原圖）
- 不替換現有的 `--notes-*` token 為 `--photo-*`、沿用即可
- 不動其他頁面（Introduction / Tools / Notes）

---

## 10. 驗證方式

- `npm run lint` / `npm run typecheck` / `npm run build` 全綠
- `/photos` 顯示 1 張「胖橘日常 1」封面卡（4:3 比例、hover 浮起、上移 4px）
- 點封面 → 進 `/photos/orange-cat-daily-1`、masonry grid 顯示 6 張、layout 不抖
- 點任一圖 → lightbox 開啟、URL 變成 `?photo=N`、背景變黑
- `←` / `→` / `Esc` / `Home` / `End` 鍵盤操作正確
- 點黑色背景關閉、點圖片本身不關
- thumbnail strip 點擊跳轉、目前圖有白色 outline
- 重整 `/photos/orange-cat-daily-1?photo=3` 直接打開該圖
- 第一張時左箭頭灰、最後一張時右箭頭灰
- Light / Dark mode 切換時 grid 背景變、lightbox 仍黑
- < 1024px 變 2 欄、< 768px 變 1 欄
- 開 lightbox 時背景不能捲、scrollbar 不跳
- Tab 在 lightbox 內循環、關閉後 focus 回觸發的 grid 圖片

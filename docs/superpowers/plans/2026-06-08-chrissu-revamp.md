# ChrisSu 個人網站全面翻新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `my-app/` 從 CRA + JS + 單一 App.css 全面遷移到 Vite + TypeScript + CSS Modules + HashRouter，加上 GitHub Actions CI/deploy gate，並修掉散落的重複代碼、過時 API、無障礙與 SEO 問題。

**Architecture:**
- 工具鏈：Vite 5 + `@vitejs/plugin-react` + TypeScript（strict）
- 樣式：CSS Modules（`*.module.css`）+ 全站 CSS variables（色票/間距）
- 路由：`HashRouter` + 英文 slug，避免 GitHub Pages 重整 404；資料從 `data/photos.ts` / `data/notes.ts` 查詢取代 `location.state`
- 結構：`pages/` 放頁面、`components/` 放共用元件、`data/` 集中硬編碼內容、`hooks/` 放共用 hook、`types/` 放共用型別
- CI：GitHub Actions 跑 `lint + typecheck + build`，主分支 push 自動部署到 `gh-pages`

**Tech Stack:** Vite 5、React 18、TypeScript 5、react-router-dom 6（HashRouter）、react-markdown 9、ESLint 8 + `@typescript-eslint`、Prettier、`peaceiris/actions-gh-pages`

**Reference spec:** `/Users/admin/.claude/plans/claude-md-shimmying-cascade.md`

**Working directory:** 除非特別註明，所有 cd / 路徑都以 `/Users/admin/Desktop/myProject/ChrisSu/my-app` 為基準。

**TDD note:** 這份 plan 的 scope 是「基建遷移 + 結構重構」，spec §10 明確排除單元/E2E 測試（CI 只跑 lint + typecheck + build）。每個任務的「驗證」步驟以「在瀏覽器確認功能正常」+「lint/typecheck/build 通過」為主，而非寫測試。所有對 routing、PhotoDetail 重整等行為的驗收都會明確列出。

---

## Phase 0 — 前置與安全網

### Task 0.1: 確認 git 乾淨且建立 feature branch

**Files:** (no file changes)

- [ ] **Step 1: 確認 working tree 乾淨**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 2: 建立 feature branch**

```bash
git checkout -b chore/revamp-vite-ts
```

Expected: `Switched to a new branch 'chore/revamp-vite-ts'`

- [ ] **Step 3: 確認原本的 build 可以跑（baseline）**

```bash
cd my-app && npm install && npm run build && cd ..
```

Expected: `build/` 目錄產生、無錯誤。這是回頭比對的基準。

---

## Phase 1 — Vite + TypeScript 基建（一次遷移完）

> 此階段結束時 `npm run dev` 與 `npm run build` 必須可跑，且四個頁面都看得到（即使內部還沒重構）。

### Task 1.1: 移除 CRA，安裝 Vite + TS 依賴

**Files:**
- Modify: `my-app/package.json`

- [ ] **Step 1: 移除 CRA 依賴**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm uninstall react-scripts @testing-library/jest-dom @testing-library/react @testing-library/user-event web-vitals
```

- [ ] **Step 2: 安裝 Vite + TypeScript + plugin**

```bash
npm install --save-dev vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

- [ ] **Step 3: 安裝/更新 ESLint TS 套件**

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh prettier
```

- [ ] **Step 4: 更新 `package.json` scripts**

把 `scripts` 換成：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx,.js,.jsx",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,css,md}\"",
    "deploy": "gh-pages -d dist"
  }
}
```

同時移除 `eslintConfig` 與 `browserslist` 區塊（移到獨立檔）；保留 `homepage` 不動（gh-pages 套件會看）。

- [ ] **Step 5: 安裝 type stub for react-syntax-highlighter（若有報缺）**

```bash
npm install --save-dev @types/react-syntax-highlighter
```

### Task 1.2: 建立 Vite + TS 設定檔

**Files:**
- Create: `my-app/vite.config.ts`
- Create: `my-app/tsconfig.json`
- Create: `my-app/tsconfig.node.json`
- Create: `my-app/src/vite-env.d.ts`

- [ ] **Step 1: 建立 `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ChrisSu/',
  build: { outDir: 'dist' },
  server: { port: 3000, open: true },
});
```

- [ ] **Step 2: 建立 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowJs": true,
    "esModuleInterop": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

> 註：保留 `allowJs: true`，讓 Phase 2 漸進改 TS 時不會壞掉。Phase 2 結束會把它關掉。

- [ ] **Step 3: 建立 `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 建立 `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

### Task 1.3: 把 `index.html` 從 `public/` 搬到 root 並更新

**Files:**
- Create: `my-app/index.html`（從 `my-app/public/index.html` 改寫）
- Delete: `my-app/public/index.html`

- [ ] **Step 1: 在 root 建立新的 `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="蘇禎佑（Chris Su）個人作品集 — Crawler Engineer & Front End" />
    <meta property="og:title" content="Chris Su's Personal Webpage" />
    <meta property="og:description" content="蘇禎佑（Chris Su）個人作品集 — Crawler Engineer & Front End" />
    <meta property="og:image" content="/ChrisSu/home_icon.png" />
    <link rel="icon" href="/ChrisSu/home_icon.png" />
    <link rel="apple-touch-icon" href="/ChrisSu/home_icon.png" />
    <link rel="manifest" href="/ChrisSu/manifest.json" />
    <link href="https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap" rel="stylesheet" />
    <title>Chris Su's Personal Webpage</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: 刪除舊的 `public/index.html`**

```bash
rm /Users/admin/Desktop/myProject/ChrisSu/my-app/public/index.html
```

> 註：`public/home_icon.png`、`manifest.json` 等其他資產保留。Vite 會把 `public/` 視為靜態資源根目錄，但服務時前綴是 base path（`/ChrisSu/`），所以 `index.html` 內的路徑要寫成 `/ChrisSu/home_icon.png`。

### Task 1.4: 建立新的 entry point `main.tsx`

**Files:**
- Create: `my-app/src/main.tsx`
- Delete: `my-app/src/index.js`
- Delete: `my-app/src/reportWebVitals.js`
- Delete: `my-app/src/setupTests.js`
- Delete: `my-app/src/App.test.js`
- Delete: `my-app/src/logo.svg`（若存在；CRA 預設資產）

- [ ] **Step 1: 建立 `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 2: 刪除舊檔**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app/src
rm -f index.js reportWebVitals.js setupTests.js App.test.js logo.svg index.css
```

- [ ] **Step 3: 先在 `src/styles/globals.css` 建一個 placeholder（之後 Phase 3 填內容）**

```bash
mkdir -p /Users/admin/Desktop/myProject/ChrisSu/my-app/src/styles
```

```css
/* src/styles/globals.css — token definitions arrive in Phase 3 */
:root {
  --color-fg: #272727;
  --color-fg-soft: #4F4F4F;
  --color-fg-muted: #A6A6A6;
  --color-border: #D9D9D9;
  --color-accent: #5B4B00;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
}
```

### Task 1.5: 修正既有 `App.js` / `MainPage` 讓 Vite 可以跑

> 此時還未做完整 routing 重構，目標是「跑得起來」即可。後續 Phase 3 才正式換 HashRouter。

**Files:**
- Modify: `my-app/src/App.js`（先保留 JS、等 Phase 2 改 TSX）
- Modify: `my-app/src/MainPage/index.js`（暫保留 BrowserRouter）

- [ ] **Step 1: 移除舊 `App.css` 在 `MainPage/index.js` 的依賴路徑問題**

確認 `import '.././App.css'` 改成 `import '../App.css'`（兩種寫法都通，但統一格式）。同時把 `import { React } from 'react'` 改成 `import React from 'react'`。

- [ ] **Step 2: 把 `MainPage/NavigationBar.js` 同樣修正 import**

把 `import { React } from 'react'` 改成 `import React from 'react'`、`import '.././App.css'` 改成 `import '../App.css'`。

### Task 1.6: 跑 Vite dev server，確認四個頁面可訪

- [ ] **Step 1: 啟動 dev server**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run dev
```

Expected: server 起在 `http://localhost:3000`，自動打開瀏覽器。因為 `base: '/ChrisSu/'`，dev URL 會變成 `http://localhost:3000/ChrisSu/`。

- [ ] **Step 2: 手動點過四個分頁，確認可開**

- `/ChrisSu/IntroductionPage`
- `/ChrisSu/NotesPage`
- `/ChrisSu/ToolsPage`
- `/ChrisSu/PhotoPage`

Expected: 視覺與遷移前一致（路由與樣式都還是舊的）。任何 console error 都要記錄並修掉。

- [ ] **Step 3: 跑 build**

```bash
npm run build
```

Expected: `dist/` 目錄產生、無錯誤。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: migrate from CRA to Vite + TS scaffolding"
```

---

## Phase 2 — 結構搬遷與 TS 改寫

> 葉節點先做：types/data/hooks/共用元件。然後再改頁面。

### Task 2.1: 建立目錄骨架

**Files:**
- Create: `my-app/src/types/`、`hooks/`、`data/`、`components/`、`pages/`

- [ ] **Step 1: 建立空目錄**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app/src
mkdir -p types hooks data components pages/IntroductionPage pages/NotesPage pages/ToolsPage/tools pages/PhotoPage
```

### Task 2.2: 建立共用型別 `src/types/index.ts`

**Files:**
- Create: `my-app/src/types/index.ts`

- [ ] **Step 1: 寫入型別定義**

```ts
export type Profile = {
  cnName: string;
  enName: string;
  birthday: string;
  school: string;
  company: string;
  programLanguages: string;
  experience: string[];
};

export type ProjectExperience = {
  title: string;
  githubLink: string;
  liveLink?: string;
};

export type ExperienceSectionData = {
  id: string;
  title: string;
  bgImage: string;
  avatarImage: string;
  groups: {
    subtitle: string;
    projects: ProjectExperience[];
  }[];
};

export type NoteEntry = {
  slug: string;
  title: string;
};

export type NoteCategory = {
  key: string;
  label: string;
  notes: NoteEntry[];
};

export type ToolEntry = {
  slug: string;
  label: string;
};

export type Album = {
  id: string;
  title: string;
  images: string[];
};

export type NavItem = {
  label: string;
  path: string;
};
```

### Task 2.3: 抽出 `useCopyToClipboard` hook

**Files:**
- Create: `my-app/src/hooks/useCopyToClipboard.ts`

- [ ] **Step 1: 寫入 hook**

```ts
import { useCallback } from 'react';

export function useCopyToClipboard() {
  return useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`已複製到剪貼板: ${text}`);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      alert('複製失敗，請手動選取複製');
    }
  }, []);
}
```

### Task 2.4: 建立 `data/profile.ts`

**Files:**
- Create: `my-app/src/data/profile.ts`

- [ ] **Step 1: 寫入個資**

```ts
import type { Profile, ExperienceSectionData } from '../types';
import BG_IMG from '../images/BG.png';
import BG_CODE1 from '../images/BG-code1.jpg';
import BG_CODE2 from '../images/BG-code2.jpg';
import reactImg from '../images/react.png';
import crawlerImg from '../images/web-crawler.png';

export const profile: Profile = {
  cnName: '蘇禎佑',
  enName: 'chris',
  birthday: '1999/06/23',
  school: 'National Kaohsiung University of Science and Technology EE',
  company: 'BigGo 樂方股份有限公司',
  programLanguages: 'JavaScript, Python, C, solidity',
  experience: ['React', 'Extension', 'JS爬蟲', '智能合約', 'AI'],
};

export const profileBackground = BG_IMG;

export const experienceSections: ExperienceSectionData[] = [
  {
    id: 'React',
    title: 'React Project',
    bgImage: BG_CODE1,
    avatarImage: reactImg,
    groups: [
      {
        subtitle: 'WEB',
        projects: [
          {
            title: 'SocialMedia',
            githubLink: 'https://github.com/SuChenYu0623/SocialMedia',
            liveLink: 'https://suchenyu0623.github.io/SocialMedia/',
          },
          {
            title: 'Game',
            githubLink: 'https://github.com/SuChenYu0623/Game',
            liveLink: 'https://suchenyu0623.github.io/Game/',
          },
        ],
      },
      {
        subtitle: 'APP',
        projects: [
          {
            title: 'RandomSelectMealApp',
            githubLink: 'https://github.com/SuChenYu0623/RandomSelectMealApp',
          },
          {
            title: 'ReactNative_game_app',
            githubLink: 'https://github.com/SuChenYu0623/ReactNative_game_app',
          },
        ],
      },
    ],
  },
  {
    id: 'JS爬蟲',
    title: 'JS 爬蟲',
    bgImage: BG_CODE2,
    avatarImage: crawlerImg,
    groups: [
      {
        subtitle: 'GITHUB',
        projects: [
          {
            title: 'CrawlerData',
            githubLink: 'https://github.com/SuChenYu0623/CrawlerData',
          },
        ],
      },
    ],
  },
];
```

### Task 2.5: 建立 `data/notes.ts`

**Files:**
- Create: `my-app/src/data/notes.ts`

- [ ] **Step 1: 寫入分類**

```ts
import type { NoteCategory } from '../types';

export const noteCategories: NoteCategory[] = [
  {
    key: 'Python',
    label: 'Python',
    notes: [
      { slug: 'python-commands', title: 'Python 常用指令' },
      { slug: 'pandas-numpy', title: 'Pandas & Numpy' },
    ],
  },
  {
    key: 'JavaScript',
    label: 'JavaScript',
    notes: [
      { slug: 'javascript-commands', title: 'JavaScript 常用指令' },
      { slug: 'react', title: 'React' },
      { slug: 'nextjs', title: 'NextJS' },
    ],
  },
  {
    key: 'React',
    label: 'React',
    notes: [{ slug: 'react-hook', title: 'React HOOK' }],
  },
];
```

### Task 2.6: 重新命名 Markdown notes 檔案為英文 slug

> 中文檔名在動態 import 時容易引起 OS / bundler 路徑問題，順手改英文。

**Files:**
- Rename: `my-app/src/pages/NotesPage/notes/Python/python-commands.md`（from `Python 常用指令.md`）
- Rename: `my-app/src/pages/NotesPage/notes/Python/pandas-numpy.md`（from `Pandas & Numpy.md`）
- Rename: `my-app/src/pages/NotesPage/notes/JavaScript/javascript-commands.md`（from `JavaScript 常用指令.md`）
- Rename: `my-app/src/pages/NotesPage/notes/JavaScript/react.md`（from `React.md`）
- Rename: `my-app/src/pages/NotesPage/notes/JavaScript/nextjs.md`（from `NextJS.md`）
- Rename: `my-app/src/pages/NotesPage/notes/React/react-hook.md`（from `React HOOK.md`）

- [ ] **Step 1: 搬移整個 notes 目錄到新位置並改名**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app/src
mkdir -p pages/NotesPage/notes/Python pages/NotesPage/notes/JavaScript pages/NotesPage/notes/React
git mv "NotesPage/notes/Python/Python 常用指令.md" pages/NotesPage/notes/Python/python-commands.md
git mv "NotesPage/notes/Python/Pandas & Numpy.md" pages/NotesPage/notes/Python/pandas-numpy.md
git mv "NotesPage/notes/JavaScript/JavaScript 常用指令.md" pages/NotesPage/notes/JavaScript/javascript-commands.md
git mv "NotesPage/notes/JavaScript/React.md" pages/NotesPage/notes/JavaScript/react.md
git mv "NotesPage/notes/JavaScript/NextJS.md" pages/NotesPage/notes/JavaScript/nextjs.md
git mv "NotesPage/notes/React/React HOOK.md" pages/NotesPage/notes/React/react-hook.md
```

### Task 2.7: 建立 `data/tools.ts`

**Files:**
- Create: `my-app/src/data/tools.ts`

- [ ] **Step 1: 寫入工具清單**

```ts
import type { ToolEntry } from '../types';

export const tools: ToolEntry[] = [
  { slug: 'duplication-check', label: '檢查重複元素' },
  { slug: 'cookie-diff', label: '檢查 cookie 差異' },
];
```

### Task 2.8: 建立 `data/photos.ts`

**Files:**
- Create: `my-app/src/data/photos.ts`

- [ ] **Step 1: 寫入相簿（先用現有資料，把六本相簿都列出）**

```ts
import type { Album } from '../types';

const sharedImages = [
  'https://png.pngtree.com/png-vector/20230928/ourmid/pngtree-cute-cat-animal-png-image_10149335.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-sitting-orange-cat-on-white-background-png-image_7094889.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-cat-isolated-on-white-background-png-image_7094972.png',
];

const buildImages = () => [...sharedImages, ...sharedImages, ...sharedImages];

export const albums: Album[] = [
  { id: 'album-1', title: '相簿1', images: buildImages() },
  { id: 'album-2', title: '相簿2', images: buildImages() },
  { id: 'album-3', title: '相簿3', images: buildImages() },
  { id: 'album-4', title: '相簿4', images: buildImages() },
  { id: 'album-5', title: '相簿5', images: buildImages() },
  { id: 'album-6', title: '相簿6', images: buildImages() },
];

export const findAlbumById = (id: string): Album | undefined =>
  albums.find((album) => album.id === id);
```

### Task 2.9: 建立 `data/nav.ts`（導覽列定義）

**Files:**
- Create: `my-app/src/data/nav.ts`

- [ ] **Step 1: 寫入導覽列**

```ts
import type { NavItem } from '../types';

export const navItems: NavItem[] = [
  { label: '個人簡介', path: '/introduction' },
  { label: '筆記總覽', path: '/notes' },
  { label: '懶人工具', path: '/tools' },
  { label: '相片專區', path: '/photos' },
];
```

### Task 2.10: 抽出共用 `TextArea` 元件

**Files:**
- Create: `my-app/src/components/TextArea.tsx`
- Create: `my-app/src/components/TextArea.module.css`

- [ ] **Step 1: 建 CSS Module**

```css
/* src/components/TextArea.module.css */
.textArea {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
  background-color: var(--color-fg);
  color: var(--color-fg-muted);
}
.title {
  font-weight: bold;
}
.copyBtn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: transparent;
  color: inherit;
  border: none;
  cursor: pointer;
}
.copyBtn img {
  width: 16px;
  height: 16px;
}
.input {
  flex: 1;
  width: 100%;
  resize: none;
  padding: var(--space-2);
}
```

- [ ] **Step 2: 建元件**

```tsx
import { useRef, type ChangeEvent } from 'react';
import copyImg from '../images/copy.png';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import styles from './TextArea.module.css';

type TextAreaProps = {
  name: string;
  value: unknown;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

export function TextArea({ name, value, disabled, onChange }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const copy = useCopyToClipboard();
  const text = disabled
    ? JSON.stringify(value)
    : typeof value === 'string'
      ? value
      : String(value ?? '');

  return (
    <div className={styles.textArea}>
      <div className={styles.option}>
        <span className={styles.title}>{name}</span>
        <button type="button" className={styles.copyBtn} onClick={() => copy(text)}>
          <span>copy</span>
          <img src={copyImg} alt="複製" />
        </button>
      </div>
      <textarea
        className={styles.input}
        name={name}
        value={text}
        onChange={onChange}
        ref={ref}
        disabled={disabled}
      />
    </div>
  );
}
```

### Task 2.11: 抽出 `DefaultImage` 元件

**Files:**
- Create: `my-app/src/components/DefaultImage.tsx`
- Create: `my-app/src/components/DefaultImage.module.css`

- [ ] **Step 1: 建 CSS Module**

```css
/* src/components/DefaultImage.module.css */
.wrapper {
  position: relative;
}
.img {
  object-fit: cover;
}
.mask {
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
}
```

- [ ] **Step 2: 建元件**

```tsx
import styles from './DefaultImage.module.css';

type DefaultImageProps = {
  image: string;
  alt: string;
  width?: string;
};

export function DefaultImage({ image, alt, width }: DefaultImageProps) {
  return (
    <div className={styles.wrapper} style={width ? { width } : undefined}>
      <img className={styles.img} style={width ? { width } : undefined} src={image} alt={alt} />
      <div className={styles.mask} />
    </div>
  );
}
```

### Task 2.12: 改寫 `NavigationBar` 為 TSX

**Files:**
- Create: `my-app/src/components/NavigationBar.tsx`
- Create: `my-app/src/components/NavigationBar.module.css`
- Delete: `my-app/src/MainPage/NavigationBar.js`（Phase 2 結束時整個 `MainPage/` 一併刪除）

- [ ] **Step 1: 建 CSS Module（樣式內容從 App.css 的 `.NavigationBar` 區段搬過來，Phase 3 統一）**

```css
/* src/components/NavigationBar.module.css — 樣式待 Phase 3 補完，先佔位 */
.bar { display: flex; padding: var(--space-3); background: var(--color-fg); }
.item { padding: 0 var(--space-3); }
.link { color: var(--color-fg-muted); text-decoration: none; }
.link:hover { color: var(--color-border); }
```

- [ ] **Step 2: 建元件**

```tsx
import { Link } from 'react-router-dom';
import type { NavItem } from '../types';
import styles from './NavigationBar.module.css';

type NavigationBarProps = {
  items: NavItem[];
};

export function NavigationBar({ items }: NavigationBarProps) {
  return (
    <nav className={styles.bar}>
      {items.map((item) => (
        <div key={item.path} className={styles.item}>
          <Link to={item.path} className={styles.link}>
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
```

### Task 2.13: 改寫 `App.tsx` 並切換到 HashRouter

**Files:**
- Create: `my-app/src/App.tsx`
- Delete: `my-app/src/App.js`
- Delete: `my-app/src/MainPage/index.js`

> 此時頁面元件還沒重寫，所以 `App.tsx` 先 import 舊的 JS 頁面元件（`allowJs: true` 已開）。下一個任務開始把頁面換成 TSX。

- [ ] **Step 1: 建 `App.tsx`**

```tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationBar } from './components/NavigationBar';
import { navItems } from './data/nav';
import IntroductionPage from './pages/IntroductionPage';
import NotesPage from './pages/NotesPage';
import ToolsPage from './pages/ToolsPage';
import PhotoPage from './pages/PhotoPage';
import { PhotoDetail } from './pages/PhotoPage/PhotoDetail';
import './App.css';

export default function App() {
  return (
    <HashRouter>
      <NavigationBar items={navItems} />
      <div className="App-content">
        <Routes>
          <Route path="/" element={<Navigate to="/introduction" replace />} />
          <Route path="/introduction" element={<IntroductionPage />} />
          <Route path="/notes/*" element={<NotesPage />} />
          <Route path="/tools/*" element={<ToolsPage />} />
          <Route path="/photos" element={<PhotoPage />} />
          <Route path="/photos/:albumId" element={<PhotoDetail />} />
          <Route path="*" element={<Navigate to="/introduction" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
```

- [ ] **Step 2: 刪掉舊 entry**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app/src
rm -f App.js MainPage/index.js MainPage/NavigationBar.js
rmdir MainPage 2>/dev/null || true
```

> 註：此時 build 會炸，因為 `pages/*` 還沒建好。下個任務馬上補上。

### Task 2.14: 改寫 `IntroductionPage` 為 TSX 並拆分子元件

**Files:**
- Create: `my-app/src/pages/IntroductionPage/index.tsx`
- Create: `my-app/src/pages/IntroductionPage/Avatar.tsx`
- Create: `my-app/src/pages/IntroductionPage/ProfileTable.tsx`
- Create: `my-app/src/pages/IntroductionPage/ExperienceSection.tsx`
- Create: `my-app/src/pages/IntroductionPage/ExperienceProject.tsx`
- Create: `my-app/src/pages/IntroductionPage/IntroductionPage.module.css`
- Delete: `my-app/src/IntroductionPage/index.js`

- [ ] **Step 1: 建 CSS Module（樣式從 `App.css` 的 `.IntroductionPage / .Avatar / .Introduction*` 搬過來，先佔位、Phase 3 統一）**

```css
/* src/pages/IntroductionPage/IntroductionPage.module.css */
.page { display: flex; flex-direction: column; }
.section { display: flex; padding: var(--space-4); background-size: cover; background-position: center; }
.avatar { display: flex; align-items: center; justify-content: center; }
.avatar img { width: 100%; }
.introduction { padding: var(--space-3); }
.title { font-size: 24px; font-weight: bold; }
.subtitle { font-size: 18px; font-weight: bold; margin-top: var(--space-3); }
.experienceTag { color: var(--color-accent); font-weight: bold; cursor: pointer; margin-right: var(--space-3); }
.saying { display: flex; flex-direction: column; padding: var(--space-5); align-items: center; }
.experienceProject { display: flex; align-items: center; gap: var(--space-2); }
.link { display: inline-block; width: 20px; height: 20px; background-size: contain; background-repeat: no-repeat; }
```

- [ ] **Step 2: 建 `Avatar.tsx`**

```tsx
import styles from './IntroductionPage.module.css';

type AvatarProps = {
  image: string;
  width?: string;
  alt: string;
};

export function Avatar({ image, width, alt }: AvatarProps) {
  const numericWidth = width ? Number(width.match(/([0-9]+)/)?.[1] ?? 0) : 0;
  const padding = width ? (400 - numericWidth) / 2 : 0;
  const style = width ? { width, height: width, padding: `${padding}px` } : undefined;
  return (
    <div className={styles.avatar} style={style}>
      <img src={image} alt={alt} />
    </div>
  );
}
```

- [ ] **Step 3: 建 `ExperienceProject.tsx`**

```tsx
import type { ProjectExperience } from '../../types';
import githubImg from '../../images/github.png';
import linkImg from '../../images/link.png';
import styles from './IntroductionPage.module.css';

export function ExperienceProject({ title, githubLink, liveLink }: ProjectExperience) {
  return (
    <div className={styles.experienceProject}>
      <span>{title}</span>
      <a
        className={styles.link}
        style={{ backgroundImage: `url(${githubImg})` }}
        href={githubLink}
        target="_blank"
        rel="noreferrer"
        aria-label={`${title} GitHub`}
      />
      {liveLink && (
        <a
          className={styles.link}
          style={{ backgroundImage: `url(${linkImg})` }}
          href={liveLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`${title} demo`}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: 建 `ProfileTable.tsx`**

```tsx
import type { Profile } from '../../types';
import styles from './IntroductionPage.module.css';

type Props = { profile: Profile };

export function ProfileTable({ profile }: Props) {
  const scrollTo = (id: string) => {
    document.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className={styles.introduction}>
      <div className={styles.title}>Crawler Engineer &amp; Front End</div>
      <br />
      <table style={{ borderTop: '1px black solid' }}>
        <tbody>
          <tr>
            <th colSpan={6}>NAME</th>
            <td colSpan={4}>
              {profile.cnName} {profile.enName}
            </td>
          </tr>
          <tr>
            <th colSpan={6}>BORN DATE</th>
            <td colSpan={4}>{profile.birthday}</td>
          </tr>
          <tr>
            <th colSpan={6}>WORK AT</th>
            <td colSpan={4}>{profile.company}</td>
          </tr>
          <tr>
            <th colSpan={6}>GRADUATED FROM</th>
            <td colSpan={4}>{profile.school}</td>
          </tr>
          <tr>
            <th colSpan={6}>PROGRAM LANGUAGE</th>
            <td colSpan={4}>{profile.programLanguages}</td>
          </tr>
          <tr>
            <th colSpan={6}>PROJECT EXPERIENCE</th>
            <td colSpan={4}>
              {profile.experience.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={styles.experienceTag}
                  onClick={() => scrollTo(item)}
                >
                  {item}
                </button>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: 建 `ExperienceSection.tsx`**

```tsx
import type { ExperienceSectionData } from '../../types';
import { Avatar } from './Avatar';
import { ExperienceProject } from './ExperienceProject';
import styles from './IntroductionPage.module.css';

type Props = { data: ExperienceSectionData };

export function ExperienceSection({ data }: Props) {
  return (
    <div id={data.id} className={styles.section} style={{ backgroundImage: `url(${data.bgImage})` }}>
      <Avatar image={data.avatarImage} width="200px" alt={`${data.title} icon`} />
      <div className={styles.introduction}>
        <div className={styles.title}>{data.title}</div>
        <br />
        {data.groups.map((group) => (
          <div key={group.subtitle}>
            <div className={styles.subtitle}>{group.subtitle}</div>
            <table style={{ borderTop: '1px black solid' }}>
              <tbody>
                {group.projects.map((project) => (
                  <tr key={project.title}>
                    <th colSpan={6}>PROJECT NAME</th>
                    <td colSpan={4}>
                      <ExperienceProject {...project} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 建 `index.tsx`**

```tsx
import { Avatar } from './Avatar';
import { ProfileTable } from './ProfileTable';
import { ExperienceSection } from './ExperienceSection';
import { profile, profileBackground, experienceSections } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export default function IntroductionPage() {
  return (
    <div className={styles.page}>
      <div className={styles.section} style={{ backgroundImage: `url(${profileBackground})` }}>
        <Avatar image={profileBackground} alt="background avatar" />
        <ProfileTable profile={profile} />
      </div>
      {experienceSections.map((section) => (
        <ExperienceSection key={section.id} data={section} />
      ))}
      <div className={styles.saying}>
        <div>生而為人，能照顧愛惜自己就好了！</div>
        <div>인간으로서 스스로를 돌볼 수 있다면 참 좋을 것 같아요</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: 刪除舊 JS**

```bash
rm -rf /Users/admin/Desktop/myProject/ChrisSu/my-app/src/IntroductionPage
```

### Task 2.15: 改寫 `NotesPage` 為 TSX

**Files:**
- Create: `my-app/src/pages/NotesPage/index.tsx`
- Create: `my-app/src/pages/NotesPage/Note.tsx`
- Create: `my-app/src/pages/NotesPage/Sidebar.tsx`
- Create: `my-app/src/pages/NotesPage/NotesPage.module.css`
- Delete: `my-app/src/NotesPage/index.js`、`Note.js`

- [ ] **Step 1: 建 CSS Module**

```css
/* src/pages/NotesPage/NotesPage.module.css */
.page { display: flex; width: 100%; height: 100%; }
.sidebar { width: 240px; padding: var(--space-3); background: var(--color-fg); }
.parent { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: var(--space-2); }
.title { font-weight: bold; }
.arrow { display: inline-block; width: 16px; height: 16px; background-repeat: no-repeat; background-size: contain; }
.arrowUp { background-image: var(--up-arrow); }
.arrowDown { background-image: var(--down-arrow); }
.list { list-style: none; padding-left: var(--space-3); }
.note { flex: 1; padding: var(--space-3); overflow: auto; background: var(--color-fg-soft); color: var(--color-fg-muted); }
.collapsed { display: none; }
```

- [ ] **Step 2: 建 `Sidebar.tsx`**

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NoteCategory } from '../../types';
import styles from './NotesPage.module.css';

type Props = { categories: NoteCategory[] };

export function Sidebar({ categories }: Props) {
  return (
    <aside className={styles.sidebar}>
      {categories.map((category) => (
        <SidebarSection key={category.key} category={category} />
      ))}
    </aside>
  );
}

function SidebarSection({ category }: { category: NoteCategory }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div>
      <div className={styles.parent} onClick={() => setCollapsed((v) => !v)}>
        <span className={styles.title}>{category.label}</span>
        <span className={collapsed ? styles.arrowDown : styles.arrowUp} aria-hidden />
      </div>
      <ul className={collapsed ? `${styles.list} ${styles.collapsed}` : styles.list}>
        {category.notes.map((note) => (
          <li key={note.slug}>
            <Link to={`/notes/${category.key}/${note.slug}`}>{note.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: 建 `Note.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import styles from './NotesPage.module.css';

export function Note() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [text, setText] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!category || !slug) {
      setText('');
      return;
    }
    import(`./notes/${category}/${slug}.md?raw`)
      .then((module: { default: string }) => {
        if (!cancelled) setText(module.default);
      })
      .catch(() => {
        if (!cancelled) setText('');
      });
    return () => {
      cancelled = true;
    };
  }, [category, slug]);

  const extractCodeText = (children: unknown): string => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(extractCodeText).join('');
    if (children && typeof children === 'object' && 'props' in children) {
      const inner = (children as { props?: { children?: unknown } }).props?.children;
      return extractCodeText(inner);
    }
    return '';
  };

  return (
    <div className={styles.note}>
      <Markdown
        components={{
          h1: 'h2',
          pre: ({ children }) => (
            <pre>
              <code>{children}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(extractCodeText(children))}
              >
                複製
              </button>
            </pre>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
```

- [ ] **Step 4: 建 `index.tsx`**

```tsx
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Note } from './Note';
import { noteCategories } from '../../data/notes';
import styles from './NotesPage.module.css';

export default function NotesPage() {
  return (
    <div className={styles.page}>
      <Sidebar categories={noteCategories} />
      <Routes>
        <Route path=":category/:slug" element={<Note />} />
      </Routes>
    </div>
  );
}
```

- [ ] **Step 5: 刪舊檔**

```bash
rm -f /Users/admin/Desktop/myProject/ChrisSu/my-app/src/NotesPage/index.js /Users/admin/Desktop/myProject/ChrisSu/my-app/src/NotesPage/Note.js
rmdir /Users/admin/Desktop/myProject/ChrisSu/my-app/src/NotesPage 2>/dev/null || true
```

### Task 2.16: 改寫 `ToolsPage` 為 TSX

**Files:**
- Create: `my-app/src/pages/ToolsPage/index.tsx`
- Create: `my-app/src/pages/ToolsPage/Sidebar.tsx`
- Create: `my-app/src/pages/ToolsPage/ToolsPage.module.css`
- Create: `my-app/src/pages/ToolsPage/tools/CheckCookieDiff.tsx`
- Create: `my-app/src/pages/ToolsPage/tools/CheckDuplicationItems.tsx`
- Delete: `my-app/src/ToolsPage/`（整個資料夾）

- [ ] **Step 1: 建 CSS Module**

```css
/* src/pages/ToolsPage/ToolsPage.module.css */
.page { display: flex; width: 100%; height: 100%; }
.sidebar { width: 240px; padding: var(--space-3); background: var(--color-fg); }
.list { list-style: none; padding-left: 0; }
.list li { padding: var(--space-2) 0; }
.content { flex: 1; padding: var(--space-3); }
.row { display: flex; padding: var(--space-3); height: 50%; }
.cell { margin: var(--space-2); flex: 1; height: 100%; }
.actions { padding: var(--space-3); display: flex; justify-content: center; gap: var(--space-3); }
.table { width: 100%; }
.col2 { width: 10%; }
.col6 { width: 30%; }
.col4 { width: 20%; }
```

- [ ] **Step 2: 建 `Sidebar.tsx`**

```tsx
import { Link } from 'react-router-dom';
import type { ToolEntry } from '../../types';
import styles from './ToolsPage.module.css';

type Props = { tools: ToolEntry[] };

export function Sidebar({ tools }: Props) {
  return (
    <aside className={styles.sidebar}>
      <ul className={styles.list}>
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link to={`/tools/${tool.slug}`}>{tool.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 3: 建 `CheckCookieDiff.tsx`**

```tsx
import { useState, type ChangeEvent } from 'react';
import { TextArea } from '../../../components/TextArea';
import styles from '../ToolsPage.module.css';

type Row = [key: string, before: string | undefined, after: string | undefined, message: string | undefined];

type State = { code1: string; code2: string; outTable: Row[] };

const cleanCode = (code: string): [string, string][] =>
  code.split('; ').map((item) => {
    const idx = item.indexOf('=');
    return [item.slice(0, idx), item.slice(idx + 1)];
  });

const compareTwoArray = (
  arr1: [string, string][],
  arr2: [string, string][],
): Record<string, { value: string; message: string }> => {
  const result: Record<string, { value: string; message: string }> = {};
  const arr2Keys = arr2.map((item) => item[0]);
  for (const [key, value] of arr1) {
    if (!arr2Keys.includes(key)) {
      result[key] = { value, message: '[this cookie is not defined]' };
      continue;
    }
    const peer = arr2.find((item) => item[0] === key);
    if (peer && value !== peer[1]) {
      result[key] = { value, message: '[this cookie value is modified]' };
    }
  }
  return result;
};

export function CheckCookieDiff() {
  const [state, setState] = useState<State>({ code1: '', code2: '', outTable: [] });

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const checkCookieDiff = () => {
    try {
      const before = compareTwoArray(cleanCode(state.code1), cleanCode(state.code2));
      const after = compareTwoArray(cleanCode(state.code2), cleanCode(state.code1));
      const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
      const outTable: Row[] = keys.map((key) => [
        key,
        before[key]?.value,
        after[key]?.value,
        before[key]?.message ?? after[key]?.message,
      ]);
      setState((prev) => ({ ...prev, outTable }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.row}>
        <div className={styles.cell}>
          <TextArea name="code1" value={state.code1} onChange={handleChange} />
        </div>
        <div className={styles.cell}>
          <TextArea name="code2" value={state.code2} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={checkCookieDiff}>
          parse
        </button>
      </div>
      <div className={styles.row}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.col2}>cookie</th>
              <th className={styles.col6}>before</th>
              <th className={styles.col6}>after</th>
              <th className={styles.col4}>message</th>
            </tr>
          </thead>
          <tbody>
            {state.outTable.map(([key, before, after, message]) => (
              <tr key={key}>
                <td className={styles.col2}>{key}</td>
                <td className={styles.col6}>{before}</td>
                <td className={styles.col6}>{after}</td>
                <td className={styles.col4}>{message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 建 `CheckDuplicationItems.tsx`**

```tsx
import { useState, type ChangeEvent } from 'react';
import { TextArea } from '../../../components/TextArea';
import styles from '../ToolsPage.module.css';

type State = {
  code: string;
  key: string;
  notRepeatArr: unknown[];
  repeatArr: unknown[];
};

const cleanCode = (code: string): string =>
  code
    .trim()
    .replace(/[\n]/gm, '')
    .replace(/(['"]|)([A-Za-z0-9]+)(['"]|):/gm, '"$2":');

export function CheckDuplicationItems() {
  const [state, setState] = useState<State>({
    code: '',
    key: '',
    notRepeatArr: [],
    repeatArr: [],
  });

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const checkDuplication = () => {
    try {
      const arr = JSON.parse(cleanCode(state.code)) as unknown[];
      const isKeyEmpty = state.key === '';
      const filterFunc = (item: unknown, index: number) =>
        isKeyEmpty
          ? arr.indexOf(item) === index
          : arr
              .map((tmp) => (tmp as Record<string, unknown>)[state.key])
              .indexOf((item as Record<string, unknown>)[state.key]) === index;
      const notRepeatArr = arr.filter(filterFunc);
      const repeatArr = arr.filter((item, index) => !filterFunc(item, index));
      setState((prev) => ({ ...prev, notRepeatArr, repeatArr }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.row}>
        <div className={styles.cell}>
          <TextArea name="code" value={state.code} onChange={handleChange} />
        </div>
        <div className={styles.cell}>
          <TextArea name="Repeat" value={state.repeatArr} disabled />
          <TextArea name="notRepeat" value={state.notRepeatArr} disabled />
        </div>
      </div>
      <div className={styles.actions}>
        <div>輸入需要檢查的 key 值（單純 array 則保持為空）</div>
        <input type="text" name="key" value={state.key} onChange={handleChange} />
        <button type="button" onClick={checkDuplication}>
          submit
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 建 `index.tsx`**

```tsx
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CheckCookieDiff } from './tools/CheckCookieDiff';
import { CheckDuplicationItems } from './tools/CheckDuplicationItems';
import { tools } from '../../data/tools';
import styles from './ToolsPage.module.css';

export default function ToolsPage() {
  return (
    <div className={styles.page}>
      <Sidebar tools={tools} />
      <Routes>
        <Route path="cookie-diff" element={<CheckCookieDiff />} />
        <Route path="duplication-check" element={<CheckDuplicationItems />} />
      </Routes>
    </div>
  );
}
```

- [ ] **Step 6: 刪舊檔**

```bash
rm -rf /Users/admin/Desktop/myProject/ChrisSu/my-app/src/ToolsPage
```

### Task 2.17: 改寫 `PhotoPage` 與 `PhotoDetail` 為 TSX

**Files:**
- Create: `my-app/src/pages/PhotoPage/index.tsx`
- Create: `my-app/src/pages/PhotoPage/PhotoAlbum.tsx`
- Create: `my-app/src/pages/PhotoPage/PhotoDetail.tsx`
- Create: `my-app/src/pages/PhotoPage/PhotoActionBar.tsx`
- Create: `my-app/src/pages/PhotoPage/PhotoPage.module.css`
- Delete: `my-app/src/PhotoPage/`（整個資料夾）

- [ ] **Step 1: 建 CSS Module**

```css
/* src/pages/PhotoPage/PhotoPage.module.css */
.page { width: 50%; padding: var(--space-3); }
.album { display: block; margin-bottom: var(--space-3); cursor: pointer; }
.albumImages { display: flex; gap: var(--space-1); }
.albumImages img { width: 33%; object-fit: cover; }
.detail { display: flex; flex-direction: column; align-items: center; padding: var(--space-3); }
.container { width: 100%; max-width: 600px; }
.header { padding: var(--space-3); font-weight: bold; }
.content { display: flex; flex-direction: column; align-items: center; }
.bar { display: flex; align-items: center; width: 100%; }
.barContent { display: flex; overflow-x: auto; gap: var(--space-2); padding: var(--space-2); flex: 1; }
.arrow { padding: 0 var(--space-3); display: flex; align-items: center; background: transparent; border: none; cursor: pointer; }
.footer { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: var(--space-3); }
.actionGroup { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-3); }
.actionButton { height: 30px; background: transparent; border: none; cursor: pointer; padding: 0; }
.actionButton img { height: 30px; }
```

- [ ] **Step 2: 建 `PhotoAlbum.tsx`**

```tsx
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
```

- [ ] **Step 3: 建 `index.tsx`**

```tsx
import { PhotoAlbum } from './PhotoAlbum';
import { albums } from '../../data/photos';
import styles from './PhotoPage.module.css';

export default function PhotoPage() {
  return (
    <div className={styles.page}>
      {albums.map((album) => (
        <PhotoAlbum key={album.id} album={album} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 建 `PhotoActionBar.tsx`**

```tsx
import { useState } from 'react';
import heartClick from '../../images/heartClick.png';
import heartNotClick from '../../images/heartNotClick.png';
import messageImg from '../../images/message.png';
import sendImg from '../../images/send.png';
import bookmarkImg from '../../images/bookmark.png';
import styles from './PhotoPage.module.css';

export function PhotoActionBar() {
  const [liked, setLiked] = useState(false);
  return (
    <div className={styles.footer}>
      <div className={styles.actionGroup}>
        <button type="button" className={styles.actionButton} onClick={() => setLiked((v) => !v)} aria-label="like">
          <img src={liked ? heartClick : heartNotClick} alt="" />
        </button>
        <button type="button" className={styles.actionButton} onClick={() => alert('未開放留言功能')} aria-label="message">
          <img src={messageImg} alt="" />
        </button>
        <button type="button" className={styles.actionButton} onClick={() => alert('未開放分享功能')} aria-label="send">
          <img src={sendImg} alt="" />
        </button>
      </div>
      <div className={styles.actionGroup}>
        <button type="button" className={styles.actionButton} onClick={() => alert('未開放收藏功能')} aria-label="bookmark">
          <img src={bookmarkImg} alt="" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 建 `PhotoDetail.tsx`**

```tsx
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
          <DefaultImage image={album.images[count]} alt={`${album.title} photo ${count + 1}`} width="100%" />
          <div className={styles.bar}>
            <button type="button" className={styles.arrow} onClick={() => scrollBy(-100)} aria-label="scroll left">
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
            <button type="button" className={styles.arrow} onClick={() => scrollBy(100)} aria-label="scroll right">
              <img src={rightArrowImg} alt="" width={20} />
            </button>
          </div>
        </div>
        <PhotoActionBar />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 刪舊檔**

```bash
rm -rf /Users/admin/Desktop/myProject/ChrisSu/my-app/src/PhotoPage
```

### Task 2.18: 收尾 — 關閉 allowJs、驗證 build/typecheck

**Files:**
- Modify: `my-app/tsconfig.json`

- [ ] **Step 1: 把 `tsconfig.json` 的 `allowJs` 改為 `false`**

- [ ] **Step 2: 跑 typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck
```

Expected: no errors. 如有，逐一修正。

- [ ] **Step 3: 跑 build**

```bash
npm run build
```

Expected: `dist/` 產生、無 error。

- [ ] **Step 4: 跑 dev 並逐頁驗收**

```bash
npm run dev
```

- 開 `http://localhost:3000/ChrisSu/#/introduction` → 三個 section 顯示正常
- 點 PROJECT EXPERIENCE 的 tag → 平滑滾動到對應 section
- 開 `/notes/Python/python-commands` → markdown 渲染
- 開 `/tools/cookie-diff` → 兩個 textarea 可輸入，按 parse 出表
- 開 `/tools/duplication-check` → 輸入後 submit 出結果
- 開 `/photos` → 看到六本相簿
- 點任一相簿 → 進到 `/photos/album-N`、顯示放大圖與底部圖列
- **重整 `/photos/album-3` 頁面 → 不會 404，仍正常顯示**
- **重整 `/notes/Python/python-commands` → 不會 404，仍正常顯示**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: migrate pages, data, components to TypeScript + CSS Modules"
```

---

## Phase 3 — 樣式遷移與 App.css 拆解

> 把 571 行的 `App.css` 真正分解掉，讓所有頁面元件都依賴自己的 CSS Module。

### Task 3.1: 把 App.css 的全域 reset / table / button 樣式搬到 globals.css

**Files:**
- Modify: `my-app/src/styles/globals.css`
- Modify: `my-app/src/App.css`（最後會刪除）

- [ ] **Step 1: 開 `App.css` 找出純全域樣式**

純全域指的是：`body / a / button / table / thead / tbody / .container / .App-header / .App-content`。

- [ ] **Step 2: 搬到 `globals.css`（替換 hex 為 CSS var）**

```css
/* src/styles/globals.css */
:root {
  --color-fg: #272727;
  --color-fg-soft: #4F4F4F;
  --color-fg-muted: #A6A6A6;
  --color-border: #D9D9D9;
  --color-accent: #5B4B00;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
body {
  background-color: var(--color-fg-soft);
  color: var(--color-fg-muted);
  font-family: 'Gamja Flower', sans-serif;
}
a { text-decoration: none; color: var(--color-fg-muted); }
a:hover { color: var(--color-border); }
button {
  border-radius: 5px;
  border: 0;
  padding: 10px 15px;
  font-size: 15px;
  color: var(--color-fg-muted);
  background-color: var(--color-fg);
  cursor: pointer;
}
button:hover { background-color: var(--color-border); color: var(--color-fg); }
table { table-layout: fixed; }
thead > tr > th {
  padding: 5px 10px;
  text-align: left;
  font-size: 15px;
  background-color: var(--color-fg);
  color: var(--color-fg-muted);
}
tbody > tr > td {
  padding: 5px 10px;
  text-align: left;
  font-size: 15px;
  background-color: var(--color-fg-muted);
  color: var(--color-fg);
  word-wrap: break-word;
  word-break: break-all;
}
.App-content { min-height: calc(100vh - 60px); display: flex; justify-content: center; }
```

### Task 3.2: 把各區塊原樣式搬到對應 CSS Module

**Files:**
- Modify: `my-app/src/pages/IntroductionPage/IntroductionPage.module.css`
- Modify: `my-app/src/pages/NotesPage/NotesPage.module.css`
- Modify: `my-app/src/pages/ToolsPage/ToolsPage.module.css`
- Modify: `my-app/src/pages/PhotoPage/PhotoPage.module.css`
- Modify: `my-app/src/components/NavigationBar.module.css`
- Modify: `my-app/src/components/TextArea.module.css`
- Modify: `my-app/src/components/DefaultImage.module.css`

- [ ] **Step 1: 用 grep 找出原 App.css 對應區塊**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app/src
grep -n "^\.NavigationBar\|^\.NavigationItem\|^\.IntroductionPage\|^\.IntroductionContent\|^\.Introduction\|^\.Avatar\|^\.NotesPage\|^\.SideBar\|^\.ToolsPage\|^\.ToolsContent\|^\.PhotoAlbum\|^\.PhotoDetail\|^\.PhotoContainer\|^\.PhotoBar\|^\.TextArea\|^\.defaultImg\|^\.defaultMask\|^\.leftArrow\|^\.rightArrow\|^\.upArrow\|^\.downArrow\|^\.Note\|^\.markdown" App.css
```

- [ ] **Step 2: 依規則搬遷**

對每個原 class（如 `.NavigationBar`），把其規則搬到對應 CSS Module 的合理 class 名（camelCase），並把對應元件的 JSX `className="NavigationBar"` 改為 `className={styles.bar}`。

每個頁面元件可能會多帶幾個內部 class（如 `.IntroductionContent` → `styles.section`、`.Introduction-title` → `styles.title`）。這個對應在 Phase 2 已建立的 placeholder CSS Module 內擴充，不要新建。

- [ ] **Step 3: 把所有 `style={{...}}` inline 樣式收斂進 CSS Module**

逐檔搜尋：

```bash
grep -rn 'style={{' src/pages src/components
```

只保留「真正依 props 變動」的 inline style（例：`{ backgroundImage: \`url(${img})\` }`、`{ width: dynamicWidth }`）。其他全部改成 CSS Module class。

- [ ] **Step 4: 刪除 `App.css`**

```bash
rm /Users/admin/Desktop/myProject/ChrisSu/my-app/src/App.css
```

並從 `App.tsx` 移除 `import './App.css'`。

- [ ] **Step 5: build + dev 驗收**

```bash
npm run build && npm run dev
```

逐頁瀏覽，視覺應與 Phase 2 結束時等同或更乾淨。允許小幅差異（顏色/間距改用 CSS var 之後可能會有 1-2 px 不同）。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: extract App.css into per-component CSS Modules with design tokens"
```

---

## Phase 4 — SEO/無障礙、靜態資源、CI/部署

### Task 4.1: 壓縮大型靜態資源

**Files:**
- Modify: `my-app/public/home_icon.png`（2.3 MB → < 500 KB）
- Modify: `my-app/src/images/BG.png`（4.5 MB → < 500 KB）
- Modify: `my-app/src/images/BG-code1.jpg`（1.4 MB → < 500 KB）
- Modify: `my-app/src/images/BG-code2.jpg`（2.0 MB → < 500 KB）

- [ ] **Step 1: 用 sips（macOS 內建）壓縮**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
sips -Z 1024 public/home_icon.png
sips -Z 1920 src/images/BG.png
sips -s format jpeg -s formatOptions 70 src/images/BG-code1.jpg --out src/images/BG-code1.jpg
sips -s format jpeg -s formatOptions 70 src/images/BG-code2.jpg --out src/images/BG-code2.jpg
```

- [ ] **Step 2: 確認檔案大小都 < 500 KB**

```bash
ls -lh public/home_icon.png src/images/BG.png src/images/BG-code1.jpg src/images/BG-code2.jpg
```

- [ ] **Step 3: 開瀏覽器確認視覺沒被破壞**

```bash
npm run dev
```

開 IntroductionPage、檢查三個背景圖仍正常。

### Task 4.2: ESLint + Prettier 規則收斂

**Files:**
- Create: `my-app/.eslintrc.cjs`
- Create: `my-app/.prettierrc`
- Delete: `my-app/.eslintrc.js`（舊版）

- [ ] **Step 1: 建 `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh', '@typescript-eslint'],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

- [ ] **Step 2: 建 `.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 3: 刪舊 `.eslintrc.js`**

```bash
rm /Users/admin/Desktop/myProject/ChrisSu/my-app/.eslintrc.js
```

- [ ] **Step 4: 跑 lint 修剩餘 warning**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run lint
```

Expected: 0 error。warning 視情況修。

- [ ] **Step 5: 跑 prettier 一次性 format**

```bash
npm run format
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: compress static assets and converge lint/format config"
```

### Task 4.3: GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 確認 `.github/workflows/` 目錄存在**

```bash
mkdir -p /Users/admin/Desktop/myProject/ChrisSu/.github/workflows
```

- [ ] **Step 2: 建 `ci.yml`**

```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: my-app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: my-app/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

### Task 4.4: GitHub Actions Deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: 建 `deploy.yml`**

```yaml
name: Deploy
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    defaults:
      run:
        working-directory: my-app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: my-app/package-lock.json
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: my-app/dist
          publish_branch: gh-pages
```

- [ ] **Step 2: 確認 GitHub repo settings**

> 此步驟是給人工確認用：到 GitHub repo 的 Settings → Pages，Source 設為 `gh-pages` branch。Actions → General → Workflow permissions 設為「Read and write」。

### Task 4.5: 補完 `package.json` 與 README

**Files:**
- Modify: `my-app/package.json`
- Modify: `my-app/README.md`

- [ ] **Step 1: 把 `homepage` 移除（HashRouter 不需要，且 Vite 用 `base` 控制）**

從 `package.json` 移除 `"homepage": "https://suchenyu0623.github.io/ChrisSu"` 那一行。

- [ ] **Step 2: 重寫 `README.md`**

```markdown
# ChrisSu 個人網站

蘇禎佑（Chris Su）的個人作品集，部署於 [https://suchenyu0623.github.io/ChrisSu](https://suchenyu0623.github.io/ChrisSu)。

## 技術棧

- Vite 5 + React 18 + TypeScript（strict）
- CSS Modules
- React Router 6（HashRouter）
- 部署到 GitHub Pages（透過 GitHub Actions）

## 開發

```bash
cd my-app
npm install
npm run dev
```

開啟 `http://localhost:3000/ChrisSu/`。

## 常用指令

| 指令 | 用途 |
|---|---|
| `npm run dev` | 本機開發 |
| `npm run build` | 產生 production build |
| `npm run preview` | 本機跑 production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 編譯檢查 |
| `npm run format` | Prettier 格式化 |
| `npm run deploy` | 手動部署到 gh-pages（CI 已自動處理） |

## 內容更新

- 個資與經歷：`src/data/profile.ts`
- 筆記分類與檔案：`src/data/notes.ts` + `src/pages/NotesPage/notes/`
- 工具清單：`src/data/tools.ts`
- 相簿：`src/data/photos.ts`
- 導覽列：`src/data/nav.ts`
```

### Task 4.6: 最終驗收

- [ ] **Step 1: 從乾淨狀態跑全套**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
rm -rf node_modules dist
npm ci
npm run lint
npm run typecheck
npm run build
npm run preview
```

每一步都應該成功，preview 起在 `http://localhost:4173/ChrisSu/`。

- [ ] **Step 2: 在 preview 開啟瀏覽器逐頁驗收**

- `/#/introduction`、`/#/notes/Python/python-commands`、`/#/tools/cookie-diff`、`/#/tools/duplication-check`、`/#/photos`、`/#/photos/album-1`
- **每一頁都重整一次**確認不會 404
- console 無 error / warning（容許 React DevTools 那條）

- [ ] **Step 3: Push 並驗證 CI 與部署**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git push -u origin chore/revamp-vite-ts
```

打開 PR 到 master、確認 CI（`check` job）通過。

merge 到 master 後，等 deploy workflow 跑完，造訪 `https://suchenyu0623.github.io/ChrisSu/` 確認上線。

- [ ] **Step 4: Commit 與 PR 完成**

CI / deploy workflow 已 commit，所有 phase 都完成。

---

## 驗證總表

| 項目 | 通過條件 |
|---|---|
| Build | `npm run build` 無 error，產出 `dist/` |
| Typecheck | `npm run typecheck` 無 error |
| Lint | `npm run lint` 無 error |
| Dev server | `npm run dev` 起在 3000、四頁皆可訪 |
| Preview | `npm run preview` 起在 4173、視覺與 dev 一致 |
| 路由重整不 404 | `/#/photos/album-1`、`/#/notes/Python/python-commands` 重整正常 |
| GitHub Actions CI | PR 上 `check` job 綠燈 |
| GitHub Actions Deploy | master push 後自動部署、線上版可訪 |
| 無障礙 | 所有 `<img>` 有 `alt`、操作按鈕為 `<button>` |
| SEO | `index.html` lang/description/OG 三組 meta 完整 |
| 靜態資源 | `home_icon.png` / `BG*.png|jpg` 都 < 500 KB |
| App.css | 已刪除，樣式分散在 CSS Modules |
| TextArea 重複 | 只剩 `components/TextArea.tsx` 一份 |
| document.execCommand | 全代碼庫已無此呼叫（`grep -r execCommand src`） |

---

## 範圍外（不在這份計劃中）

依 spec §10 排除：
- 單元 / E2E 測試
- i18n 設定
- PWA / Service Worker
- 設計改版（視覺只動到 CSS Modules 化所需的最小幅度）
- 後端 API
- PhotoDetail 的 alert → toast / 真實留言收藏功能

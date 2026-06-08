# 筆記頁面重新設計 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `NotesPage` 從手寫風單欄改造成技術文件風三欄 layout（Sidebar + Main + TOC），加上 Light/Dark 雙主題切換、Shiki 語法高亮、breadcrumb、TOC active scroll spy、Sidebar 搜尋、landing 頁。

**Architecture:**
- 三欄 CSS Grid（`240px 1fr 200px`，響應式 < 1200px 收 TOC，< 900px sidebar 變漢堡 drawer）
- 雙主題用 `<html data-theme="dark">` + CSS variables（限 `--notes-*` 前綴避免污染其他頁面）
- Shiki 用 `createHighlighter` singleton + `defaultColor: 'light'`、dark mode 用 CSS rule 覆蓋成 `--shiki-dark` 變數
- 路由保持 `NotesPage` 內 `<Routes>` nested 子路由：`/notes`（index → NotesLanding）、`/notes/:category/:slug`（Note）
- TOC 用 `IntersectionObserver` + regex extract headings + `github-slugger` 對齊 id

**Tech Stack:** Vite 8 + React 19 + TypeScript 6 strict + CSS Modules + react-markdown 10 + react-router-dom 6 + **新增依賴**：`shiki`、`remark-gfm`、`github-slugger`

**Reference spec:** `/Users/admin/Desktop/myProject/ChrisSu/docs/superpowers/specs/2026-06-09-notes-page-redesign.md`

**Working directory:** 所有 cd / 路徑都以 `/Users/admin/Desktop/myProject/ChrisSu/my-app` 為基準。

**Testing note:** scope 不含單元測試（與前次翻新一致），驗證以「lint + typecheck + build + 瀏覽器手動驗收」為主。

---

## Phase 0 — 前置

### Task 0.1: 建立 feature branch

**Files:** (no file changes)

- [ ] **Step 1: 確認 working tree 乾淨且在 master**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git status
git branch --show-current
```

Expected: `nothing to commit` 且 branch 是 `master`（spec 已 commit 在 37ed0d9）

- [ ] **Step 2: 建立 feature branch**

```bash
git checkout -b feature/notes-redesign
```

Expected: `Switched to a new branch 'feature/notes-redesign'`

### Task 0.2: 安裝依賴

**Files:**
- Modify: `my-app/package.json`、`my-app/package-lock.json`

- [ ] **Step 1: 安裝 shiki / remark-gfm / github-slugger**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm install shiki remark-gfm github-slugger
```

Expected: 三個套件加到 `dependencies`、無 ERESOLVE 錯誤。

- [ ] **Step 2: 驗證套件版本**

```bash
npm ls shiki remark-gfm github-slugger 2>&1 | head -10
```

Expected: `shiki` v3+、`remark-gfm` v4+、`github-slugger` v2+ 都列出。

- [ ] **Step 3: 跑 build 確認沒壞**

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...` 無 error。

- [ ] **Step 4: Commit**

```bash
rm -rf dist
git add package.json package-lock.json
git commit -m "chore: add shiki + remark-gfm + github-slugger for notes redesign"
```

---

## Phase 1 — 雙主題基建

### Task 1.1: 建立 tokens.css（雙主題 CSS variables）

**Files:**
- Create: `my-app/src/styles/tokens.css`
- Modify: `my-app/src/main.tsx`

- [ ] **Step 1: 建 `src/styles/tokens.css`**

```css
:root {
  --notes-bg: #ffffff;
  --notes-bg-subtle: #f8f9fa;
  --notes-bg-code: #f6f8fa;
  --notes-fg: #1f2328;
  --notes-fg-muted: #656d76;
  --notes-fg-soft: #424a53;
  --notes-border: #d0d7de;
  --notes-accent: #0969da;
  --notes-accent-soft: #ddf4ff;

  --notes-font-sans:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial,
    'Microsoft JhengHei', 'PingFang TC', sans-serif;
  --notes-font-mono:
    'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, Monaco, monospace;
}

[data-theme='dark'] {
  --notes-bg: #0d1117;
  --notes-bg-subtle: #161b22;
  --notes-bg-code: #161b22;
  --notes-fg: #e6edf3;
  --notes-fg-muted: #8b949e;
  --notes-fg-soft: #b1bac4;
  --notes-border: #30363d;
  --notes-accent: #58a6ff;
  --notes-accent-soft: rgba(56, 139, 253, 0.15);
}
```

- [ ] **Step 2: 在 `src/main.tsx` 引入**

把現有的：

```tsx
import './styles/globals.css';
```

改為：

```tsx
import './styles/globals.css';
import './styles/tokens.css';
```

(順序：globals 先載入，tokens 在後面以便 override / 補充)

- [ ] **Step 3: 跑 build 驗證**

```bash
npm run build 2>&1 | tail -5
```

Expected: 無 error。

### Task 1.2: 建立 useTheme hook

**Files:**
- Create: `my-app/src/hooks/useTheme.ts`

- [ ] **Step 1: 寫 hook**

```ts
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}
```

- [ ] **Step 2: 跑 typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 1.3: NavigationBar 加主題切換按鈕

**Files:**
- Modify: `my-app/src/components/NavigationBar.tsx`
- Modify: `my-app/src/components/NavigationBar.module.css`

- [ ] **Step 1: 改 `NavigationBar.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import type { NavItem } from '../types';
import styles from './NavigationBar.module.css';

type NavigationBarProps = {
  items: NavItem[];
};

export function NavigationBar({ items }: NavigationBarProps) {
  const { theme, toggle } = useTheme();
  return (
    <nav className={styles.bar}>
      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.path} className={styles.item}>
            <Link to={item.path} className={styles.link}>
              {item.label}
            </Link>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={styles.themeButton}
        onClick={toggle}
        aria-label="切換主題"
        title={theme === 'dark' ? '切換到淺色' : '切換到深色'}
      >
        {theme === 'dark' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </nav>
  );
}
```

- [ ] **Step 2: 改 `NavigationBar.module.css`**

把整個檔案內容換成：

```css
.bar {
  height: 8vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-fg);
  width: 100%;
  padding: 0 var(--space-3);
  box-sizing: border-box;
}
.items {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.item {
  padding: var(--space-2);
  margin: var(--space-2);
}
.link {
  color: var(--color-fg-muted);
  text-decoration: none;
  font-size: 20px;
  font-weight: bolder;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.item:hover,
.link:hover {
  color: var(--color-fg-soft);
  background-color: var(--color-border);
}
.themeButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-fg-muted);
  cursor: pointer;
  border-radius: 6px;
}
.themeButton:hover {
  color: var(--color-border);
  background: rgba(255, 255, 255, 0.08);
}
```

- [ ] **Step 3: 驗證**

```bash
npm run lint 2>&1 | tail -3 && npm run typecheck 2>&1 | tail -3
```

Expected: 0 error。

- [ ] **Step 4: dev 測試**

```bash
npm run dev > /tmp/vite-dev.log 2>&1 &
sleep 4
curl -s -o /dev/null -w "Status %{http_code}\n" "http://localhost:3000/ChrisSu/" || \
  curl -s -o /dev/null -w "Status %{http_code}\n" "http://localhost:3001/ChrisSu/"
pkill -f "vite" 2>/dev/null; sleep 1
```

Expected: HTTP 200。手動驗證：NavigationBar 右側出現 ☀ / 🌙 圖示按鈕、點擊 toggle、`<html>` 多了 `data-theme="dark"` 屬性、重新整理保留設定。

### Task 1.4: Commit Phase 1

- [ ] **Step 1: 確認改動**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git status --short
```

Expected: 5 個檔案（tokens.css, main.tsx, useTheme.ts, NavigationBar.tsx, NavigationBar.module.css）

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(theme): add light/dark theme tokens + useTheme hook + NavigationBar toggle"
```

---

## Phase 2 — Shiki 語法高亮基建

### Task 2.1: 建立 Shiki highlighter singleton

**Files:**
- Create: `my-app/src/lib/shiki.ts`

- [ ] **Step 1: 寫 singleton**

```ts
import type { Highlighter } from 'shiki';
import { createHighlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

export const NOTES_THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const;

export const NOTES_LANGS = [
  'python',
  'javascript',
  'typescript',
  'tsx',
  'jsx',
  'bash',
  'shell',
  'json',
  'css',
  'html',
  'markdown',
] as const;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [NOTES_THEMES.light, NOTES_THEMES.dark],
      langs: [...NOTES_LANGS],
    });
  }
  return highlighterPromise;
}
```

- [ ] **Step 2: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 2.2: Shiki dark mode CSS rule

> 用 `defaultColor: 'light'`（之後 codeToHtml 會這樣呼叫）→ 預設輸出 light theme inline 樣式；dark mode 時用 CSS 規則覆蓋成 `--shiki-dark*` 變數。

**Files:**
- Modify: `my-app/src/styles/tokens.css`

- [ ] **Step 1: 在 tokens.css 末尾追加 shiki dark mode 規則**

```css
/* Shiki dual-theme: dark mode 覆蓋 — Shiki 用 defaultColor: 'light' 時，
   token 預設用 --shiki-light，需要在 dark mode 切到 --shiki-dark。 */
[data-theme='dark'] .shiki,
[data-theme='dark'] .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
```

- [ ] **Step 2: build 確認**

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ built`。

### Task 2.3: Commit Phase 2

- [ ] **Step 1: Commit**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
rm -rf my-app/dist
git add -A
git commit -m "feat(notes): add shiki highlighter singleton + dark mode CSS rule"
```

---

## Phase 3 — 共用元件（CopyButton、Breadcrumb、CodeBlock、TableOfContents、NotesLanding）

### Task 3.1: CopyButton 元件

**Files:**
- Create: `my-app/src/pages/NotesPage/CopyButton.tsx`
- Create: `my-app/src/pages/NotesPage/CopyButton.module.css`

- [ ] **Step 1: 建 module.css**

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-family: var(--notes-font-sans);
  color: var(--notes-fg-muted);
  background: var(--notes-bg-subtle);
  border: 1px solid var(--notes-border);
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.15s, color 0.15s;
}
.button:hover {
  color: var(--notes-fg);
  opacity: 1;
}
.copied {
  color: var(--notes-accent);
  opacity: 1;
}
```

- [ ] **Step 2: 建元件**

```tsx
import { useState } from 'react';
import styles from './CopyButton.module.css';

type Props = { text: string };

export function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <button
      type="button"
      className={copied ? `${styles.button} ${styles.copied}` : styles.button}
      onClick={handleClick}
    >
      {copied ? '已複製 ✓' : '複製'}
    </button>
  );
}
```

- [ ] **Step 3: typecheck + lint**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run lint 2>&1 | tail -3 && npm run typecheck 2>&1 | tail -3
```

Expected: 0 error。

### Task 3.2: CodeBlock 元件（Shiki 整合）

**Files:**
- Create: `my-app/src/pages/NotesPage/CodeBlock.tsx`
- Create: `my-app/src/pages/NotesPage/CodeBlock.module.css`

- [ ] **Step 1: 建 module.css**

```css
.wrapper {
  position: relative;
  margin: var(--space-3) 0;
}
.langLabel {
  position: absolute;
  top: 8px;
  right: 80px;
  font-size: 12px;
  font-family: var(--notes-font-mono);
  color: var(--notes-fg-muted);
  text-transform: lowercase;
  z-index: 1;
}
.copyButtonSlot {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
}
.codeBlock {
  border: 1px solid var(--notes-border);
  border-radius: 6px;
  overflow-x: auto;
  font-family: var(--notes-font-mono);
  font-size: 14px;
  line-height: 1.5;
}
.codeBlock :global(pre.shiki) {
  margin: 0;
  padding: 16px;
  background: var(--notes-bg-code) !important;
}
.fallback {
  margin: 0;
  padding: 16px;
  background: var(--notes-bg-code);
  font-family: var(--notes-font-mono);
  font-size: 14px;
  white-space: pre-wrap;
}
```

- [ ] **Step 2: 建元件**

```tsx
import { useEffect, useState } from 'react';
import { getHighlighter, NOTES_THEMES } from '../../lib/shiki';
import { CopyButton } from './CopyButton';
import styles from './CodeBlock.module.css';

type Props = { lang: string; code: string };

export function CodeBlock({ lang, code }: Props) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((h) => {
        if (cancelled) return;
        const supported = h.getLoadedLanguages().includes(lang);
        const out = h.codeToHtml(code, {
          lang: supported ? lang : 'text',
          themes: NOTES_THEMES,
          defaultColor: 'light',
        });
        setHtml(out);
      })
      .catch((err) => {
        console.error('Shiki highlight failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, code]);

  return (
    <div className={styles.wrapper}>
      <span className={styles.langLabel}>{lang}</span>
      <div className={styles.copyButtonSlot}>
        <CopyButton text={code} />
      </div>
      {html ? (
        <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className={styles.fallback}>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
```

- [ ] **Step 3: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 3.3: Breadcrumb 元件

**Files:**
- Create: `my-app/src/pages/NotesPage/Breadcrumb.tsx`
- Create: `my-app/src/pages/NotesPage/Breadcrumb.module.css`

- [ ] **Step 1: 建 module.css**

```css
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: var(--space-3) 0;
  font-size: 13px;
  color: var(--notes-fg-muted);
  border-bottom: 1px solid var(--notes-border);
  margin-bottom: var(--space-4);
}
.breadcrumb a {
  color: var(--notes-fg-muted);
  text-decoration: none;
}
.breadcrumb a:hover {
  color: var(--notes-accent);
}
.current {
  color: var(--notes-fg);
  font-weight: 500;
}
.separator {
  color: var(--notes-fg-muted);
  opacity: 0.6;
}
```

- [ ] **Step 2: 建元件**

```tsx
import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

type Props = {
  categoryLabel: string;
  noteTitle: string;
};

export function Breadcrumb({ categoryLabel, noteTitle }: Props) {
  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumb}>
      <Link to="/notes">筆記</Link>
      <span aria-hidden className={styles.separator}>
        ·
      </span>
      <span>{categoryLabel}</span>
      <span aria-hidden className={styles.separator}>
        ·
      </span>
      <span aria-current="page" className={styles.current}>
        {noteTitle}
      </span>
    </nav>
  );
}
```

- [ ] **Step 3: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 3.4: extractHeadings 工具

**Files:**
- Create: `my-app/src/lib/extractHeadings.ts`

- [ ] **Step 1: 寫工具**

```ts
import GithubSlugger from 'github-slugger';

export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/**
 * 從 markdown 字串裡抽取 ## 與 ### 標題，回傳含 slug id 的清單。
 * 必須與 Markdown render 用同一個 slugger instance，所以 caller 傳進來。
 */
export function extractHeadings(md: string, slugger: GithubSlugger): Heading[] {
  const lines = md.split('\n');
  const headings: Heading[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const m2 = /^##\s+(.+?)\s*$/.exec(line);
    const m3 = /^###\s+(.+?)\s*$/.exec(line);
    if (m2) {
      headings.push({ id: slugger.slug(m2[1]), text: m2[1], level: 2 });
    } else if (m3) {
      headings.push({ id: slugger.slug(m3[1]), text: m3[1], level: 3 });
    }
  }
  return headings;
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 3.5: TableOfContents 元件

**Files:**
- Create: `my-app/src/pages/NotesPage/TableOfContents.tsx`
- Create: `my-app/src/pages/NotesPage/TableOfContents.module.css`

- [ ] **Step 1: 建 module.css**

```css
.toc {
  position: sticky;
  top: calc(8vh + 32px);
  max-height: calc(100vh - 8vh - 64px);
  overflow-y: auto;
  padding: var(--space-3);
  font-size: 13px;
}
.tocTitle {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--notes-fg-muted);
  margin-bottom: var(--space-2);
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  padding: 4px 0;
  border-left: 2px solid transparent;
  padding-left: var(--space-2);
}
.item[data-active='true'] {
  border-left-color: var(--notes-accent);
}
.item[data-active='true'] a {
  color: var(--notes-accent);
  font-weight: 500;
}
.itemIndent {
  padding-left: var(--space-4);
}
.item a {
  color: var(--notes-fg-muted);
  text-decoration: none;
  display: block;
}
.item a:hover {
  color: var(--notes-fg);
}
```

- [ ] **Step 2: 建元件**

```tsx
import { useEffect, useState } from 'react';
import type { Heading } from '../../lib/extractHeadings';
import styles from './TableOfContents.module.css';

type Props = { headings: Heading[] };

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    const elements: Element[] = [];
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }
    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="目錄" className={styles.toc}>
      <div className={styles.tocTitle}>目錄</div>
      <ul className={styles.list}>
        {headings.map((h) => (
          <li
            key={h.id}
            data-active={activeId === h.id}
            className={
              h.level === 3 ? `${styles.item} ${styles.itemIndent}` : styles.item
            }
          >
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 3.6: NotesLanding 元件

**Files:**
- Create: `my-app/src/pages/NotesPage/NotesLanding.tsx`
- Create: `my-app/src/pages/NotesPage/NotesLanding.module.css`

- [ ] **Step 1: 建 module.css**

```css
.landing {
  max-width: 800px;
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
.cardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-3);
}
.card {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  background: var(--notes-bg-subtle);
  border: 1px solid var(--notes-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--notes-fg);
  transition: border-color 0.15s, transform 0.15s;
}
.card:hover {
  border-color: var(--notes-accent);
  transform: translateY(-2px);
  color: var(--notes-fg);
}
.cardTitle {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}
.cardCount {
  font-size: 13px;
  color: var(--notes-fg-muted);
  margin-bottom: var(--space-2);
}
.cardList {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
}
.cardList li {
  padding: 2px 0;
  color: var(--notes-fg-soft);
}
.cardList li::before {
  content: '·';
  margin-right: 6px;
  color: var(--notes-fg-muted);
}
```

- [ ] **Step 2: 建元件**

```tsx
import { Link } from 'react-router-dom';
import { noteCategories } from '../../data/notes';
import styles from './NotesLanding.module.css';

export function NotesLanding() {
  const total = noteCategories.reduce((n, c) => n + c.notes.length, 0);

  return (
    <article className={styles.landing}>
      <h1 className={styles.title}>筆記總覽</h1>
      <p className={styles.meta}>
        共 {total} 篇筆記，分 {noteCategories.length} 個分類
      </p>
      <div className={styles.cardGrid}>
        {noteCategories.map((cat) => (
          <Link
            key={cat.key}
            to={`/notes/${cat.key}/${cat.notes[0].slug}`}
            className={styles.card}
          >
            <div className={styles.cardTitle}>{cat.label}</div>
            <div className={styles.cardCount}>{cat.notes.length} 篇</div>
            <ul className={styles.cardList}>
              {cat.notes.slice(0, 5).map((n) => (
                <li key={n.slug}>{n.title}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 3.7: Commit Phase 3

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git add -A
git commit -m "feat(notes): add CopyButton / CodeBlock / Breadcrumb / TOC / NotesLanding components + extractHeadings"
```

---

## Phase 4 — 改寫 Note.tsx 與 Sidebar、整合三欄 Layout

### Task 4.1: 改寫 Note.tsx

**Files:**
- Modify: `my-app/src/pages/NotesPage/Note.tsx`

- [ ] **Step 1: 重寫整個檔案**

```tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GithubSlugger from 'github-slugger';
import { CodeBlock } from './CodeBlock';
import { Breadcrumb } from './Breadcrumb';
import { TableOfContents } from './TableOfContents';
import { extractHeadings, type Heading } from '../../lib/extractHeadings';
import { noteCategories } from '../../data/notes';
import styles from './NotesPage.module.css';

function findNoteMeta(category?: string, slug?: string) {
  if (!category || !slug) return null;
  const cat = noteCategories.find((c) => c.key === category);
  if (!cat) return null;
  const note = cat.notes.find((n) => n.slug === slug);
  if (!note) return null;
  return { categoryLabel: cat.label, noteTitle: note.title };
}

export function Note() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [text, setText] = useState('');
  const meta = findNoteMeta(category, slug);

  useEffect(() => {
    let cancelled = false;
    if (!category || !slug) return;
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

  const { headings, slugger } = useMemo(() => {
    const s = new GithubSlugger();
    const h: Heading[] = extractHeadings(text, s);
    s.reset();
    return { headings: h, slugger: s };
  }, [text]);

  if (!meta) {
    return (
      <div className={styles.notFound}>
        <p>找不到這篇筆記。</p>
      </div>
    );
  }

  return (
    <div className={styles.noteLayout}>
      <article className={styles.article}>
        <Breadcrumb categoryLabel={meta.categoryLabel} noteTitle={meta.noteTitle} />
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
            h2: ({ children }) => {
              const id = slugger.slug(String(children));
              return (
                <h2 id={id} className={styles.h2}>
                  {children}
                </h2>
              );
            },
            h3: ({ children }) => {
              const id = slugger.slug(String(children));
              return (
                <h3 id={id} className={styles.h3}>
                  {children}
                </h3>
              );
            },
            a: ({ href, children }) => {
              const isExternal = href?.startsWith('http');
              return (
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                >
                  {children}
                </a>
              );
            },
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className ?? '');
              if (!match) {
                return (
                  <code className={styles.inlineCode} {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <CodeBlock lang={match[1]} code={String(children).replace(/\n$/, '')} />
              );
            },
          }}
        >
          {text}
        </Markdown>
      </article>
      <aside className={styles.tocColumn}>
        <TableOfContents headings={headings} />
      </aside>
    </div>
  );
}
```

> 註：`useMemo` 先用 slugger 跑 `extractHeadings`、reset、再傳給 Markdown components。markdown 內 h2/h3 順序與 extractHeadings 掃描順序相同（兩者都依文件順序 sequential），所以重置後第二輪 slug 結果會與 TOC 的 id 一致。`text` 變化才重算（依賴陣列）。

- [ ] **Step 2: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -5
```

Expected: no errors.

### Task 4.2: 改寫 Sidebar.tsx（搜尋 + active state）

**Files:**
- Modify: `my-app/src/pages/NotesPage/Sidebar.tsx`

- [ ] **Step 1: 重寫整個檔案**

```tsx
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { NoteCategory } from '../../types';
import styles from './NotesPage.module.css';

type Props = { categories: NoteCategory[] };

export function Sidebar({ categories }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        notes: cat.notes.filter((n) => n.title.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.notes.length > 0);
  }, [categories, query]);

  return (
    <aside className={styles.sidebar}>
      <input
        type="search"
        className={styles.search}
        placeholder="搜尋筆記..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="搜尋筆記"
      />
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>找不到符合的筆記</div>
      ) : (
        filtered.map((category) => (
          <SidebarSection key={category.key} category={category} forceExpanded={!!query} />
        ))
      )}
    </aside>
  );
}

function SidebarSection({
  category,
  forceExpanded,
}: {
  category: NoteCategory;
  forceExpanded: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const isCollapsed = !forceExpanded && collapsed;

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!isCollapsed}
      >
        <span>{category.label}</span>
        <span aria-hidden>{isCollapsed ? '▸' : '▾'}</span>
      </button>
      {!isCollapsed && (
        <ul className={styles.noteList}>
          {category.notes.map((note) => (
            <li key={note.slug}>
              <NavLink
                to={`/notes/${category.key}/${note.slug}`}
                className={({ isActive }) =>
                  isActive ? `${styles.noteLink} ${styles.noteLinkActive}` : styles.noteLink
                }
              >
                {note.title}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 4.3: 改寫 NotesPage/index.tsx（三欄 layout + landing route）

**Files:**
- Modify: `my-app/src/pages/NotesPage/index.tsx`

- [ ] **Step 1: 重寫**

```tsx
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Note } from './Note';
import { NotesLanding } from './NotesLanding';
import { noteCategories } from '../../data/notes';
import styles from './NotesPage.module.css';

export default function NotesPage() {
  return (
    <div className={styles.page}>
      <Sidebar categories={noteCategories} />
      <main className={styles.main}>
        <Routes>
          <Route index element={<NotesLanding />} />
          <Route path=":category/:slug" element={<Note />} />
        </Routes>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: no errors.

### Task 4.4: 改寫 NotesPage.module.css（三欄 layout、新樣式）

**Files:**
- Modify: `my-app/src/pages/NotesPage/NotesPage.module.css`

- [ ] **Step 1: 完整改寫整個檔案**

```css
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  width: 100%;
  height: 92vh;
  background: var(--notes-bg);
  color: var(--notes-fg);
  font-family: var(--notes-font-sans);
}

.sidebar {
  background: var(--notes-bg-subtle);
  border-right: 1px solid var(--notes-border);
  padding: var(--space-3);
  overflow-y: auto;
}

.search {
  width: 100%;
  padding: 8px 12px;
  font-family: var(--notes-font-sans);
  font-size: 14px;
  color: var(--notes-fg);
  background: var(--notes-bg);
  border: 1px solid var(--notes-border);
  border-radius: 6px;
  margin-bottom: var(--space-3);
  box-sizing: border-box;
}
.search:focus {
  outline: none;
  border-color: var(--notes-accent);
  box-shadow: 0 0 0 3px var(--notes-accent-soft);
}

.emptyState {
  padding: var(--space-3);
  font-size: 13px;
  color: var(--notes-fg-muted);
  text-align: center;
}

.section {
  margin-bottom: var(--space-3);
}
.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 8px;
  font-family: var(--notes-font-sans);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--notes-fg-muted);
  background: transparent;
  border: 0;
  cursor: pointer;
  border-radius: 4px;
}
.sectionHeader:hover {
  background: transparent;
  color: var(--notes-fg);
}

.noteList {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
}
.noteList li {
  padding: 0;
}
.noteLink {
  display: block;
  padding: 6px 12px;
  margin: 2px 0;
  font-size: 14px;
  color: var(--notes-fg-soft);
  text-decoration: none;
  border-radius: 6px;
  border-left: 3px solid transparent;
}
.noteLink:hover {
  color: var(--notes-fg);
  background: var(--notes-bg);
}
.noteLinkActive {
  color: var(--notes-accent);
  background: var(--notes-accent-soft);
  border-left-color: var(--notes-accent);
  font-weight: 600;
}

.main {
  overflow-y: auto;
  background: var(--notes-bg);
}

.noteLayout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: var(--space-4);
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 var(--space-3);
}

.tocColumn {
  /* TableOfContents 自己是 sticky */
}

.article {
  max-width: 800px;
  padding: var(--space-3) var(--space-3) var(--space-5);
  font-size: 16px;
  line-height: 1.7;
  color: var(--notes-fg);
}

.h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
  margin: var(--space-3) 0 var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--notes-border);
}
.h2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
  margin: var(--space-5) 0 var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--notes-border);
}
.h3 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  margin: var(--space-4) 0 var(--space-2);
}

.article p {
  margin: var(--space-2) 0;
}
.article ul,
.article ol {
  padding-left: var(--space-4);
  margin: var(--space-2) 0;
}
.article li {
  margin: 4px 0;
}
.article blockquote {
  margin: var(--space-3) 0;
  padding: var(--space-2) var(--space-3);
  border-left: 4px solid var(--notes-accent);
  background: var(--notes-bg-subtle);
  color: var(--notes-fg-soft);
}
.article a {
  color: var(--notes-accent);
  text-decoration: none;
}
.article a:hover {
  text-decoration: underline;
}
.article img {
  max-width: 100%;
  border-radius: 6px;
}
.article table {
  border-collapse: collapse;
  margin: var(--space-3) 0;
}
.article th,
.article td {
  padding: 8px 12px;
  border: 1px solid var(--notes-border);
  font-size: 14px;
  background: transparent;
  color: var(--notes-fg);
  text-align: left;
}
.article th {
  background: var(--notes-bg-subtle);
  font-weight: 600;
}

.inlineCode {
  font-family: var(--notes-font-mono);
  font-size: 14px;
  padding: 2px 6px;
  background: var(--notes-bg-subtle);
  border-radius: 4px;
  color: var(--notes-fg);
}

.notFound {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-5) var(--space-3);
  font-family: var(--notes-font-sans);
  color: var(--notes-fg-muted);
  text-align: center;
}

/* 響應式 — < 1200px 收 TOC */
@media (max-width: 1200px) {
  .noteLayout {
    grid-template-columns: minmax(0, 1fr);
  }
  .tocColumn {
    display: none;
  }
}

/* 響應式 — < 900px sidebar 變漢堡 drawer */
@media (max-width: 900px) {
  .page {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
}
```

- [ ] **Step 2: build 驗證**

```bash
npm run build 2>&1 | tail -10
```

Expected: `✓ built in ...`、無 error。

### Task 4.5: Lint + typecheck + commit Phase 4

- [ ] **Step 1: 跑 lint / typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run lint 2>&1 | tail -5 && npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors。

- [ ] **Step 2: Commit**

```bash
rm -rf dist
cd /Users/admin/Desktop/myProject/ChrisSu
git add -A
git commit -m "feat(notes): three-column layout + sidebar search + active state + landing + GFM"
```

---

## Phase 5 — Polish + 漢堡 drawer + 最終驗收

### Task 5.1: 加 < 900px 漢堡 drawer

> sidebar 在窄螢幕變成從左滑出的 drawer，由主內容區頂部一個漢堡按鈕控制開合。

**Files:**
- Modify: `my-app/src/pages/NotesPage/index.tsx`
- Modify: `my-app/src/pages/NotesPage/NotesPage.module.css`

- [ ] **Step 1: 改 `NotesPage/index.tsx`**

```tsx
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Note } from './Note';
import { NotesLanding } from './NotesLanding';
import { noteCategories } from '../../data/notes';
import styles from './NotesPage.module.css';

export default function NotesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.page} data-drawer-open={drawerOpen}>
      <div className={styles.sidebarWrapper}>
        <Sidebar categories={noteCategories} />
      </div>
      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}
      <main className={styles.main}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label="開啟筆記目錄"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Routes>
          <Route index element={<NotesLanding />} />
          <Route path=":category/:slug" element={<Note />} />
        </Routes>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: 把 `NotesPage.module.css` 內既有 sidebar 與響應式區塊更新**

把 `.sidebar` 上方的全域樣式不動；把現有的：

```css
.sidebar {
  background: var(--notes-bg-subtle);
  border-right: 1px solid var(--notes-border);
  padding: var(--space-3);
  overflow-y: auto;
}
```

加一個外層 wrapper（保留 sidebar 內部不動），並在末尾追加 drawer + menu button 樣式（取代既有的 `@media (max-width: 900px)` 區塊）：

把 css 末尾的 `@media (max-width: 900px)` 那段整個替換成：

```css
.sidebarWrapper {
  display: contents;
}

.menuButton {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--notes-border);
  border-radius: 6px;
  color: var(--notes-fg);
  cursor: pointer;
  margin: var(--space-3);
}
.menuButton:hover {
  background: var(--notes-bg-subtle);
}

.backdrop {
  display: none;
}

/* 響應式 — < 900px sidebar 變漢堡 drawer */
@media (max-width: 900px) {
  .page {
    grid-template-columns: 1fr;
  }
  .sidebarWrapper {
    display: block;
    position: fixed;
    top: 8vh;
    left: 0;
    bottom: 0;
    width: 280px;
    z-index: 30;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    background: var(--notes-bg-subtle);
  }
  .page[data-drawer-open='true'] .sidebarWrapper {
    transform: translateX(0);
  }
  .sidebar {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  .menuButton {
    display: inline-flex;
  }
  .page[data-drawer-open='true'] .backdrop {
    display: block;
    position: fixed;
    top: 8vh;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 20;
  }
}
```

- [ ] **Step 3: typecheck + build**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -3 && npm run build 2>&1 | tail -5
```

Expected: 0 errors、`✓ built`。

### Task 5.2: 最終驗收

- [ ] **Step 1: 從乾淨狀態跑全套**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
rm -rf dist
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
npm run build 2>&1 | tail -5
```

Expected: 三項全綠。

- [ ] **Step 2: 啟 dev、手動驗收清單（瀏覽器逐項點過）**

```bash
npm run dev > /tmp/vite-dev.log 2>&1 &
sleep 4
grep "Local:" /tmp/vite-dev.log
```

開啟瀏覽器到 URL，逐項驗收：

| 項目 | 期望 |
|---|---|
| `/#/notes` | 顯示 landing 卡片：Python (2)、JavaScript (3)、React (1) |
| 點 Python 卡片 | 跳到 `/#/notes/Python/python-commands`、breadcrumb 顯示「筆記 · Python · Python 常用指令」 |
| 主題切換按鈕 | 點 ☀/🌙 → background / code block 顏色全切換 |
| 重整 dark mode 後 | 仍保持 dark mode（localStorage 生效） |
| Code block 語法高亮 | python code 區出現紅綠橘配色 |
| Code block 複製 | hover 才完整顯示複製按鈕、點擊變「已複製 ✓」、不彈 alert |
| TOC（右側 200px） | 顯示「基本指令」等 h2、捲動 main 時 active 切換 |
| TOC 點擊 | 跳到對應 heading（smooth scroll 預設行為） |
| Sidebar 搜尋 | 輸入 "react" 只剩相關筆記、清空恢復全部 |
| Sidebar active | 當前筆記項左邊 accent border + 加粗 |
| Sidebar 摺疊 | 點 PYTHON ▾ 收起整類；搜尋時自動展開 |
| 視窗縮到 < 1200px | TOC 消失、article 撐滿 |
| 視窗縮到 < 900px | sidebar 收成漢堡、main 頂部出現 menu icon、點開 drawer 從左滑入 + backdrop |

- [ ] **Step 3: 殺掉 dev server**

```bash
pkill -f "vite" 2>/dev/null
sleep 1
```

- [ ] **Step 4: Commit Phase 5**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
rm -rf my-app/dist
git add -A
git commit -m "feat(notes): mobile hamburger drawer (<900px) + final polish"
```

### Task 5.3: Push 與 PR

- [ ] **Step 1: 確認 branch 歷史**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git log --oneline master..HEAD
```

Expected: 6 個 commit（每個 phase 一個）。

- [ ] **Step 2: Push**

```bash
git push -u origin feature/notes-redesign
```

Expected: branch pushed、終端顯示 PR 連結。

- [ ] **Step 3: 打開 PR 連結（瀏覽器手動，或回報 URL）**

到 `https://github.com/SuChenYu0623/ChrisSu/pull/new/feature/notes-redesign` 開 PR，title 與 body 範例：

```
title: feat(notes): redesign notes page — three-column layout + dual theme + Shiki

body:
## Summary
依 docs/superpowers/specs/2026-06-09-notes-page-redesign.md 把筆記頁重新設計：

- 三欄 layout（Sidebar 240px / Main 800px / TOC 200px），響應式 < 1200px 收 TOC、< 900px sidebar 變漢堡 drawer
- Light/Dark 雙主題（CSS variables + NavigationBar 切換按鈕 + localStorage 記憶）
- Sidebar 搜尋 + NavLink active state
- Breadcrumb / NotesLanding / TableOfContents 新元件
- Shiki 雙主題語法高亮、CopyButton 取代 alert
- react-markdown + remark-gfm + github-slugger（h2/h3 slug 對齊 TOC）

## Test plan
- [ ] `/notes` landing 卡片
- [ ] 主題切換按鈕在 light/dark 之間切換、重整保留
- [ ] code block 語法高亮 + 雙主題正確切換
- [ ] TOC scroll spy + 點擊跳轉
- [ ] sidebar 搜尋 + active state
- [ ] < 1200px / < 900px 響應式
```

---

## 驗證總表

| 項目 | 通過條件 |
|---|---|
| Build | `npm run build` 無 error |
| Typecheck | `npm run typecheck` 無 error |
| Lint | `npm run lint` 無 error |
| Landing | `/#/notes` 顯示 3 張分類卡 |
| Theme toggle | NavigationBar 按鈕切換 light/dark、localStorage 記憶 |
| Shiki | code block 雙主題高亮正確 |
| TOC | h2/h3 列出、scroll spy active 切換 |
| Breadcrumb | 顯示「筆記 · 分類 · 標題」、「筆記」可點 |
| Sidebar 搜尋 | filter 即時、無結果顯示提示 |
| Sidebar active | NavLink active 樣式正確 |
| Copy button | 複製成功變「已複製 ✓」、不彈 alert |
| 響應式 < 1200px | TOC 隱藏 |
| 響應式 < 900px | Sidebar 收漢堡 + drawer |
| 既有頁面 | Introduction / Tools / Photo 視覺不受影響 |

---

## 不在這份 plan 內

- 單元 / E2E 測試
- 全文搜尋（只搜標題）
- 留言 / 點讚 / 分享
- 修改其他頁面視覺
- 取代或清理現有 `react-syntax-highlighter` 依賴
- i18n

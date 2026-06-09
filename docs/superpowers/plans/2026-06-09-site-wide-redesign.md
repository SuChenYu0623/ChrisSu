# 整站視覺重設計 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把整站（IntroductionPage / ToolsPage / NotesPage / PhotoPage / NavigationBar）拉到統一的 Vercel/Linear 風視覺語言，主色換橘，design tokens 重命名 `--notes-*` → `--app-*`，IntroductionPage 與 ToolsPage 重寫元件結構。

**Architecture:**
- Design tokens 一次性 rename + 擴充（橘色 accent、新 radius/shadow/spacing-6/7）。Notes/Photos 因為已用 `--notes-*` 變數，rename 後自動跟著新主色走，元件邏輯不動。
- NavigationBar 重寫：sticky 透明 + backdrop blur + 英文 nav 標籤 + 響應式漢堡。
- IntroductionPage 完全重寫：刪掉舊 Avatar/ProfileTable/ExperienceSection/ExperienceProject 四個元件，改成 Hero/About/Skills/Projects 四個新元件，data/profile.ts 加 tagline/description/projects。
- ToolsPage 重寫 layout：加 ToolsLanding、Sidebar 對齊 NotesPage 視覺、新增 ToolContainer wrapper、兩個工具元件用新樣式但保留邏輯。

**Tech Stack:** Vite 8 + React 19 + TypeScript 6 strict + CSS Modules + react-router-dom 6 (NavLink)

**Reference spec:** `/Users/admin/Desktop/myProject/ChrisSu/docs/superpowers/specs/2026-06-09-site-wide-redesign.md`

**Working directory:** `/Users/admin/Desktop/myProject/ChrisSu/my-app`（除非另註）

**Testing note:** scope 不含單元測試。驗證以「lint + typecheck + build + 瀏覽器逐頁手動驗收」為主。每個 phase 結束 commit 一次。

---

## Phase 0 — 前置

### Task 0.1: 建立 feature branch

- [ ] **Step 1: 確認 master 是最新**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git status
git branch --show-current
git pull origin master --rebase
```

Expected: 在 `master`、`nothing to commit`、HEAD 已包含 `be14e92 docs: add site-wide redesign spec`。

- [ ] **Step 2: 建立 feature branch**

```bash
git checkout -b feature/site-redesign
git branch --show-current
```

Expected: `feature/site-redesign`

---

## Phase 1 — Design tokens 全面重寫

> 一次更新 tokens.css、再用 sed 把所有 CSS Modules 的 `var(--notes-*)` 換成 `var(--app-*)`。值幾乎一樣、accent 從藍換橘，所以視覺上唯一改變的是「藍色變橘色」+ Light/Dark 灰階微調。

### Task 1.1: 重寫 tokens.css

**Files:**
- Modify: `my-app/src/styles/tokens.css`

- [ ] **Step 1: 完全替換 `tokens.css` 內容**

```css
:root {
  /* 灰階 */
  --app-bg: #fafafa;
  --app-bg-subtle: #f5f5f5;
  --app-bg-elevated: #ffffff;
  --app-bg-code: #f6f8fa;
  --app-fg: #171717;
  --app-fg-soft: #404040;
  --app-fg-muted: #737373;
  --app-fg-faint: #a3a3a3;
  --app-border: #e5e5e5;
  --app-border-strong: #d4d4d4;

  /* 橘色主色 */
  --app-accent: #ea580c;
  --app-accent-hover: #c2410c;
  --app-accent-soft: #fff7ed;
  --app-accent-fg: #ffffff;

  /* 字體 */
  --app-font-sans:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial,
    'Microsoft JhengHei', 'PingFang TC', sans-serif;
  --app-font-mono:
    'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, Monaco, monospace;

  /* 間距 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --space-7: 64px;

  /* 圓角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* 陰影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.08);
}

[data-theme='dark'] {
  --app-bg: #0a0a0a;
  --app-bg-subtle: #171717;
  --app-bg-elevated: #1a1a1a;
  --app-bg-code: #1e1e1e;
  --app-fg: #fafafa;
  --app-fg-soft: #d4d4d4;
  --app-fg-muted: #a3a3a3;
  --app-fg-faint: #737373;
  --app-border: #262626;
  --app-border-strong: #404040;

  --app-accent: #fb923c;
  --app-accent-hover: #fdba74;
  --app-accent-soft: rgba(251, 146, 60, 0.12);
  --app-accent-fg: #0a0a0a;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
}

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

### Task 1.2: 全站 rename `--notes-*` → `--app-*`

**Files affected (12 files)：**
- `my-app/src/pages/NotesPage/Breadcrumb.module.css`
- `my-app/src/pages/NotesPage/NotesLanding.module.css`
- `my-app/src/pages/NotesPage/NotesPage.module.css`
- `my-app/src/pages/NotesPage/CodeBlock.module.css`
- `my-app/src/pages/NotesPage/CopyButton.module.css`
- `my-app/src/pages/NotesPage/TableOfContents.module.css`
- `my-app/src/pages/PhotoPage/AlbumCover.module.css`
- `my-app/src/pages/PhotoPage/AlbumDetail.module.css`
- `my-app/src/pages/PhotoPage/MasonryGrid.module.css`
- `my-app/src/pages/PhotoPage/PhotoLanding.module.css`
- `my-app/src/pages/PhotoPage/PhotoPage.module.css`

- [ ] **Step 1: 跑 sed 全文件替換**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
grep -rl "notes-" src/ | xargs sed -i '' 's/--notes-/--app-/g'
```

- [ ] **Step 2: 驗證沒漏**

```bash
grep -rn "notes-" src/ | grep -v "NotesPage\|notes\.ts\|notes/" | head
```

Expected: 沒輸出（所有 `--notes-` token 都改完，剩下的 `Notes` 字眼是檔名/類型/路徑、不是 CSS 變數）。

- [ ] **Step 3: lint + typecheck + build**

```bash
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
npm run build 2>&1 | tail -5
```

Expected: 全綠。

### Task 1.3: Commit Phase 1

- [ ] **Step 1: Commit**

```bash
rm -rf dist
cd /Users/admin/Desktop/myProject/ChrisSu
git add -A
git commit -m "refactor(tokens): rename --notes-* to --app-* and switch accent to orange"
```

---

## Phase 2 — NavigationBar 重寫

### Task 2.1: 改 data/nav.ts 標籤為英文

**Files:**
- Modify: `my-app/src/data/nav.ts`

- [ ] **Step 1: 替換**

```ts
import type { NavItem } from '../types';

export const navItems: NavItem[] = [
  { label: 'About', path: '/introduction' },
  { label: 'Notes', path: '/notes' },
  { label: 'Tools', path: '/tools' },
  { label: 'Photos', path: '/photos' },
];
```

- [ ] **Step 2: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 2.2: 改寫 NavigationBar 視覺

**Files:**
- Modify: `my-app/src/components/NavigationBar.tsx`
- Modify: `my-app/src/components/NavigationBar.module.css`

- [ ] **Step 1: 完全替換 `NavigationBar.module.css`**

```css
.bar {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
  background: rgba(250, 250, 250, 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid var(--app-border);
}

[data-theme='dark'] .bar {
  background: rgba(10, 10, 10, 0.7);
}

.inner {
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--app-fg);
  font-family: var(--app-font-sans);
  font-size: 15px;
  font-weight: 600;
}
.logo:hover {
  color: var(--app-fg);
}
.logoDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--app-accent);
  flex-shrink: 0;
}

.items {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  font-family: var(--app-font-sans);
}

.link {
  position: relative;
  font-size: 14px;
  color: var(--app-fg-muted);
  text-decoration: none;
  padding: 22px 0;
  border-bottom: 2px solid transparent;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.link:hover {
  color: var(--app-fg);
  border-bottom-color: var(--app-border-strong);
}
.linkActive {
  color: var(--app-fg);
  border-bottom-color: var(--app-accent);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.iconButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  color: var(--app-fg-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  text-decoration: none;
}
.iconButton:hover {
  color: var(--app-fg);
  background: var(--app-bg-subtle);
}

.menuButton {
  display: none;
}

.drawer {
  display: none;
}

.backdrop {
  display: none;
}

@media (max-width: 768px) {
  .items {
    display: none;
  }
  .menuButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    color: var(--app-fg);
    cursor: pointer;
    border-radius: var(--radius-md);
  }
  .menuButton:hover {
    background: var(--app-bg-subtle);
  }
  .bar[data-drawer-open='true'] .drawer {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--app-bg);
    border-bottom: 1px solid var(--app-border);
    padding: var(--space-4);
    gap: var(--space-3);
    z-index: 40;
  }
  .bar[data-drawer-open='true'] .backdrop {
    display: block;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 30;
  }
  .drawer .link {
    font-size: 20px;
    padding: var(--space-3) 0;
    border-bottom: 0;
  }
  .drawer .linkActive {
    color: var(--app-accent);
  }
}
```

- [ ] **Step 2: 完全替換 `NavigationBar.tsx`**

```tsx
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import type { NavItem } from '../types';
import styles from './NavigationBar.module.css';

type NavigationBarProps = {
  items: NavItem[];
};

const GITHUB_URL = 'https://github.com/SuChenYu0623';
const GITHUB_LABEL = 'GitHub';

export function NavigationBar({ items }: NavigationBarProps) {
  const { theme, toggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <nav className={styles.bar} data-drawer-open={drawerOpen}>
      <div className={styles.inner}>
        <Link to="/introduction" className={styles.logo} onClick={closeDrawer}>
          <span className={styles.logoDot} aria-hidden />
          Chris Su
        </Link>

        <div className={styles.items}>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.linkActive}` : styles.link
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className={styles.actions}>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.iconButton}
            aria-label={GITHUB_LABEL}
            title={GITHUB_LABEL}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.4-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
            </svg>
          </a>

          <button
            type="button"
            className={styles.iconButton}
            onClick={toggle}
            aria-label="切換主題"
            title={theme === 'dark' ? '切換到淺色' : '切換到深色'}
          >
            {theme === 'dark' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="開啟選單"
            aria-expanded={drawerOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {drawerOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.drawer}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
            onClick={closeDrawer}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={closeDrawer}
          aria-hidden
        />
      )}
    </nav>
  );
}
```

- [ ] **Step 3: 因為 NavigationBar 現在自己負責 sticky，需要把舊的全域 `.App-content` height 91vh + display: flex 適配新狀況**

讀 `src/styles/globals.css`，把 `.App-content` 規則改成：

```css
.App-content {
  width: 100%;
  min-height: calc(100vh - 64px);
}
```

（NavBar 64px、不再用 8vh，因此 App-content 不再需要 height: 92vh + flex center。）

- [ ] **Step 4: lint + typecheck**

```bash
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 2.3: 修因 NavBar height 變化造成的對齊問題

> 既有頁面如 NotesPage / PhotoPage 用了 `92vh` 或 `calc(100vh - 8vh)` 來算高度（因為舊 NavBar 是 8vh = 約 76px@992h）。新 NavBar 是 64px、需要逐檔對齊。

**Files:**
- Modify: `my-app/src/pages/NotesPage/NotesPage.module.css`
- Modify: `my-app/src/pages/NotesPage/TableOfContents.module.css`
- Modify: `my-app/src/pages/PhotoPage/PhotoPage.module.css`

- [ ] **Step 1: 在 NotesPage.module.css 把 `92vh` 換成 `calc(100vh - 64px)`**

```bash
sed -i '' 's/92vh/calc(100vh - 64px)/g' src/pages/NotesPage/NotesPage.module.css
sed -i '' 's/92vh/calc(100vh - 64px)/g' src/pages/PhotoPage/PhotoPage.module.css
```

- [ ] **Step 2: TableOfContents 的 sticky top 從 `calc(8vh + 32px)` 改成 `calc(64px + 32px)`**

```bash
sed -i '' 's|calc(8vh + 32px)|calc(64px + 32px)|g; s|calc(100vh - 8vh - 64px)|calc(100vh - 64px - 64px)|g' src/pages/NotesPage/TableOfContents.module.css
```

- [ ] **Step 3: PhotoPage AlbumDetail / NotesPage drawer 內的 `top: 8vh` 改成 `top: 64px`**

> 預期受影響檔案：`NotesPage.module.css`（drawer 的 `top: 8vh`、backdrop `top: 8vh`）。其他 module.css 可能也有殘留。

```bash
grep -rln "8vh" src/
# 對所有命中的 .module.css 都跑一次替換
grep -rl "8vh" src/ | xargs sed -i '' 's/8vh/64px/g'
```

- [ ] **Step 4: 確認沒漏**

```bash
grep -rn "8vh\|92vh" src/
```

Expected: 沒輸出。

### Task 2.4: dev 視覺驗收 + commit Phase 2

- [ ] **Step 1: dev**

```bash
pkill -f "vite" 2>/dev/null; sleep 1
(npm run dev > /tmp/vite-dev.log 2>&1 &)
sleep 4
grep "Local:" /tmp/vite-dev.log
```

開瀏覽器逐項驗收：

| 項目 | 期望 |
|---|---|
| NavBar | 64px 高、透明 + blur 背景（滾動時看得到後面內容透出） |
| Logo | 橘色點 + 「Chris Su」、點擊回 `/introduction` |
| Nav 標籤 | About / Notes / Tools / Photos（英文） |
| Active state | 當前頁有橘色底線 |
| GitHub icon | hover bg 灰、外部連結到 SuChenYu0623 |
| 主題切換 | 跟之前一樣可切 |
| < 768px | nav 收漢堡、點開 drawer 從上滑下 |
| 整站 NotesPage / PhotoPage | 高度看起來沒明顯破版 |

```bash
pkill -f "vite" 2>/dev/null; sleep 1
```

- [ ] **Step 2: Commit Phase 2**

```bash
rm -rf dist
cd /Users/admin/Desktop/myProject/ChrisSu
git add -A
git commit -m "feat(nav): sticky transparent NavigationBar with backdrop blur + English labels + drawer"
```

---

## Phase 3 — IntroductionPage 重寫

### Task 3.1: 改寫 data/profile.ts

**Files:**
- Modify: `my-app/src/data/profile.ts`
- Modify: `my-app/src/types/index.ts`

- [ ] **Step 1: 改 `src/types/index.ts` — 重寫 Profile 並新增 Project**

打開 `src/types/index.ts`，把：

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
```

替換成：

```ts
export type Profile = {
  cnName: string;
  enName: string;
  tagline: string;
  description: string;
  birthday: string;
  school: string;
  company: string;
  programLanguages: string[];
  skills: string[];
  avatarSrc: string;
  githubUrl: string;
};

export type Project = {
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl?: string;
};
```

- [ ] **Step 2: 完全替換 `src/data/profile.ts`**

```ts
import type { Profile, Project } from '../types';
import BG_IMG from '../images/BG.jpg';

export const profile: Profile = {
  cnName: '蘇禎佑',
  enName: 'Chris Su',
  tagline: 'Crawler Engineer & Front End',
  description:
    '我寫爬蟲、做 React、玩智能合約。目前在 BigGo 樂方股份有限公司，興趣是把資料變成有用的工具。',
  birthday: '1999/06/23',
  school: 'National Kaohsiung University of Science and Technology (EE)',
  company: 'BigGo 樂方股份有限公司',
  programLanguages: ['JavaScript', 'Python', 'C', 'Solidity'],
  skills: ['React', 'Extension', 'JS 爬蟲', '智能合約', 'AI'],
  avatarSrc: BG_IMG,
  githubUrl: 'https://github.com/SuChenYu0623',
};

export const projects: Project[] = [
  {
    title: 'SocialMedia',
    description: '社群媒體前端 demo，含貼文、留言、追蹤功能。',
    tags: ['React', 'Web'],
    githubUrl: 'https://github.com/SuChenYu0623/SocialMedia',
    liveUrl: 'https://suchenyu0623.github.io/SocialMedia/',
  },
  {
    title: 'Game',
    description: '一個瀏覽器小遊戲。',
    tags: ['React', 'Web'],
    githubUrl: 'https://github.com/SuChenYu0623/Game',
    liveUrl: 'https://suchenyu0623.github.io/Game/',
  },
  {
    title: 'RandomSelectMealApp',
    description: '隨機選擇午餐的 React Native App。',
    tags: ['React Native', 'App'],
    githubUrl: 'https://github.com/SuChenYu0623/RandomSelectMealApp',
  },
  {
    title: 'ReactNative_game_app',
    description: 'React Native 寫的小遊戲。',
    tags: ['React Native', 'App'],
    githubUrl: 'https://github.com/SuChenYu0623/ReactNative_game_app',
  },
  {
    title: 'CrawlerData',
    description: '網路爬蟲腳本集合，含多種網站的資料擷取範例。',
    tags: ['JavaScript', 'Crawler'],
    githubUrl: 'https://github.com/SuChenYu0623/CrawlerData',
  },
];
```

- [ ] **Step 3: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -10
```

Expected: 報錯（既有 IntroductionPage 子元件還在用舊欄位），下一個 task 解掉。

### Task 3.2: 刪除舊 IntroductionPage 子元件

**Files:**
- Delete: `my-app/src/pages/IntroductionPage/Avatar.tsx`
- Delete: `my-app/src/pages/IntroductionPage/ProfileTable.tsx`
- Delete: `my-app/src/pages/IntroductionPage/ExperienceSection.tsx`
- Delete: `my-app/src/pages/IntroductionPage/ExperienceProject.tsx`
- Delete: `my-app/src/images/BG-code1.jpg`
- Delete: `my-app/src/images/BG-code2.jpg`

- [ ] **Step 1: 刪除舊元件**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
rm src/pages/IntroductionPage/Avatar.tsx
rm src/pages/IntroductionPage/ProfileTable.tsx
rm src/pages/IntroductionPage/ExperienceSection.tsx
rm src/pages/IntroductionPage/ExperienceProject.tsx
```

- [ ] **Step 2: 刪除舊 BG 背景圖**

```bash
rm src/images/BG-code1.jpg
rm src/images/BG-code2.jpg
```

（保留 `src/images/BG.jpg`、給 Avatar 用）

- [ ] **Step 3: stub `index.tsx` 讓 typecheck 過**

替換 `src/pages/IntroductionPage/index.tsx`：

```tsx
import styles from './IntroductionPage.module.css';

export default function IntroductionPage() {
  return <div className={styles.page}>個人簡介施工中</div>;
}
```

- [ ] **Step 4: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 3.3: 建立新 IntroductionPage.module.css

**Files:**
- Modify: `my-app/src/pages/IntroductionPage/IntroductionPage.module.css`

- [ ] **Step 1: 完全替換內容**

```css
.page {
  width: 100%;
  background: var(--app-bg);
  color: var(--app-fg);
  font-family: var(--app-font-sans);
  min-height: calc(100vh - 64px);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* ───── Hero ───── */
.hero {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-7);
  padding: var(--space-7) var(--space-4) var(--space-6);
  max-width: 1280px;
  margin: 0 auto;
  align-items: center;
}
.heroTitle {
  font-size: 56px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}
.heroTitleAccent {
  color: var(--app-accent);
}
.heroTagline {
  font-size: 20px;
  color: var(--app-fg-muted);
  margin: 12px 0 0;
}
.heroDescription {
  font-size: 16px;
  line-height: 1.7;
  color: var(--app-fg-soft);
  max-width: 540px;
  margin: var(--space-4) 0 0;
}
.heroCtas {
  display: flex;
  gap: 12px;
  margin-top: var(--space-5);
  flex-wrap: wrap;
}
.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--app-accent);
  color: var(--app-accent-fg);
  border: 1px solid var(--app-accent);
  border-radius: var(--radius-lg);
  font-family: var(--app-font-sans);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
}
.btnPrimary:hover {
  background: var(--app-accent-hover);
  color: var(--app-accent-fg);
  border-color: var(--app-accent-hover);
}
.btnSecondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: transparent;
  color: var(--app-fg);
  border: 1px solid var(--app-border-strong);
  border-radius: var(--radius-lg);
  font-family: var(--app-font-sans);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.btnSecondary:hover {
  background: var(--app-bg-subtle);
  color: var(--app-fg);
  border-color: var(--app-fg);
}

.avatarBox {
  width: 200px;
  height: 200px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  justify-self: end;
  transition: transform 0.3s;
}
.avatarBox:hover {
  transform: translateY(-2px);
}
.avatarBox img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ───── Section（共用） ───── */
.section {
  padding: var(--space-6) 0;
  border-top: 1px solid var(--app-border);
}
.sectionLabel {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--app-fg-muted);
  margin: 0 0 var(--space-4);
}

/* ───── About ───── */
.aboutGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}
.aboutCard {
  background: var(--app-bg-elevated);
  border: 1px solid var(--app-border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.aboutLabel {
  font-size: 12px;
  color: var(--app-fg-muted);
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.aboutValue {
  font-size: 16px;
  color: var(--app-fg);
  margin: 0;
  line-height: 1.5;
}

/* ───── Skills ───── */
.skillsList {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.skillTag {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: var(--app-accent-soft);
  color: var(--app-accent);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
}

/* ───── Projects ───── */
.projectsList {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.projectCard {
  background: var(--app-bg-elevated);
  border: 1px solid var(--app-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-3);
  align-items: start;
  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}
.projectCard:hover {
  border-color: var(--app-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.projectMain {
  min-width: 0;
}
.projectTitle {
  font-size: 18px;
  font-weight: 600;
  color: var(--app-fg);
  margin: 0 0 4px;
}
.projectTags {
  font-size: 12px;
  color: var(--app-fg-muted);
  margin: 0 0 8px;
}
.projectDescription {
  font-size: 14px;
  line-height: 1.5;
  color: var(--app-fg-soft);
  margin: 0;
}
.projectLinks {
  display: flex;
  gap: 6px;
  align-items: center;
}
.projectLink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--app-fg-muted);
  background: transparent;
  border: 1px solid var(--app-border);
  transition:
    color 0.15s,
    border-color 0.15s;
}
.projectLink:hover {
  color: var(--app-accent);
  border-color: var(--app-accent);
}

/* ───── 響應式 ───── */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    gap: var(--space-5);
    padding-top: var(--space-6);
  }
  .heroTitle {
    font-size: 40px;
  }
  .avatarBox {
    width: 160px;
    height: 160px;
    justify-self: start;
    order: -1;
  }
  .aboutGrid {
    grid-template-columns: 1fr;
  }
}
```

### Task 3.4: Hero 元件

**Files:**
- Create: `my-app/src/pages/IntroductionPage/Hero.tsx`

- [ ] **Step 1: 建立檔案**

```tsx
import { profile } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div>
        <h1 className={styles.heroTitle}>
          Hi, I&apos;m {profile.enName}
          <span className={styles.heroTitleAccent}>.</span>
        </h1>
        <p className={styles.heroTagline}>{profile.tagline}</p>
        <p className={styles.heroDescription}>{profile.description}</p>
        <div className={styles.heroCtas}>
          <a href="#projects" className={styles.btnPrimary}>
            View Projects →
          </a>
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.btnSecondary}
          >
            GitHub
          </a>
        </div>
      </div>
      <div className={styles.avatarBox}>
        <img src={profile.avatarSrc} alt={`${profile.enName} avatar`} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 3.5: About 元件

**Files:**
- Create: `my-app/src/pages/IntroductionPage/About.tsx`

- [ ] **Step 1: 建立檔案**

```tsx
import { profile } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export function About() {
  const cards: { label: string; value: string }[] = [
    { label: 'Born', value: profile.birthday },
    { label: 'Education', value: profile.school },
    { label: 'Languages', value: profile.programLanguages.join(', ') },
    { label: 'Currently', value: profile.company },
  ];
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionLabel}>About</h2>
      <div className={styles.aboutGrid}>
        {cards.map((card) => (
          <div key={card.label} className={styles.aboutCard}>
            <p className={styles.aboutLabel}>{card.label}</p>
            <p className={styles.aboutValue}>{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 3.6: Skills 元件

**Files:**
- Create: `my-app/src/pages/IntroductionPage/Skills.tsx`

- [ ] **Step 1: 建立檔案**

```tsx
import { profile } from '../../data/profile';
import styles from './IntroductionPage.module.css';

export function Skills() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionLabel}>Skills</h2>
      <div className={styles.skillsList}>
        {profile.skills.map((skill) => (
          <span key={skill} className={styles.skillTag}>
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 3.7: ProjectCard + Projects 元件

**Files:**
- Create: `my-app/src/pages/IntroductionPage/ProjectCard.tsx`
- Create: `my-app/src/pages/IntroductionPage/Projects.tsx`

- [ ] **Step 1: 建立 `ProjectCard.tsx`**

```tsx
import type { Project } from '../../types';
import styles from './IntroductionPage.module.css';

type Props = { project: Project };

export function ProjectCard({ project }: Props) {
  return (
    <article className={styles.projectCard}>
      <div className={styles.projectMain}>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectTags}>{project.tags.join(' · ')}</p>
        <p className={styles.projectDescription}>{project.description}</p>
      </div>
      <div className={styles.projectLinks}>
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.projectLink}
          aria-label={`${project.title} GitHub`}
          title="GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.4-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
          </svg>
        </a>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.projectLink}
            aria-label={`${project.title} Live`}
            title="Live"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: 建立 `Projects.tsx`**

```tsx
import { projects } from '../../data/profile';
import { ProjectCard } from './ProjectCard';
import styles from './IntroductionPage.module.css';

export function Projects() {
  return (
    <section id="projects" className={styles.section}>
      <h2 className={styles.sectionLabel}>Projects</h2>
      <div className={styles.projectsList}>
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 3.8: 接 IntroductionPage index.tsx

**Files:**
- Modify: `my-app/src/pages/IntroductionPage/index.tsx`

- [ ] **Step 1: 完全替換**

```tsx
import { Hero } from './Hero';
import { About } from './About';
import { Skills } from './Skills';
import { Projects } from './Projects';
import styles from './IntroductionPage.module.css';

export default function IntroductionPage() {
  return (
    <div className={styles.page}>
      <Hero />
      <div className={styles.container}>
        <About />
        <Skills />
        <Projects />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: lint + typecheck + build**

```bash
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
npm run build 2>&1 | tail -5
```

Expected: 全綠。

### Task 3.9: dev 驗收 + commit Phase 3

- [ ] **Step 1: dev**

```bash
pkill -f "vite" 2>/dev/null; sleep 1
(npm run dev > /tmp/vite-dev.log 2>&1 &)
sleep 4
grep "Local:" /tmp/vite-dev.log
```

開瀏覽器 `/#/introduction` 逐項驗收：

| 項目 | 期望 |
|---|---|
| Hero 大標 | 「Hi, I'm Chris Su.」、句末 `.` 是橘色 |
| Tagline | 「Crawler Engineer & Front End」灰色字 |
| Description | 中文敘述、line-height 寬鬆 |
| CTA | `View Projects →` 橘按鈕、`GitHub` 透明邊框按鈕 |
| 點 View Projects | smooth scroll 到下方 Projects section |
| 點 GitHub | 新分頁開 https://github.com/SuChenYu0623 |
| Avatar | 200×200 圓角、`BG.jpg` 顯示、hover 上浮 |
| About | 2×2 卡片（Born / Education / Languages / Currently） |
| Skills | 5 個橘色 pill tag |
| Projects | 5 張 project 卡、hover 變橘 border + 上浮 |
| Project icon | GitHub icon 都顯示、有 Live 才顯示 ↗ icon |
| Dark mode | 切過去視覺對、橘色變淡橘 |
| < 768px | Hero 變單欄、Avatar 在上、aboutGrid 變單欄 |

```bash
pkill -f "vite" 2>/dev/null; sleep 1
```

- [ ] **Step 2: Commit Phase 3**

```bash
rm -rf dist
cd /Users/admin/Desktop/myProject/ChrisSu
git add -A
git commit -m "feat(intro): rewrite IntroductionPage to Hero/About/Skills/Projects layout"
```

---

## Phase 4 — ToolsPage 重寫

### Task 4.1: 改 data/tools.ts 加 description

**Files:**
- Modify: `my-app/src/data/tools.ts`
- Modify: `my-app/src/types/index.ts`

- [ ] **Step 1: 改 `src/types/index.ts` 的 `ToolEntry`**

把：

```ts
export type ToolEntry = {
  slug: string;
  label: string;
};
```

改成：

```ts
export type ToolEntry = {
  slug: string;
  label: string;
  description: string;
};
```

- [ ] **Step 2: 替換 `src/data/tools.ts`**

```ts
import type { ToolEntry } from '../types';

export const tools: ToolEntry[] = [
  {
    slug: 'duplication-check',
    label: '檢查重複元素',
    description: '從 JSON 陣列裡找出重複/不重複的元素，可指定 key 比對。',
  },
  {
    slug: 'cookie-diff',
    label: '檢查 cookie 差異',
    description: '比對兩組 cookie 字串、找出新增、消失、修改的項目。',
  },
];
```

- [ ] **Step 3: typecheck**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 4.2: 重寫 ToolsPage.module.css

**Files:**
- Modify: `my-app/src/pages/ToolsPage/ToolsPage.module.css`

- [ ] **Step 1: 完全替換**

```css
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  width: 100%;
  min-height: calc(100vh - 64px);
  background: var(--app-bg);
  color: var(--app-fg);
  font-family: var(--app-font-sans);
}

.sidebar {
  background: var(--app-bg-subtle);
  border-right: 1px solid var(--app-border);
  padding: var(--space-3);
  overflow-y: auto;
}

.sidebarLabel {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--app-fg-muted);
  padding: 4px 8px;
  margin-bottom: var(--space-2);
}

.toolList {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toolList li {
  padding: 0;
}
.toolLink {
  display: block;
  padding: 6px 12px;
  margin: 2px 0;
  font-size: 14px;
  color: var(--app-fg-soft);
  text-decoration: none;
  border-radius: var(--radius-md);
  border-left: 3px solid transparent;
}
.toolLink:hover {
  color: var(--app-fg);
  background: var(--app-bg);
}
.toolLinkActive {
  color: var(--app-accent);
  background: var(--app-accent-soft);
  border-left-color: var(--app-accent);
  font-weight: 600;
}

.main {
  overflow-y: auto;
  background: var(--app-bg);
}

/* ───── Tools landing ───── */
.landing {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-5) var(--space-4);
}
.landingTitle {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 var(--space-2);
}
.landingMeta {
  color: var(--app-fg-muted);
  margin: 0 0 var(--space-5);
  font-size: 14px;
}
.landingGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-3);
}
.landingCard {
  display: block;
  padding: var(--space-4);
  background: var(--app-bg-elevated);
  border: 1px solid var(--app-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--app-fg);
  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}
.landingCard:hover {
  border-color: var(--app-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  color: var(--app-fg);
}
.landingCardTitle {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}
.landingCardDesc {
  font-size: 14px;
  color: var(--app-fg-muted);
  line-height: 1.5;
  margin: 0;
}

/* ───── Tool container ───── */
.toolContainer {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-5) var(--space-4);
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--app-fg-muted);
  margin-bottom: var(--space-3);
}
.breadcrumb a {
  color: var(--app-fg-muted);
  text-decoration: none;
}
.breadcrumb a:hover {
  color: var(--app-accent);
}
.breadcrumbCurrent {
  color: var(--app-fg);
  font-weight: 500;
}
.toolTitle {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
}
.toolDesc {
  color: var(--app-fg-muted);
  margin: 0 0 var(--space-5);
  font-size: 14px;
  line-height: 1.6;
}

/* ───── Tool body（CheckCookieDiff、CheckDuplicationItems 共用） ───── */
.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.cell {
  height: 320px;
}
.cellStack {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 320px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.actionsLabel {
  font-size: 14px;
  color: var(--app-fg-soft);
}
.btnPrimary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--app-accent);
  color: var(--app-accent-fg);
  border: 1px solid var(--app-accent);
  border-radius: var(--radius-md);
  font-family: var(--app-font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btnPrimary:hover {
  background: var(--app-accent-hover);
  border-color: var(--app-accent-hover);
  color: var(--app-accent-fg);
}
.input {
  padding: 8px 12px;
  font-family: var(--app-font-mono);
  font-size: 14px;
  background: var(--app-bg-subtle);
  color: var(--app-fg);
  border: 1px solid var(--app-border);
  border-radius: var(--radius-md);
}
.input:focus {
  outline: none;
  border-color: var(--app-accent);
  box-shadow: 0 0 0 3px var(--app-accent-soft);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th,
.table td {
  text-align: left;
  padding: 8px 12px;
  border: 1px solid var(--app-border);
  background: transparent;
  color: var(--app-fg);
}
.table th {
  background: var(--app-bg-subtle);
  font-weight: 600;
  color: var(--app-fg-muted);
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.05em;
}
.col2 {
  width: 15%;
}
.col6 {
  width: 30%;
}
.col4 {
  width: 25%;
}

@media (max-width: 1024px) {
  .row {
    grid-template-columns: 1fr;
  }
  .cell,
  .cellStack {
    height: 240px;
  }
}

@media (max-width: 900px) {
  .page {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
}
```

### Task 4.3: Sidebar 改用 NavLink + 對齊 NotesPage

**Files:**
- Modify: `my-app/src/pages/ToolsPage/Sidebar.tsx`

- [ ] **Step 1: 完全替換**

```tsx
import { NavLink } from 'react-router-dom';
import type { ToolEntry } from '../../types';
import styles from './ToolsPage.module.css';

type Props = { tools: ToolEntry[] };

export function Sidebar({ tools }: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLabel}>Tools</div>
      <ul className={styles.toolList}>
        {tools.map((tool) => (
          <li key={tool.slug}>
            <NavLink
              to={`/tools/${tool.slug}`}
              className={({ isActive }) =>
                isActive ? `${styles.toolLink} ${styles.toolLinkActive}` : styles.toolLink
              }
            >
              {tool.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 4.4: ToolsLanding 元件

**Files:**
- Create: `my-app/src/pages/ToolsPage/ToolsLanding.tsx`

- [ ] **Step 1: 建立**

```tsx
import { Link } from 'react-router-dom';
import { tools } from '../../data/tools';
import styles from './ToolsPage.module.css';

export function ToolsLanding() {
  return (
    <article className={styles.landing}>
      <h1 className={styles.landingTitle}>Tools</h1>
      <p className={styles.landingMeta}>{tools.length} 個工具</p>
      <div className={styles.landingGrid}>
        {tools.map((tool) => (
          <Link key={tool.slug} to={`/tools/${tool.slug}`} className={styles.landingCard}>
            <h2 className={styles.landingCardTitle}>{tool.label}</h2>
            <p className={styles.landingCardDesc}>{tool.description}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 4.5: ToolContainer wrapper

**Files:**
- Create: `my-app/src/pages/ToolsPage/ToolContainer.tsx`

- [ ] **Step 1: 建立**

```tsx
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './ToolsPage.module.css';

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ToolContainer({ title, description, children }: Props) {
  return (
    <article className={styles.toolContainer}>
      <nav aria-label="breadcrumb" className={styles.breadcrumb}>
        <Link to="/tools">Tools</Link>
        <span aria-hidden>·</span>
        <span className={styles.breadcrumbCurrent}>{title}</span>
      </nav>
      <h1 className={styles.toolTitle}>{title}</h1>
      <p className={styles.toolDesc}>{description}</p>
      {children}
    </article>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 4.6: 改寫 CheckCookieDiff 套用 ToolContainer

**Files:**
- Modify: `my-app/src/pages/ToolsPage/tools/CheckCookieDiff.tsx`

- [ ] **Step 1: 完全替換**

```tsx
import { useState, type ChangeEvent } from 'react';
import { TextArea } from '../../../components/TextArea';
import { ToolContainer } from '../ToolContainer';
import { tools } from '../../../data/tools';
import styles from '../ToolsPage.module.css';

type Row = [
  key: string,
  before: string | undefined,
  after: string | undefined,
  message: string | undefined,
];

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

const TOOL = tools.find((t) => t.slug === 'cookie-diff')!;

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
    <ToolContainer title={TOOL.label} description={TOOL.description}>
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
          <button type="button" className={styles.btnPrimary} onClick={checkCookieDiff}>
            Parse
          </button>
        </div>
        {state.outTable.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.col2}>Cookie</th>
                <th className={styles.col6}>Before</th>
                <th className={styles.col6}>After</th>
                <th className={styles.col4}>Message</th>
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
        )}
      </div>
    </ToolContainer>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 4.7: 改寫 CheckDuplicationItems 套用 ToolContainer

**Files:**
- Modify: `my-app/src/pages/ToolsPage/tools/CheckDuplicationItems.tsx`

- [ ] **Step 1: 完全替換**

```tsx
import { useState, type ChangeEvent } from 'react';
import { TextArea } from '../../../components/TextArea';
import { ToolContainer } from '../ToolContainer';
import { tools } from '../../../data/tools';
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

const TOOL = tools.find((t) => t.slug === 'duplication-check')!;

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
    <ToolContainer title={TOOL.label} description={TOOL.description}>
      <div className={styles.content}>
        <div className={styles.row}>
          <div className={styles.cell}>
            <TextArea name="code" value={state.code} onChange={handleChange} />
          </div>
          <div className={styles.cellStack}>
            <TextArea name="Repeat" value={state.repeatArr} disabled />
            <TextArea name="notRepeat" value={state.notRepeatArr} disabled />
          </div>
        </div>
        <div className={styles.actions}>
          <span className={styles.actionsLabel}>
            輸入需要檢查的 key 值（單純 array 則保持為空）
          </span>
          <input
            className={styles.input}
            type="text"
            name="key"
            value={state.key}
            onChange={handleChange}
            placeholder="key"
          />
          <button type="button" className={styles.btnPrimary} onClick={checkDuplication}>
            Submit
          </button>
        </div>
      </div>
    </ToolContainer>
  );
}
```

- [ ] **Step 2: typecheck**

```bash
npm run typecheck 2>&1 | tail -3
```

Expected: 0 errors.

### Task 4.8: 接 ToolsPage index.tsx — nested Routes + landing

**Files:**
- Modify: `my-app/src/pages/ToolsPage/index.tsx`

- [ ] **Step 1: 完全替換**

```tsx
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToolsLanding } from './ToolsLanding';
import { CheckCookieDiff } from './tools/CheckCookieDiff';
import { CheckDuplicationItems } from './tools/CheckDuplicationItems';
import { tools } from '../../data/tools';
import styles from './ToolsPage.module.css';

export default function ToolsPage() {
  return (
    <div className={styles.page}>
      <Sidebar tools={tools} />
      <main className={styles.main}>
        <Routes>
          <Route index element={<ToolsLanding />} />
          <Route path="cookie-diff" element={<CheckCookieDiff />} />
          <Route path="duplication-check" element={<CheckDuplicationItems />} />
        </Routes>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: lint + typecheck + build**

```bash
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
npm run build 2>&1 | tail -5
```

Expected: 全綠。

### Task 4.9: dev 驗收 + commit Phase 4

- [ ] **Step 1: dev**

```bash
pkill -f "vite" 2>/dev/null; sleep 1
(npm run dev > /tmp/vite-dev.log 2>&1 &)
sleep 4
grep "Local:" /tmp/vite-dev.log
```

開瀏覽器 `/#/tools` 與兩個工具頁逐項驗收：

| 項目 | 期望 |
|---|---|
| `/#/tools` | landing 顯示 2 張卡片 + 「2 個工具」 |
| 卡片 hover | 橘 border + 上浮 |
| 點卡片 | 進到對應工具頁、Sidebar 該項目高亮（橘色） |
| Sidebar active | 左 3px 橘 border + 橘字 + accent-soft 底 |
| Cookie Diff | 兩個 textarea 並排、Parse 按鈕橘色、Submit 後 Table 出現 |
| Duplication | 三個 textarea（左大、右上右下兩個）、Submit 後結果顯示在 Repeat/notRepeat |
| Breadcrumb | 「Tools · 工具名」、Tools 可點回 landing |
| Dark mode | 切過去視覺對 |
| < 1024px | 工具內 textarea 並排變單欄 |
| < 900px | sidebar 收起來、變單欄 |

```bash
pkill -f "vite" 2>/dev/null; sleep 1
```

- [ ] **Step 2: Commit Phase 4**

```bash
rm -rf dist
cd /Users/admin/Desktop/myProject/ChrisSu
git add -A
git commit -m "feat(tools): rewrite ToolsPage with landing + sidebar nav + ToolContainer"
```

---

## Phase 5 — 最終驗收 + push + PR

### Task 5.1: 全域整體驗收

- [ ] **Step 1: 從乾淨狀態跑全套**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
rm -rf dist
npm run lint 2>&1 | tail -3
npm run typecheck 2>&1 | tail -3
npm run build 2>&1 | tail -5
```

Expected: 三項全綠。

- [ ] **Step 2: dev 完整四頁掃過**

```bash
pkill -f "vite" 2>/dev/null; sleep 1
(npm run dev > /tmp/vite-dev.log 2>&1 &)
sleep 4
grep "Local:" /tmp/vite-dev.log
```

逐頁驗收：

| 頁面 | 期望 |
|---|---|
| `/#/introduction` | Hero + About + Skills + Projects 完整、橘色主色一致 |
| `/#/notes` | Landing 卡片、Sidebar active 橘色、連結色橘 |
| `/#/notes/Python/python-commands` | 文章顯示、TOC 橘色 active、code block 有顏色 |
| `/#/tools` | 2 張工具卡 |
| `/#/tools/cookie-diff` | UI 用新 token、Parse 橘按鈕 |
| `/#/photos` | Album cover 卡片、hover 橘 border |
| `/#/photos/orange-cat-daily-1` | masonry 顯示、點圖開 lightbox（lightbox 仍黑底） |
| 任一頁面 | NavBar sticky blur、橘色 active 底線、Logo 橘點 |
| 主題切換 | 在每一頁都正確 |
| < 768px | NavBar 變漢堡 drawer、Hero 變單欄、卡片變單欄 |

```bash
pkill -f "vite" 2>/dev/null; sleep 1
```

### Task 5.2: Push + PR

- [ ] **Step 1: branch 歷史**

```bash
cd /Users/admin/Desktop/myProject/ChrisSu
git log --oneline master..HEAD
```

Expected: 4 個 commit（Phase 1 / 2 / 3 / 4）。

- [ ] **Step 2: Push**

```bash
git push -u origin feature/site-redesign
```

Expected: branch pushed、終端顯示 PR 連結。

- [ ] **Step 3: 在瀏覽器打開 PR 連結**

URL：`https://github.com/SuChenYu0623/ChrisSu/pull/new/feature/site-redesign`

Title 與 body 範例：

```
title: feat: site-wide redesign — Vercel/Linear style with orange accent

## Summary
依 docs/superpowers/specs/2026-06-09-site-wide-redesign.md 把整站視覺拉到統一的設計語言：

- Design tokens 重命名 --notes-* → --app-*、加 radius/shadow/spacing-6/7、主色換橘
- NavigationBar 改 sticky 透明 + backdrop blur + 英文 nav 標籤 + 響應式漢堡 drawer
- IntroductionPage 完全重寫：Hero / About / Skills / Projects 4 個元件
- ToolsPage 改寫：加 landing 卡片 + Sidebar NavLink active + ToolContainer wrapper
- NotesPage / PhotoPage：純 token rename，主色從藍變橘
- data/profile.ts 加 tagline + description + projects 陣列
- 刪掉舊 Avatar/ProfileTable/ExperienceSection/ExperienceProject、刪掉 BG-code1.jpg、BG-code2.jpg

## Test plan
- [ ] CI 跑過（lint + typecheck + build）
- [ ] `/introduction` Hero 大標、CTA、5 張 project 卡正常
- [ ] `/tools` landing + 兩個工具切換 + Sidebar active
- [ ] Notes / Photos 主色變橘
- [ ] NavBar sticky + drawer < 768px 正常
- [ ] Light / Dark mode 切換在 4 頁都對
```

---

## 驗證總表

| 項目 | 通過條件 |
|---|---|
| Build | `npm run build` 無 error |
| Typecheck | `npm run typecheck` 無 error |
| Lint | `npm run lint` 無 error |
| Token rename | `grep -rn "notes-" src/` 沒有 CSS 變數結果 |
| NavBar | sticky 64px、透明 blur、active 橘底線 |
| 漢堡 | < 768px 收 drawer |
| Introduction | Hero / About / Skills / Projects 都顯示 |
| CTA scroll | View Projects 滑到 `#projects` |
| Tools landing | 2 張卡 |
| Tools sidebar active | 橘色 |
| Notes / Photos 主色 | 全變橘 |
| Lightbox | 仍永遠黑底 |
| Shiki code | 語法高亮維持 GitHub 主題（未變） |
| Light/Dark | 整站 4 頁切換正確 |
| 既有功能 | 筆記閱讀、相簿 lightbox、工具邏輯都不變 |

---

## 不在這份 plan 內

- 單元 / E2E 測試
- ⌘K 命令列搜尋
- 頁面內次導覽 / TOC（除了筆記頁已存在的）
- 動畫庫（Framer Motion 等）
- Tailwind 或 CSS-in-JS
- 新增頁面（contact / blog）
- 換 build tool 或 framework
- 換 router 為 BrowserRouter

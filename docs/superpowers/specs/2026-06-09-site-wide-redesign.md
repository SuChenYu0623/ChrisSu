# 整站視覺重新設計 — Vercel/Linear 風 + 橘色主題

## Context

目前 4 個頁面風格不統一：
- **筆記頁 / 相片頁** 已是技術文件風 + 雙主題（用 `--notes-*` token、藍色主色）
- **個人簡介頁** 仍是「BG 圖滿屏 + 半透明白方塊」，跟新風格嚴重斷層
- **懶人工具頁** 用 hardcoded 顏色與尺寸、跟整站視覺脫節
- **NavigationBar** 是黑底 + Georgia 襯線字，跟其他頁面的 system font 不一致

這次重新設計目標：把所有頁面拉到統一的視覺語言 — **Vercel / Linear / GitHub 風的現代極簡**，加上**橘色主色**（呼應「胖橘日常」相簿、賦予個人特色）。

---

## 決策摘要

| 項目 | 決定 |
|---|---|
| 設計參考 | Vercel / Linear / GitHub — 大量留白、細邊框、輕陰影 |
| 主色 | 橘色（Light: `#ea580c` / Dark: `#fb923c`） |
| 字體 | 系統字體棧（沿用） |
| 雙主題 | 全站 Light + Dark、預設 Light |
| NavigationBar | Sticky 透明 + backdrop blur、64px 高 |
| IntroductionPage | 重寫：Hero + About + Skills + Projects 三段 |
| ToolsPage | 重寫：加 landing + 對齊 design tokens |
| 筆記頁 / 相片頁 | 微調：rename token + 改主色為橘 |
| Token 命名 | `--notes-*` → `--app-*`（語意化） |

---

## 1. 共用 Design Tokens（基石）

### 1.1 檔案結構

- 修改：`src/styles/tokens.css` — 把所有 `--notes-*` rename 成 `--app-*`、加上新 token（radius、shadow、spacing-6/7）、主色換橘
- 所有 module.css 內的 `var(--notes-*)` 用全文件 sed 替換成 `var(--app-*)`

### 1.2 完整 token 定義

**Light（`:root`）**：

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
```

**Dark**：

```css
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
```

### 1.3 Migration 策略

一次性把所有用到 `--notes-*` 的 CSS Module 改名：

```bash
cd /Users/admin/Desktop/myProject/ChrisSu/my-app
grep -rl "--notes-" src/ | xargs sed -i '' 's/--notes-/--app-/g'
```

由於 token 值幾乎相同（只有 accent 從藍變橘），筆記/相片頁的視覺基本不變。

---

## 2. NavigationBar 重新設計

### 2.1 規格

```
┌──────────────────────────────────────────────────────────┐
│  ●  Chris Su      About  Notes  Tools  Photos    ☀  ⎘   │
└──────────────────────────────────────────────────────────┘
   blur backdrop, 64px high, sticky top
```

- 高 64px、`position: sticky; top: 0; z-index: 50`
- 背景：`rgba(250, 250, 250, 0.7)` (light) / `rgba(10, 10, 10, 0.7)` (dark)
- `backdrop-filter: blur(12px) saturate(180%)` 模糊背景
- 下邊框 1px `var(--app-border)`、永遠存在（YAGNI、不做滾動偵測）
- 內容容器：`max-width: 1280px`、左右 padding 24px、`display: flex; justify-content: space-between; align-items: center`

### 2.2 左側 Logo

- 一個橘色實心點 `●`（8px 圓、`background: var(--app-accent)`、`border-radius: 50%`）
- 「Chris Su」字（15px、`font-weight: 600`）
- 點擊回 `/introduction`
- 容器是 `<Link to="/introduction">`、間距 gap 10px

### 2.3 中間 nav items

| 中文（舊） | 英文（新） | path |
|---|---|---|
| 個人簡介 | About | `/introduction` |
| 筆記總覽 | Notes | `/notes` |
| 懶人工具 | Tools | `/tools` |
| 相片專區 | Photos | `/photos` |

- 字級 14px、`color: var(--app-fg-muted)`、間距 32px
- 用 `NavLink`、active state 邏輯：
  - 字色變 `var(--app-fg)`
  - 文字下方 2px 橘色底線（`border-bottom: 2px solid var(--app-accent)`、`padding-bottom: 18px`、撐到 nav 底）
- Hover：字色變 `var(--app-fg)`、底線淡淡出現（`border-color: var(--app-border-strong)`）

### 2.4 右側 actions

- **主題切換**：保留現有 useTheme + ☀/🌙 SVG 按鈕、樣式對齊新 token
- **GitHub link**：新元素、外部連結 icon、`href="https://github.com/SuChenYu0623"`、`target="_blank"`、`rel="noreferrer"`、`aria-label="GitHub"`
- 兩個按鈕並排、gap 8px

### 2.5 響應式

- `>= 768px`：完整顯示
- `< 768px`：
  - nav items 收成漢堡 menu（右上角）
  - 點開全螢幕 drawer 從上往下滑出、4 個 link 大字（24px）排列
  - 點 link 或點 backdrop 關閉
  - Logo + 主題切換 + 漢堡 維持顯示

### 2.6 元件結構

- 修改：`src/components/NavigationBar.tsx`
- 修改：`src/components/NavigationBar.module.css`
- 路由標籤改用英文：修改 `src/data/nav.ts` 的 `label`

---

## 3. IntroductionPage 重新設計

### 3.1 整體結構

```
[Nav]
─────────────────────────────────────────
Hero        — 100vh - 64px (nav)
─────────────────────────────────────────
About       — 2x2 cards
─────────────────────────────────────────
Skills      — pill tags
─────────────────────────────────────────
Projects    — vertical card list
─────────────────────────────────────────
```

### 3.2 Hero

- 容器：`max-width: 1280px`、`padding: 96px 24px 64px`
- Grid 兩欄 `1fr 320px`、`gap: 64px`、< 768px 單欄（Avatar 在上）
- **大標**：`<h1>Hi, I'm Chris Su<span class="accent">.</span></h1>`
  - 56px / 700 / `line-height: 1.1` / `letter-spacing: -0.02em`
  - 句末 `.` 用 `color: var(--app-accent)` 強調
- **副標**：「Crawler Engineer & Front End」、20px / `color: var(--app-fg-muted)` / margin-top 12px
- **描述**：從 `profile.description` 來、16px / line-height 1.7 / `color: var(--app-fg-soft)` / max-width 540px / margin-top 24px
- **CTA 按鈕組**（margin-top 32px、gap 12px）：
  - Primary「View Projects →」、背景 `--app-accent`、文字 `--app-accent-fg`、`border-radius: 8px`、padding `10px 18px`、hover `--app-accent-hover`、點擊 smooth scroll 到 `#projects`
  - Secondary「GitHub」、透明背景、`border: 1px solid var(--app-border-strong)`、hover 反白、外部連結到 `profile.githubUrl`
- **Avatar**：
  - 200×200 `border-radius: var(--radius-xl)`、`box-shadow: var(--shadow-md)`、`object-fit: cover`
  - hover：`transform: translateY(-2px)`、transition 0.3s
  - 圖片用 `profile.avatarSrc`（新欄位）

### 3.3 About section

- Section label「ABOUT」（uppercase、12px、letter-spacing 0.1em、`color: var(--app-fg-muted)`、margin-bottom 24px）
- 2×2 grid：`grid-template-columns: repeat(2, 1fr)`、`gap: 16px`、< 768px 變單欄
- 4 個卡片：Born / Education / Languages / Currently
- 卡片樣式：
  - `background: var(--app-bg-elevated)`、`border: 1px solid var(--app-border)`、`border-radius: var(--radius-lg)`、`padding: 20px`
  - 內：標籤（12px muted）+ 內容（16px fg）
- 容器：`max-width: 1280px`、`padding: 48px 24px`

### 3.4 Skills section

- Section label「SKILLS」
- Pill tag 排列（從 `profile.skills` 來、原 `experience` 改名）：
  - `display: inline-flex`、`padding: 6px 14px`、`border-radius: 999px`
  - `background: var(--app-accent-soft)`、`color: var(--app-accent)`、14px / 500
  - 間距 8px、自動換行
- **不做**點擊滾動（YAGNI、純展示）

### 3.5 Projects section

- Section label「PROJECTS」、`<section id="projects">` 給 Hero CTA scroll 用
- Vertical list of project cards、每張 margin-bottom 16px
- 每張卡片：
  ```
  ┌────────────────────────────────────────────┐
  │ SocialMedia                  [↗] [↗]      │
  │ React · Web                                │
  │ 短描述（< 80 字）                          │
  └────────────────────────────────────────────┘
  ```
- 卡片樣式：
  - `background: var(--app-bg-elevated)`、`border: 1px solid var(--app-border)`、`border-radius: var(--radius-lg)`、`padding: 24px`
  - Hover：`border-color: var(--app-accent)`、`transform: translateY(-2px)`、`box-shadow: var(--shadow-md)`、transition 0.2s
- 內容：
  - 大標：project 名（18px / 600）
  - Tags 行：`React · Web` 之類、`color: var(--app-fg-muted)`、12px、用 `·` 串接 `project.tags`
  - 描述：1 行短描述（14px / line-height 1.5）
  - 右上角 icon group：GitHub icon link + Live icon link（外部連結、hover 變橘）、有 liveUrl 才顯示

### 3.6 拿掉的內容

- ❌ BG-code1.jpg / BG-code2.jpg 兩個程式碼背景圖檔案（刪除、不再用）
- ✅ BG.jpg 保留作為 Avatar 圖片（既有資產複用）
- ❌ 半透明白卡片設計
- ❌ 「生而為人」saying 區塊
- ❌ React Project / JS 爬蟲 兩個分開 section
- ❌ Avatar.tsx（400×400 大方塊）
- ❌ ProfileTable.tsx（表格式 profile）
- ❌ ExperienceSection.tsx
- ❌ ExperienceProject.tsx

### 3.7 新元件結構

| 檔案 | 角色 |
|---|---|
| `IntroductionPage/index.tsx` | 頁面 layout + sections 組合 |
| `IntroductionPage/Hero.tsx` | hero 區 |
| `IntroductionPage/About.tsx` | about cards |
| `IntroductionPage/Skills.tsx` | skill pills |
| `IntroductionPage/Projects.tsx` | project list |
| `IntroductionPage/ProjectCard.tsx` | 單張 project 卡 |
| `IntroductionPage/IntroductionPage.module.css` | 統一樣式 |

### 3.8 data/profile.ts 改寫

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
  avatarSrc: BG_IMG, // 沿用既有的 src/images/BG.jpg（已壓縮 56KB，cover 顯示效果驗證過 OK）
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

> 註：`avatarSrc` 用 `import BG_IMG from '../images/BG.jpg'`。實作時引入既有的 BG.jpg（已壓縮、cover 顯示測試過 OK）。description 內文採用上述提案、實作可微調。

---

## 4. ToolsPage 重新設計

### 4.1 路由變更

`ToolsPage/index.tsx` 加 `index` route 給 `ToolsLanding`：

```tsx
<Routes>
  <Route index element={<ToolsLanding />} />
  <Route path="cookie-diff" element={<CheckCookieDiff />} />
  <Route path="duplication-check" element={<CheckDuplicationItems />} />
</Routes>
```

### 4.2 ToolsLanding

進入 `/tools` 時、右側顯示卡片網格：

- Section label「TOOLS」+ 副標「2 個工具」
- Grid `repeat(auto-fit, minmax(280px, 1fr))`、gap 16px、max 2 欄
- 每張卡片：
  - `padding: 24px`、`background: var(--app-bg-elevated)`、`border: 1px solid var(--app-border)`、`border-radius: var(--radius-lg)`
  - 大標 18px / 600（tool label）
  - 描述 14px / `color: var(--app-fg-muted)`（從 `data/tools.ts` 來）
  - Hover：橘 border + 上浮 + shadow-md
  - 整張卡片是 `<Link>` 到 `/tools/{slug}`

### 4.3 Sidebar 改寫

跟 NotesPage Sidebar 同視覺：
- 寬 240px、`background: var(--app-bg-subtle)`、右邊 1px border
- 頂部 label「TOOLS」（uppercase 12px muted）取代「cats」
- Tool item 用 NavLink、active state：左 3px 橘 border + 橘字 + accent-soft 底
- 不要分類層級

### 4.4 Tool 內容區

- `ToolContainer.tsx` wrapper 提供統一樣式：breadcrumb + title + description
- 兩個工具元件 layout 改 CSS Grid（取代既有 hardcoded percentage）
- TextArea 重畫：`var(--app-bg-subtle)` 底、`var(--app-border)` 邊、14px mono、focus 顯示橘色 outline
- 主要按鈕（Parse / Submit）統一用 Primary 按鈕樣式（橘填白字）

### 4.5 data/tools.ts 加 description

```ts
export type ToolEntry = {
  slug: string;
  label: string;
  description: string;
};

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

### 4.6 元件結構

| 檔案 | 改動 |
|---|---|
| `ToolsPage/index.tsx` | 加 index route + ToolsLanding |
| `ToolsPage/ToolsLanding.tsx` | 新檔 |
| `ToolsPage/Sidebar.tsx` | 重寫（對齊 NotesPage 視覺） |
| `ToolsPage/ToolContainer.tsx` | 新檔（breadcrumb + title wrapper） |
| `ToolsPage/tools/CheckCookieDiff.tsx` | 改視覺、保留邏輯 |
| `ToolsPage/tools/CheckDuplicationItems.tsx` | 改視覺、保留邏輯 |
| `ToolsPage/ToolsPage.module.css` | 完全重寫 |

---

## 5. 筆記頁 / 相片頁微調

### 5.1 主色從藍變橘

由於整站 token 統一改用 `--app-accent`，原本筆記/相片頁的藍色自動變橘：

- 筆記 Sidebar active state border + 字
- 筆記文章內 `<a>` 連結色
- 筆記 search box focus outline
- 筆記 NotesLanding 卡片 hover border
- 相片 AlbumCover hover border
- 相片 Masonry figure focus-visible outline

### 5.2 不變

- 筆記文章內 Shiki 程式碼塊：保持 `github-light` / `github-dark` 主題不變（語法高亮顏色是專業需求、不跟主色混淆）
- 相片 Lightbox：永遠黑底白字、不跟主題

### 5.3 改動範圍

純粹 token rename + 主色換值，**不動任何元件結構或 JSX**。

---

## 6. Scope（明確排除）

- 不做 ⌘K 命令列搜尋
- 不做頁面內次導覽
- 不引入動畫庫（Framer Motion 等）— 純 CSS transition
- 不引入 Tailwind / styled-components
- 不換 router（HashRouter 保留）
- 不做 contact form、不做 vCard 下載
- 不重新設計筆記 / 相片頁的元件結構（只換 token）
- 不寫單元測試
- 不引入 Web font（系統字體棧足夠）

---

## 7. 驗證方式

- `npm run lint` / `npm run typecheck` / `npm run build` 全綠
- NavigationBar sticky 滾動時可見、blur 效果正常
- `/introduction` 顯示 Hero（大標 + Avatar + CTA），按「View Projects」smooth scroll 到下方
- About / Skills / Projects 3 個 section 正確顯示、卡片 hover 互動正常
- `/tools` 顯示 landing 卡片（2 張）
- `/tools/cookie-diff` 與 `/tools/duplication-check` 內容區用新樣式、Parse / Submit 按鈕為橘色
- 筆記頁 sidebar active 與連結色為橘
- 相片 AlbumCover hover border 為橘
- Light / Dark mode 切換在 4 頁都正確
- < 768px 響應式：NavigationBar 變漢堡、Hero 變單欄、卡片網格降為單欄
- 既有功能（筆記內容、相簿 lightbox、工具邏輯）完全不變

---

## 8. 不在這份 spec 內

整套 plan 只專注「視覺與資料層」的重做。下列項目明確排除：
- 重做 Notes / Photos 的元件邏輯
- 修改 router 架構
- 重做 NavigationBar 以外的全局狀態管理
- 新增頁面（如 contact / blog post）
- 換 build tool 或 framework

# 筆記總覽頁面 — 視覺與功能重新設計

## Context

目前 `NotesPage` 是手寫風（Gamja Flower）、整體偏暗灰、無語法高亮、code block 樸素、沒 TOC、沒搜尋、沒 dark mode；landing 頁右半完全空白（未選筆記時主內容區是空白）。這些問題讓筆記頁無法承擔「個人技術筆記」的功能 — 既不易讀也不易導航。

本次重新設計目標：

- 視覺上轉成**技術文件風**（Notion / GitBook / GitHub docs 慣例），筆記頁與其他頁面風格脫鉤
- 支援 **Light + Dark 雙主題**，全站 NavigationBar 上加切換按鈕
- 補齊 **TOC、breadcrumb、Sidebar 搜尋、語法高亮**
- 補上 landing 頁，避免「右半空白」尷尬

範圍只限筆記頁與全站主題切換機制；不動其他頁面視覺。

---

## 決策摘要

| 項目 | 決定 |
|---|---|
| 視覺風格 | 技術文件風（白底/深底乾淨閱讀體驗） |
| Theme | Light + Dark，可手動切換、localStorage 記憶、首次依 `prefers-color-scheme` |
| Layout | 三欄：Sidebar 240px / Main flex（max 800px）/ TOC 200px |
| 字體（筆記頁限定） | 系統字體棧（中英文）+ JetBrains Mono（code） |
| Markdown | `react-markdown@10` + `remark-gfm` + `github-slugger` |
| 語法高亮 | `shiki`（build-time、雙主題、低 runtime cost） |
| TOC active | 原生 `IntersectionObserver` |
| 響應式 | < 1200px 隱藏 TOC；< 900px sidebar 收成漢堡（出 drawer） |

---

## 1. Layout 結構

```
┌────────────── NavigationBar（沿用、+ 主題切換按鈕） ─────────────┐
│ 個人簡介  筆記總覽  懶人工具  相片專區              [☀ / 🌙] │
├──────────┬───────────────────────────────────────┬──────────────┤
│ 搜尋     │  Notes · Python · 常用指令            │  目錄        │
│          │                                       │              │
│ Sidebar  │  Main（max-width: 800px、置中）       │  TOC（sticky)│
│ 240px    │  自由捲動                             │  200px       │
│          │                                       │              │
└──────────┴───────────────────────────────────────┴──────────────┘
```

- Container 用 `display: grid; grid-template-columns: 240px 1fr 200px;`
- < 1200px：`grid-template-columns: 240px 1fr;`（隱藏 TOC）
- < 900px：`grid-template-columns: 1fr;`、sidebar 變漢堡 drawer

---

## 2. Design Tokens（雙主題）

放在 `src/styles/tokens.css`（新檔），透過 `[data-theme="dark"]` 切換。

**Light（`:root`）**：

```css
:root {
  --notes-bg: #ffffff;
  --notes-bg-subtle: #f8f9fa;
  --notes-bg-code: #f6f8fa;
  --notes-fg: #1f2328;
  --notes-fg-muted: #656d76;
  --notes-border: #d0d7de;
  --notes-accent: #0969da;
  --notes-accent-soft: #ddf4ff;
}
```

**Dark（`[data-theme="dark"]`）**：

```css
[data-theme='dark'] {
  --notes-bg: #0d1117;
  --notes-bg-subtle: #161b22;
  --notes-bg-code: #161b22;
  --notes-fg: #e6edf3;
  --notes-fg-muted: #8b949e;
  --notes-border: #30363d;
  --notes-accent: #58a6ff;
  --notes-accent-soft: rgba(56, 139, 253, 0.15);
}
```

**字體（筆記頁 scope）**：
- 正文：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'Microsoft JhengHei', 'PingFang TC', sans-serif`
- Code：`'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, Monaco, monospace`

**字級**：
- h1 32/700/1.25、h2 24/600/1.3（border-top 1px）、h3 18/600
- 正文 16/400/1.7
- code inline 14/500、code block 14/1.5

> 命名加 `--notes-` 前綴避免污染現有 globals.css 的 token。NavigationBar 的主題切換按鈕用既有 token，不引 `--notes-*`。

---

## 3. 主題切換機制

**檔案：`src/hooks/useTheme.ts`**

```ts
type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
```

**UI**：`NavigationBar.tsx` 末尾加按鈕，icon 用 inline SVG（☀ / 🌙）、`aria-label="切換主題"`、`title="切換主題"`。

---

## 4. Sidebar 重新設計

**檔案改動**：`src/pages/NotesPage/Sidebar.tsx`、`NotesPage.module.css`

**新增**：頂部搜尋框（內部 `useState` 存 query、用 `.toLowerCase().includes()` 過濾、無結果顯示提示文字）。

**分類標題樣式**：
- uppercase + 12px + `letter-spacing: 0.05em` + `fg-muted`
- 摺疊圖示 ▾/▸ 替代 plan v1 的箭頭按鈕、可點整列展開

**筆記項**：
- 14px、padding 8px 16px、`border-radius: 6px`、左邊 12px 縮排表示層級
- hover：`bg-subtle` 加深一點
- **active**（用 `NavLink` 的 `isActive`）：`border-left: 3px solid var(--notes-accent)` + `bg-color: var(--notes-accent-soft)` + `color: var(--notes-accent)` + `font-weight: 600`

**初始狀態**：所有分類預設展開；搜尋字串非空時所有分類強制展開、隱藏不符合的筆記項；分類本身全部符合則整類隱藏。

**進入筆記**：點筆記後該分類保持展開（state local、不存 localStorage、YAGNI）。

---

## 5. Main（內容區）

**Breadcrumb**（新元件 `Breadcrumb.tsx`）：

```tsx
<nav aria-label="breadcrumb" className={styles.breadcrumb}>
  <Link to="/notes">筆記</Link>
  <span aria-hidden> · </span>
  <span className={styles.breadcrumbCategory}>{categoryLabel}</span>
  <span aria-hidden> · </span>
  <span aria-current="page">{noteTitle}</span>
</nav>
```

> 註：當前 router 沒有 `/notes/:category` 中間層；breadcrumb 上的「Python」是純展示文字（非連結），不開新路由。等到分類頁有需要再加。

**Article**：
- 包在 `<article className={styles.article}>`、`max-width: 800px`、`margin: 0 auto`、`padding: 32px 24px`
- 段落、list、blockquote 樣式照 § 4 規格

**Code block**（重點，見 § 7）

---

## 6. TOC

**新元件 `TableOfContents.tsx`**：

```tsx
type Heading = { id: string; text: string; level: 2 | 3 };

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;
  return (
    <nav aria-label="目錄" className={styles.toc}>
      <div className={styles.tocTitle}>目錄</div>
      <ul>
        {headings.map((h) => (
          <li
            key={h.id}
            className={h.level === 3 ? styles.tocItemIndent : undefined}
            data-active={activeId === h.id}
          >
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

**headings 來源**：在 Note.tsx 解析 markdown 後遍歷 AST 取 `<h2>` / `<h3>`、用 `github-slugger` 算 id。也讓 react-markdown 的 h2/h3 自訂 component 加上同 id（用同一個 slugger instance 保證 id 一致）。

---

## 7. 語法高亮 — Shiki

**為什麼選 Shiki**：
- VS Code 內建引擎、配色成熟
- 雙主題同時 render（CSS variable 自動切換）— `shiki` 提供 `cssVariablesTheme` 或 `themes: { light, dark }`
- 純 build-time，runtime 只需要 CSS

**整合方式（client-side）**：用 `shiki` 的 `bundledHighlighter` 與動態載入語言，避免 bundle 過大。

```ts
// src/lib/shiki.ts
import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: ['python', 'javascript', 'typescript', 'tsx', 'jsx', 'bash', 'json', 'css', 'html', 'markdown'],
    });
  }
  return highlighterPromise;
}
```

**用法（Note.tsx 內 code component override）**：

```tsx
function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [html, setHtml] = useState('');
  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((h) => {
      const out = h.codeToHtml(code, {
        lang,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: false,
      });
      if (!cancelled) setHtml(out);
    });
    return () => { cancelled = true };
  }, [lang, code]);

  return (
    <div className={styles.codeBlockWrapper}>
      <span className={styles.codeLang}>{lang}</span>
      <CopyButton text={code} />
      <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
```

> `defaultColor: false` + `themes: { light, dark }` 會輸出 CSS variables (`--shiki-light` / `--shiki-dark`)，可在自家 CSS 用 `[data-theme=dark]` 規則切換 — Shiki 官方推薦做法。

**Copy 按鈕**：
- 絕對定位右上、`opacity: 0.4`、`code wrapper:hover` 時 → `opacity: 1`
- 點擊後 `setCopied(true)` → 2 秒後重置；按鈕文字「複製」→「已複製 ✓」
- **不用 alert**（捨棄現有 `useCopyToClipboard` 的 `alert()` 行為，新筆記頁複製不彈窗）

**取代既有 alert 行為**：`useCopyToClipboard` 接受 optional `silent` 參數；筆記頁傳 `silent: true`，工具頁維持原 alert。

---

## 8. Markdown 渲染（Note.tsx）

```tsx
<Markdown
  remarkPlugins={[remarkGfm]}
  components={{
    h2: ({ children }) => {
      const id = slugger.slug(String(children));
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }) => {
      const id = slugger.slug(String(children));
      return <h3 id={id}>{children}</h3>;
    },
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? '');
      if (!match) {
        return <code className={styles.inlineCode} {...props}>{children}</code>;
      }
      return <CodeBlock lang={match[1]} code={String(children).replace(/\n$/, '')} />;
    },
    a: ({ href, children }) => (
      <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {children}
      </a>
    ),
  }}
>
  {text}
</Markdown>
```

**Headings 收集（給 TOC）**：在 markdown 載入後、再用 `unified` + `remark-parse` 跑一次取出 h2/h3，或用 regex 簡單抓 `^##\s+(.+)` / `^###\s+(.+)`。

> **採用 regex 方案**：簡單、6 篇筆記內容單純、沒有複雜 markdown 結構，不引額外依賴。

```ts
function extractHeadings(md: string): Heading[] {
  const slugger = new GithubSlugger();
  const lines = md.split('\n');
  const headings: Heading[] = [];
  for (const line of lines) {
    const m2 = /^##\s+(.+?)\s*$/.exec(line);
    const m3 = /^###\s+(.+?)\s*$/.exec(line);
    if (m2) headings.push({ id: slugger.slug(m2[1]), text: m2[1], level: 2 });
    else if (m3) headings.push({ id: slugger.slug(m3[1]), text: m3[1], level: 3 });
  }
  return headings;
}
```

> 注意：Note.tsx 內 markdown render 與 headings extract 用**同一個** slugger instance（避免重複標題的 id 算錯）— 在 Note 內 `useMemo(() => new GithubSlugger(), [text])` 並把 instance 傳給 h2/h3 components。

---

## 9. Landing 頁（`/notes` 沒選筆記時）

**新元件 `NotesLanding.tsx`**：

```tsx
export function NotesLanding() {
  const total = noteCategories.reduce((n, c) => n + c.notes.length, 0);
  return (
    <article className={styles.landing}>
      <h1>筆記總覽</h1>
      <p className={styles.landingMeta}>共 {total} 篇筆記，分 {noteCategories.length} 個分類</p>
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

**路由**：`NotesPage/index.tsx` 新增 `<Route index element={<NotesLanding />} />`。

---

## 10. 響應式

```css
/* < 1200px */
@media (max-width: 1200px) {
  .container {
    grid-template-columns: 240px 1fr;
  }
  .toc {
    display: none;
  }
}

/* < 900px */
@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.2s;
  }
  .sidebar[data-open='true'] {
    transform: translateX(0);
  }
  .menuButton {
    display: block; /* 漢堡按鈕，<900px 才顯示 */
  }
}
```

漢堡按鈕在 Main 區頂部、左上、點擊 toggle sidebar `data-open` 屬性。Sidebar 開啟時加 backdrop overlay。

---

## 11. 檔案改動清單

**新增**：
- `src/styles/tokens.css` — 雙主題 CSS variables
- `src/hooks/useTheme.ts`
- `src/pages/NotesPage/Breadcrumb.tsx`
- `src/pages/NotesPage/TableOfContents.tsx`
- `src/pages/NotesPage/NotesLanding.tsx`
- `src/pages/NotesPage/CodeBlock.tsx`
- `src/pages/NotesPage/CopyButton.tsx`
- `src/lib/shiki.ts` — Highlighter singleton
- `src/lib/extractHeadings.ts`

**修改**：
- `src/App.tsx` — 套用 `useTheme()`、新增 `index` route 給 NotesLanding
- `src/main.tsx` — import `tokens.css`
- `src/components/NavigationBar.tsx` + `.module.css` — 加主題切換按鈕
- `src/pages/NotesPage/index.tsx` — 三欄 grid、新增 landing route
- `src/pages/NotesPage/Sidebar.tsx` — 搜尋框、active state、樣式重寫
- `src/pages/NotesPage/Note.tsx` — breadcrumb / TOC / Shiki code block / GFM
- `src/pages/NotesPage/NotesPage.module.css` — 全面重寫
- `src/hooks/useCopyToClipboard.ts` — 加 `silent` 參數

**依賴新增**：
- `shiki`
- `remark-gfm`
- `github-slugger`

---

## 12. 不在 scope 內

- 留言 / 點讚 / 分享 / 收藏
- 全文搜尋（只搜標題）
- 版本歷史
- RSS / sitemap / print stylesheet
- 修改其他頁面（Introduction / Tools / Photo）視覺
- 取代其他頁面的 `react-syntax-highlighter`（目前沒用到，依賴可保留待清理）
- 多語言 i18n

---

## 13. 驗證方式

- `npm run lint` / `npm run typecheck` / `npm run build` 全綠
- `/notes` 訪問顯示 landing 卡片
- 點分類卡 / sidebar 筆記項 → 進到 markdown 頁
- 重整 `/notes/Python/python-commands` 不 404、TOC 出現
- 主題切換按鈕：Light → Dark CSS 變數全切換、`localStorage.getItem('theme')` 有值
- 程式碼區塊：Python / JS / TSX / bash 都有正確高亮、Light/Dark 都好看
- Copy 按鈕：hover code 才出現、點擊變「已複製 ✓」、無 alert 彈窗
- TOC：捲動時 active 切換、點擊跳轉、smooth scroll
- Sidebar 搜尋：輸入 "react" 只剩相關項
- 響應式：縮窗到 < 1200px TOC 消失、< 900px sidebar 收漢堡

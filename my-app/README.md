# ChrisSu 個人網站

蘇禎佑（Chris Su）的個人作品集，部署於 [https://suchenyu0623.github.io/ChrisSu](https://suchenyu0623.github.io/ChrisSu)。

## 技術棧

- Vite 8 + React 19 + TypeScript 6（strict）
- CSS Modules + CSS variables（design tokens）
- React Router 6（HashRouter — 規避 GitHub Pages SPA 重整 404）
- ESLint 9（flat config）+ Prettier 3
- GitHub Actions：CI（lint + typecheck + build）+ 自動部署到 `gh-pages` 分支

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
| `npm run build` | Production build（`tsc -b && vite build`，產出在 `dist/`） |
| `npm run preview` | 本機跑 production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 編譯檢查 |
| `npm run format` | Prettier 格式化 |
| `npm run deploy` | 手動部署到 gh-pages（CI 已自動處理） |

## 專案結構

```
src/
  main.tsx                 # Vite 入口
  App.tsx                  # HashRouter + routes
  vite-env.d.ts
  components/              # 跨頁面共用（NavigationBar / TextArea / DefaultImage）
  data/                    # 集中所有硬編碼資料（profile / notes / tools / photos / nav）
  hooks/                   # 共用 hook（useCopyToClipboard）
  types/                   # 共用型別
  styles/globals.css       # CSS variables + reset + 全域樣式
  pages/
    IntroductionPage/      # 拆 5 個子元件
    NotesPage/             # Sidebar + Note（用 useParams + Vite ?raw markdown import）
    ToolsPage/             # cookie-diff / duplication-check 兩個工具
    PhotoPage/             # PhotoAlbum / PhotoDetail / PhotoActionBar
```

## 內容更新

- 個資與經歷：`src/data/profile.ts`
- 筆記分類與檔案：`src/data/notes.ts` + `src/pages/NotesPage/notes/`
- 工具清單：`src/data/tools.ts`
- 相簿：`src/data/photos.ts`
- 導覽列：`src/data/nav.ts`

## 部署

直接 push 到 `master` 即會由 `.github/workflows/deploy.yml` 自動部署。如需手動部署：

```bash
npm run build
npm run deploy
```

> 需先確認 GitHub repo Settings → Pages 的 Source 為 `gh-pages` 分支、Actions → General → Workflow permissions 為 `Read and write`。

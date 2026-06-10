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

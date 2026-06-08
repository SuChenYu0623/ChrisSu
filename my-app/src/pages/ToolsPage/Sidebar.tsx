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

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

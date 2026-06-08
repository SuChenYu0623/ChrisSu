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
    </nav>
  );
}

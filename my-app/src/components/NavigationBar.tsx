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

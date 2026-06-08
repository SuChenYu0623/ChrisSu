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

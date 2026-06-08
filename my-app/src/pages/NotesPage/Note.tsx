import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import styles from './NotesPage.module.css';

export function Note() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [text, setText] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!category || !slug) {
      return;
    }
    import(`./notes/${category}/${slug}.md?raw`)
      .then((module: { default: string }) => {
        if (!cancelled) setText(module.default);
      })
      .catch(() => {
        if (!cancelled) setText('');
      });
    return () => {
      cancelled = true;
    };
  }, [category, slug]);

  const extractCodeText = (children: unknown): string => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(extractCodeText).join('');
    if (children && typeof children === 'object' && 'props' in children) {
      const inner = (children as { props?: { children?: unknown } }).props?.children;
      return extractCodeText(inner);
    }
    return '';
  };

  return (
    <div className={styles.note}>
      <Markdown
        components={{
          h1: 'h2',
          pre: ({ children }) => (
            <pre>
              <code>{children}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(extractCodeText(children))}
              >
                複製
              </button>
            </pre>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}

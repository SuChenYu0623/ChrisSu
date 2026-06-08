import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import styles from './NotesPage.module.css';

export function Note() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [text, setText] = useState('');
  const copy = useCopyToClipboard();

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

  return (
    <div className={styles.note}>
      <Markdown
        components={{
          h1: 'h2',
          code({ className, children, ...props }) {
            const isBlock = /language-(\w+)/.exec(className ?? '') !== null;
            if (!isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            const codeText = String(children).replace(/\n$/, '');
            return (
              <>
                <code className={className} {...props}>
                  {codeText}
                </code>
                <button type="button" className={styles.copyBtn} onClick={() => copy(codeText)}>
                  複製
                </button>
              </>
            );
          },
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}

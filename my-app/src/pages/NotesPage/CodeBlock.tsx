import { useEffect, useState } from 'react';
import { getHighlighter, NOTES_THEMES } from '../../lib/shiki';
import { CopyButton } from './CopyButton';
import styles from './CodeBlock.module.css';

type Props = { lang: string; code: string };

export function CodeBlock({ lang, code }: Props) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((h) => {
        if (cancelled) return;
        const supported = h.getLoadedLanguages().includes(lang);
        const out = h.codeToHtml(code, {
          lang: supported ? lang : 'text',
          themes: NOTES_THEMES,
          defaultColor: 'light',
        });
        setHtml(out);
      })
      .catch((err) => {
        console.error('Shiki highlight failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [lang, code]);

  return (
    <div className={styles.wrapper}>
      <span className={styles.langLabel}>{lang}</span>
      <div className={styles.copyButtonSlot}>
        <CopyButton text={code} />
      </div>
      {html ? (
        <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className={styles.fallback}>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

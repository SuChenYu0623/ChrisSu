import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GithubSlugger from 'github-slugger';
import { CodeBlock } from './CodeBlock';
import { Breadcrumb } from './Breadcrumb';
import { TableOfContents } from './TableOfContents';
import { extractHeadings, type Heading } from '../../lib/extractHeadings';
import { noteCategories } from '../../data/notes';
import styles from './NotesPage.module.css';

function findNoteMeta(category?: string, slug?: string) {
  if (!category || !slug) return null;
  const cat = noteCategories.find((c) => c.key === category);
  if (!cat) return null;
  const note = cat.notes.find((n) => n.slug === slug);
  if (!note) return null;
  return { categoryLabel: cat.label, noteTitle: note.title };
}

export function Note() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [text, setText] = useState('');
  const meta = findNoteMeta(category, slug);

  useEffect(() => {
    let cancelled = false;
    if (!category || !slug) return;
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

  const { headings, slugger } = useMemo(() => {
    const s = new GithubSlugger();
    const h: Heading[] = extractHeadings(text, s);
    s.reset();
    return { headings: h, slugger: s };
  }, [text]);

  if (!meta) {
    return (
      <div className={styles.notFound}>
        <p>找不到這篇筆記。</p>
      </div>
    );
  }

  return (
    <div className={styles.noteLayout}>
      <article className={styles.article}>
        <Breadcrumb categoryLabel={meta.categoryLabel} noteTitle={meta.noteTitle} />
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
            h2: ({ children }) => {
              const id = slugger.slug(String(children));
              return (
                <h2 id={id} className={styles.h2}>
                  {children}
                </h2>
              );
            },
            h3: ({ children }) => {
              const id = slugger.slug(String(children));
              return (
                <h3 id={id} className={styles.h3}>
                  {children}
                </h3>
              );
            },
            a: ({ href, children }) => {
              const isExternal = href?.startsWith('http');
              return (
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                >
                  {children}
                </a>
              );
            },
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className ?? '');
              if (!match) {
                return (
                  <code className={styles.inlineCode} {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <CodeBlock lang={match[1]} code={String(children).replace(/\n$/, '')} />
              );
            },
          }}
        >
          {text}
        </Markdown>
      </article>
      <aside className={styles.tocColumn}>
        <TableOfContents headings={headings} />
      </aside>
    </div>
  );
}

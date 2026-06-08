import type { Highlighter } from 'shiki';
import { createHighlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

export const NOTES_THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const;

export const NOTES_LANGS = [
  'python',
  'javascript',
  'typescript',
  'tsx',
  'jsx',
  'bash',
  'shell',
  'json',
  'css',
  'html',
  'markdown',
] as const;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [NOTES_THEMES.light, NOTES_THEMES.dark],
      langs: [...NOTES_LANGS],
    });
  }
  return highlighterPromise;
}

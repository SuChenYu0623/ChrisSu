import type { NoteCategory } from '../types';

export const noteCategories: NoteCategory[] = [
  {
    key: 'Python',
    label: 'Python',
    notes: [
      { slug: 'python-commands', title: 'Python 常用指令' },
      { slug: 'pandas-numpy', title: 'Pandas & Numpy' },
    ],
  },
  {
    key: 'JavaScript',
    label: 'JavaScript',
    notes: [
      { slug: 'javascript-commands', title: 'JavaScript 常用指令' },
      { slug: 'react', title: 'React' },
      { slug: 'nextjs', title: 'NextJS' },
    ],
  },
  {
    key: 'React',
    label: 'React',
    notes: [{ slug: 'react-hook', title: 'React HOOK' }],
  },
];

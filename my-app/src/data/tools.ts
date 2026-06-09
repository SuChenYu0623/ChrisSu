import type { ToolEntry } from '../types';

export const tools: ToolEntry[] = [
  {
    slug: 'duplication-check',
    label: '檢查重複元素',
    description: '從 JSON 陣列裡找出重複/不重複的元素，可指定 key 比對。',
  },
  {
    slug: 'cookie-diff',
    label: '檢查 cookie 差異',
    description: '比對兩組 cookie 字串、找出新增、消失、修改的項目。',
  },
];

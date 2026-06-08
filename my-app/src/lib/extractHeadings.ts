import GithubSlugger from 'github-slugger';

export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/**
 * 從 markdown 字串裡抽取 ## 與 ### 標題，回傳含 slug id 的清單。
 * 必須與 Markdown render 用同一個 slugger instance，所以 caller 傳進來。
 */
export function extractHeadings(md: string, slugger: GithubSlugger): Heading[] {
  const lines = md.split('\n');
  const headings: Heading[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const m2 = /^##\s+(.+?)\s*$/.exec(line);
    const m3 = /^###\s+(.+?)\s*$/.exec(line);
    if (m2) {
      headings.push({ id: slugger.slug(m2[1]), text: m2[1], level: 2 });
    } else if (m3) {
      headings.push({ id: slugger.slug(m3[1]), text: m3[1], level: 3 });
    }
  }
  return headings;
}

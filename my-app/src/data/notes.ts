import type { NoteCategory } from '../types';

export const noteCategories: NoteCategory[] = [
  {
    key: 'cheatsheet',
    label: 'Cheatsheet',
    notes: [
      { slug: 'python-commands', title: 'Python 常用指令' },
      { slug: 'javascript-commands', title: 'JavaScript 常用指令' },
      { slug: 'pandas-numpy', title: 'Pandas & Numpy' },
      { slug: 'mssql-cheatsheet', title: 'MSSQL 速查', sidebarLabel: 'MSSQL' },
      { slug: 'postgres-cheatsheet', title: 'PostgreSQL 速查', sidebarLabel: 'PostgreSQL' },
      { slug: 'elasticsearch-cheatsheet', title: 'Elasticsearch 速查', sidebarLabel: 'Elasticsearch' },
      {
        slug: 'docker-cheatsheet',
        title: 'Docker / docker-compose',
        sidebarLabel: 'Docker',
      },
      { slug: 'gcloud-cheatsheet', title: 'gcloud / gsutil' },
      { slug: 'redis-cheatsheet', title: 'Redis 指令' },
      { slug: 'git-cheatsheet', title: 'Git 速查' },
    ],
  },
  {
    key: 'crawling',
    label: 'Crawling',
    notes: [
      {
        slug: 'crawler-architecture',
        title: '爬蟲系統架構：排程 → 抓取 → 資料流',
        sidebarLabel: '爬蟲系統架構',
      },
      {
        slug: 'python-tool-choice',
        title: 'Python 爬蟲工具選擇：requests / httpx / curl-cffi',
        sidebarLabel: 'Python 爬蟲工具',
      },
      { slug: 'scrapy-notes', title: 'Scrapy 實戰心得' },
      { slug: 'playwright-anti-bot', title: 'Playwright 反偵測技巧' },
      { slug: 'js-f12-inline', title: 'JS F12 inline 爬蟲技巧' },
      {
        slug: 'reverse-engineering',
        title: '逆向解密：常見加密類型與破解流程',
        sidebarLabel: '逆向解密',
      },
      {
        slug: 'rabbitmq-in-crawler',
        title: 'RabbitMQ 在爬蟲流程的角色',
        sidebarLabel: 'RabbitMQ（爬蟲）',
      },
    ],
  },
  {
    key: 'backend',
    label: 'Backend & System Design',
    notes: [
      { slug: 'fastapi-basics', title: 'FastAPI 基礎與心得' },
      {
        slug: 'rabbitmq-patterns',
        title: 'RabbitMQ：交換器 / queue / ack 策略',
        sidebarLabel: 'RabbitMQ',
      },
      {
        slug: 'redis-patterns',
        title: 'Redis：cache / rate limit / 分散式鎖',
        sidebarLabel: 'Redis',
      },
      {
        slug: 'postgres-vs-es',
        title: 'Postgres vs Elasticsearch：什麼用什麼',
        sidebarLabel: 'Postgres vs ES',
      },
      { slug: 'compose-multi-service', title: 'Docker compose 多服務組合' },
    ],
  },
  {
    key: 'frontend',
    label: 'Frontend',
    notes: [
      { slug: 'react-hook', title: 'React HOOK 整理' },
      { slug: 'nextjs-app-router', title: 'Next.js App Router 心得' },
      { slug: 'chrome-extension', title: 'Chrome Extension 開發筆記' },
    ],
  },
  {
    key: 'devops',
    label: 'DevOps & Cloud',
    notes: [
      {
        slug: 'docker-zero-to-deploy',
        title: 'Docker / docker-compose 從零到部署',
        sidebarLabel: 'Docker 部署實戰',
      },
      { slug: 'cloud-run', title: 'GCP Cloud Run 實戰', sidebarLabel: 'Cloud Run' },
      { slug: 'gcs-patterns', title: 'GCS 檔案管理模式', sidebarLabel: 'GCS' },
      {
        slug: 'gemini-vertex',
        title: 'Gemini / Vertex AI API 整合',
        sidebarLabel: 'Gemini / Vertex AI',
      },
    ],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    notes: [
      {
        slug: 'spec-driven-dev',
        title: 'Spec-driven dev with Claude：完整流程',
        sidebarLabel: 'Spec-driven dev',
      },
      {
        slug: 'code-review-prompt',
        title: 'Code review prompt 模板',
        sidebarLabel: 'Code review prompt',
      },
      { slug: 'ai-antipatterns', title: '跟 AI 協作的反模式', sidebarLabel: 'AI 反模式' },
      {
        slug: 'plan-maintenance',
        title: 'Plan / spec 文件的長期維護',
        sidebarLabel: 'Plan 維護',
      },
    ],
  },
];

import type { Profile, Project } from '../types';
import BG_IMG from '../images/BG.jpg';

export const profile: Profile = {
  cnName: '蘇禎佑',
  enName: 'Chris Su',
  tagline: 'Crawler Engineer & Full Stack',
  description:
    '寫爬蟲、做前端、也碰後端與 DevOps。能獨立搭建一套爬蟲系統，從排程、爬取、資料流到部署一手包辦。目前在大數據股份有限公司，最近一年逐步把工作流程轉換成用 spec 規劃 + Claude 寫程式，自己更多時間放在架構與流程優化上。',
  birthday: '1999/06/23',
  school: 'National Kaohsiung University of Science and Technology (EE)',
  company: '大數據股份有限公司',
  programLanguages: ['JavaScript', 'Python', 'C', 'Solidity'],
  skillGroups: [
    {
      label: 'Languages',
      items: ['Python', 'JavaScript', 'C', 'Solidity'],
    },
    {
      label: 'Frontend',
      items: ['React', 'Next.js', 'Chrome Extension'],
    },
    {
      label: 'Backend',
      items: ['FastAPI'],
    },
    {
      label: 'Database',
      items: ['MSSQL', 'PostgreSQL', 'Elasticsearch'],
    },
    {
      label: 'Queue & Cache',
      items: ['RabbitMQ', 'Redis'],
    },
    {
      label: 'Crawling',
      items: [
        'JS（F12 inline）',
        'requests / httpx / curl-cffi',
        'Scrapy',
        'Playwright',
        '逆向解密',
      ],
    },
    {
      label: 'DevOps',
      items: ['Docker', 'Docker Compose', 'GCP Cloud Run', 'GCS', 'Gemini', 'Vertex AI'],
    },
    {
      label: 'Workflow',
      items: ['Spec-driven development with Claude (superpowers)'],
    },
  ],
  avatarSrc: BG_IMG,
  githubUrl: 'https://github.com/SuChenYu0623',
};

export const projects: Project[] = [
  {
    title: 'SocialMedia',
    description: '社群媒體前端 demo，含貼文、留言、追蹤功能。',
    tags: ['React', 'Web'],
    githubUrl: 'https://github.com/SuChenYu0623/SocialMedia',
    liveUrl: 'https://suchenyu0623.github.io/SocialMedia/',
  },
  {
    title: 'Game',
    description: '一個瀏覽器小遊戲。',
    tags: ['React', 'Web'],
    githubUrl: 'https://github.com/SuChenYu0623/Game',
    liveUrl: 'https://suchenyu0623.github.io/Game/',
  },
  {
    title: 'RandomSelectMealApp',
    description: '隨機選擇午餐的 React Native App。',
    tags: ['React Native', 'App'],
    githubUrl: 'https://github.com/SuChenYu0623/RandomSelectMealApp',
  },
  {
    title: 'ReactNative_game_app',
    description: 'React Native 寫的小遊戲。',
    tags: ['React Native', 'App'],
    githubUrl: 'https://github.com/SuChenYu0623/ReactNative_game_app',
  },
  {
    title: 'CrawlerData',
    description: '網路爬蟲腳本集合，含多種網站的資料擷取範例。',
    tags: ['JavaScript', 'Crawler'],
    githubUrl: 'https://github.com/SuChenYu0623/CrawlerData',
  },
];

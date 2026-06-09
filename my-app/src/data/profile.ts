import type { Profile, Project } from '../types';
import BG_IMG from '../images/BG.jpg';

export const profile: Profile = {
  cnName: '蘇禎佑',
  enName: 'Chris Su',
  tagline: 'Crawler Engineer & Front End',
  description:
    '我寫爬蟲、做 React、玩智能合約。目前在 BigGo 樂方股份有限公司，興趣是把資料變成有用的工具。',
  birthday: '1999/06/23',
  school: 'National Kaohsiung University of Science and Technology (EE)',
  company: 'BigGo 樂方股份有限公司',
  programLanguages: ['JavaScript', 'Python', 'C', 'Solidity'],
  skills: ['React', 'Extension', 'JS 爬蟲', '智能合約', 'AI'],
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

import type { Profile, ExperienceSectionData } from '../types';
import BG_IMG from '../images/BG.png';
import BG_CODE1 from '../images/BG-code1.jpg';
import BG_CODE2 from '../images/BG-code2.jpg';
import reactImg from '../images/react.png';
import crawlerImg from '../images/web-crawler.png';

export const profile: Profile = {
  cnName: '蘇禎佑',
  enName: 'chris',
  birthday: '1999/06/23',
  school: 'National Kaohsiung University of Science and Technology EE',
  company: 'BigGo 樂方股份有限公司',
  programLanguages: 'JavaScript, Python, C, solidity',
  experience: ['React', 'Extension', 'JS爬蟲', '智能合約', 'AI'],
};

export const profileBackground = BG_IMG;

export const experienceSections: ExperienceSectionData[] = [
  {
    id: 'React',
    title: 'React Project',
    bgImage: BG_CODE1,
    avatarImage: reactImg,
    groups: [
      {
        subtitle: 'WEB',
        projects: [
          {
            title: 'SocialMedia',
            githubLink: 'https://github.com/SuChenYu0623/SocialMedia',
            liveLink: 'https://suchenyu0623.github.io/SocialMedia/',
          },
          {
            title: 'Game',
            githubLink: 'https://github.com/SuChenYu0623/Game',
            liveLink: 'https://suchenyu0623.github.io/Game/',
          },
        ],
      },
      {
        subtitle: 'APP',
        projects: [
          {
            title: 'RandomSelectMealApp',
            githubLink: 'https://github.com/SuChenYu0623/RandomSelectMealApp',
          },
          {
            title: 'ReactNative_game_app',
            githubLink: 'https://github.com/SuChenYu0623/ReactNative_game_app',
          },
        ],
      },
    ],
  },
  {
    id: 'JS爬蟲',
    title: 'JS 爬蟲',
    bgImage: BG_CODE2,
    avatarImage: crawlerImg,
    groups: [
      {
        subtitle: 'GITHUB',
        projects: [
          {
            title: 'CrawlerData',
            githubLink: 'https://github.com/SuChenYu0623/CrawlerData',
          },
        ],
      },
    ],
  },
];

import type { Album } from '../types';
import photo1 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-1.jpg';
import photo2 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-2.jpg';
import photo3 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-3.jpg';
import photo4 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-4.jpg';
import photo5 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-5.jpg';
import photo6 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-6.jpg';

export const albums: Album[] = [
  {
    id: 'orange-cat-daily-1',
    title: '胖橘日常 1',
    description: '橘子在家的紀錄',
    date: '2024-03',
    photos: [
      { src: photo1, alt: '橘子翻肚', width: 1477, height: 1108 },
      { src: photo2, alt: '橘子蜷成一團', width: 1600, height: 1200 },
      { src: photo3, alt: '橘子看電視', width: 1108, height: 1477 },
      { src: photo4, alt: '橘子日常 4', width: 1477, height: 1108 },
      { src: photo5, alt: '橘子日常 5', width: 1108, height: 1477 },
      { src: photo6, alt: '橘子日常 6', width: 1706, height: 960 },
    ],
  },
];

export const findAlbumById = (id: string): Album | undefined =>
  albums.find((album) => album.id === id);

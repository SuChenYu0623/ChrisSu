import type { Album } from '../types';
import orangeCat1Photo1 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-1.jpg';
import orangeCat1Photo2 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-2.jpg';
import orangeCat1Photo3 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-3.jpg';
import orangeCat1Photo4 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-4.jpg';
import orangeCat1Photo5 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-5.jpg';
import orangeCat1Photo6 from '../pages/PhotoPage/photoImages/orange-cat-daily-1/photo-6.jpg';

const placeholderImages = [
  'https://png.pngtree.com/png-vector/20230928/ourmid/pngtree-cute-cat-animal-png-image_10149335.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-sitting-orange-cat-on-white-background-png-image_7094889.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-cat-isolated-on-white-background-png-image_7094972.png',
];

const buildPlaceholders = () => [...placeholderImages, ...placeholderImages, ...placeholderImages];

export const albums: Album[] = [
  {
    id: 'album-1',
    title: '胖橘日常 1',
    images: [
      orangeCat1Photo1,
      orangeCat1Photo2,
      orangeCat1Photo3,
      orangeCat1Photo4,
      orangeCat1Photo5,
      orangeCat1Photo6,
    ],
  },
  { id: 'album-2', title: '相簿 2', images: buildPlaceholders() },
  { id: 'album-3', title: '相簿 3', images: buildPlaceholders() },
  { id: 'album-4', title: '相簿 4', images: buildPlaceholders() },
  { id: 'album-5', title: '相簿 5', images: buildPlaceholders() },
  { id: 'album-6', title: '相簿 6', images: buildPlaceholders() },
];

export const findAlbumById = (id: string): Album | undefined =>
  albums.find((album) => album.id === id);

import { MenuItem } from '@/types/data';

const menuBouffeImage = require('@/assets/images/menu_bouffe.jpg');
const menuBarImage = require('@/assets/images/boissons.png');

export const fallbackMenuItems: MenuItem[] = [
  {
    id: 1,
    title: 'Menu Bouffe',
    icon: 'pizza-outline',
    image: menuBouffeImage,
  },
  {
    id: 2,
    title: 'Menu Bar',
    icon: 'beer-outline',
    image: menuBarImage,
  },
];

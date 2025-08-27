import type { Product } from './types';

export const products: Product[] = [
  {
    id: 'articogolf-1-standard',
    name: 'Articogolf 1 (Standard)',
    description: 'The reliable choice for every golfer.',
    basePrice: 449000,
    imageUrl: 'https://picsum.photos/600/400?random=1',
    customizable: true,
  },
  {
    id: 'articogolf-1-polos',
    name: 'Articogolf 1 Polos',
    description: 'Classic design, pure performance.',
    basePrice: 379000,
    imageUrl: 'https://picsum.photos/600/400?random=2',
    customizable: true,
  },
  {
    id: 'articogolf-2-color-matte',
    name: 'Articogolf 2 Color Matte',
    description: 'Vibrant colors with a non-glare finish.',
    basePrice: 529000,
    imageUrl: 'https://picsum.photos/600/400?random=3',
    customizable: true,
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Pink', hex: '#FFC0CB' },
      { name: 'Green', hex: '#90EE90' },
      { name: 'Yellow', hex: '#FFFFE0' },
      { name: 'Orange', hex: '#FFA500' },
    ],
  },
  {
    id: 'articogolf-3-pro-urethane',
    name: 'Articogolf 3 Pro Urethane',
    description: 'For the professional seeking maximum control.',
    basePrice: 749000,
    imageUrl: 'https://picsum.photos/600/400?random=4',
    customizable: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

import type { Product } from './types';

export const products: Product[] = [
  {
    id: 'ag-1-standard',
    name: 'AG-1 (Standard)',
    description: 'The reliable choice for every golfer.',
    basePrice: 29.99,
    imageUrl: 'https://picsum.photos/600/400?random=1',
  },
  {
    id: 'ag-1-polos',
    name: 'AG-1 Polos',
    description: 'Classic design, pure performance.',
    basePrice: 24.99,
    imageUrl: 'https://picsum.photos/600/400?random=2',
  },
  {
    id: 'ag-2-color-matte',
    name: 'AG-2 Color Matte',
    description: 'Vibrant colors with a non-glare finish.',
    basePrice: 34.99,
    imageUrl: 'https://picsum.photos/600/400?random=3',
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Matte Red', hex: '#E53E3E' },
      { name: 'Matte Blue', hex: '#3182CE' },
      { name: 'Matte Green', hex: '#38A169' },
      { name: 'Matte Yellow', hex: '#D69E2E' },
    ],
  },
  {
    id: 'ag-3-pro-urethane',
    name: 'AG-3 Pro Urethane Cover',
    description: 'For the professional seeking maximum control.',
    basePrice: 49.99,
    imageUrl: 'https://picsum.photos/600/400?random=4',
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

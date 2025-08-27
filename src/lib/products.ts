import type { Product } from './types';

export const products: Product[] = [
  {
    id: 'articogolf-1-standard',
    name: 'AG-1 Standard',
    description: 'Performa total untuk setiap pemain, dengan alignment assist.',
    basePrice: 175000,
    imageUrl: 'https://picsum.photos/600/400?random=1',
    gallery: [
        'https://picsum.photos/600/400?random=1',
        'https://picsum.photos/600/400?random=5',
        'https://picsum.photos/600/400?random=6'
    ],
    customizable: true,
  },
  {
    id: 'articogolf-1-polos',
    name: 'AG-1 Polos',
    description: 'Desain klasik dan bersih untuk nuansa tradisional.',
    basePrice: 200000,
    imageUrl: 'https://picsum.photos/600/400?random=2',
    gallery: [
        'https://picsum.photos/600/400?random=2',
        'https://picsum.photos/600/400?random=7',
        'https://picsum.photos/600/400?random=8'
    ],
    customizable: true,
  },
  {
    id: 'articogolf-2-color-matte',
    name: 'AG-2 Color Matte',
    description: 'Warna cerah dengan hasil akhir matte untuk visibilitas tinggi.',
    basePrice: 200000,
    imageUrl: 'https://picsum.photos/600/400?random=3',
    gallery: [
        'https://picsum.photos/600/400?random=3',
        'https://picsum.photos/600/400?random=9',
        'https://picsum.photos/600/400?random=10'
    ],
    customizable: true,
    colors: [
      { name: 'Mix Color', hex: '#FFFFFF' },
      { name: 'Pink', hex: '#FFC0CB' },
      { name: 'Green', hex: '#90EE90' },
      { name: 'Yellow', hex: '#FFFFE0' },
      { name: 'Orange', hex: '#FFA500' },
    ],
  },
  {
    id: 'articogolf-3-pro-urethane',
    name: 'AG-3 Pro Urethane',
    description: 'Spin dan kontrol tingkat tour dengan cover urethane.',
    basePrice: 300000,
    imageUrl: 'https://picsum.photos/600/400?random=4',
    gallery: [
        'https://picsum.photos/600/400?random=4',
        'https://picsum.photos/600/400?random=11',
        'https://picsum.photos/600/400?random=12'
    ],
    customizable: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

import type { Product } from './types';

export const products: Product[] = [
  {
    id: 'articogolf-1-standard',
    name: 'AG-1 Standard',
    description: 'Performa total untuk setiap pemain, dengan alignment assist.',
    basePrice: 175000,
    imageUrl: '/images/ag-1-standard-1.jpg',
    gallery: [
        '/images/ag-1-standard-1.jpg',
        '/images/ag-1-standard-2.jpg',
        '/images/ag-1-standard-3.jpg'
    ],
    customizable: true,
  },
  {
    id: 'articogolf-1-polos',
    name: 'AG-1 Polos',
    description: 'Desain klasik dan bersih untuk nuansa tradisional.',
    basePrice: 200000,
    imageUrl: '/images/ag-1-polos-1.jpg',
    gallery: [
        '/images/ag-1-polos-1.jpg',
        '/images/ag-1-polos-2.jpg',
        '/images/ag-1-polos-3.jpg'
    ],
    customizable: true,
  },
  {
    id: 'articogolf-2-color-matte',
    name: 'AG-2 Color Matte',
    description: 'Warna cerah dengan hasil akhir matte untuk visibilitas tinggi.',
    basePrice: 200000,
    imageUrl: '/images/ag-2-matte-1.jpg',
    gallery: [
        '/images/ag-2-matte-1.jpg',
        '/images/ag-2-matte-2.jpg',
        '/images/ag-2-matte-3.jpg'
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
    imageUrl: '/images/ag-3-pro-1.jpg',
    gallery: [
        '/images/ag-3-pro-1.jpg',
        '/images/ag-3-pro-2.jpg',
        '/images/ag-3-pro-3.jpg'
    ],
    customizable: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

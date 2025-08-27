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
  {
    id: 'articogolf-floater',
    name: 'Articogolf Floater',
    description: 'Bola golf inovatif yang dapat mengapung di air. Sempurna untuk latihan di dekat danau atau rintangan air. Kustomisasi tersedia.',
    basePrice: 250000,
    imageUrl: 'https://picsum.photos/400/400?random=20',
    gallery: [
        'https://picsum.photos/400/400?random=21',
        'https://picsum.photos/400/400?random=22',
        'https://picsum.photos/400/400?random=23'
    ],
    customizable: true,
    isFloater: true, // Custom flag to identify this product
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

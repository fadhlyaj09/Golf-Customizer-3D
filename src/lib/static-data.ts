import type { Product } from './types';

// Static fallback function
export function getDefaultProducts(): Product[] {
    return [
        {
            id: 'ag-1-standard',
            name: 'AG-1 Standard',
            description: 'Performa total untuk setiap pemain, dengan alignment assist.',
            basePrice: 175000,
            imageUrl: 'https://picsum.photos/400/400?random=1',
             gallery: [
                'https://picsum.photos/400/400?random=2',
                'https://picsum.photos/400/400?random=3',
                'https://picsum.photos/400/400?random=4'
            ],
            customizable: true,
            colors: [
                { name: 'White', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=1' }
            ],
        },
        {
            id: 'ag-1-polos',
            name: 'AG-1 Polos',
            description: 'Desain klasik dan bersih untuk nuansa tradisional.',
            basePrice: 200000,
            imageUrl: 'https://picsum.photos/400/400?random=5',
             gallery: [
                'https://picsum.photos/400/400?random=6',
                'https://picsum.photos/400/400?random=7',
                'https://picsum.photos/400/400?random=8'
            ],
            customizable: true,
            colors: [
                { name: 'White', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=5' }
            ],
        },
        {
            id: 'ag-2-color-matte',
            name: 'AG-2 Color Matte',
            description: 'Warna cerah dengan hasil akhir matte untuk visibilitas tinggi.',
            basePrice: 200000,
            imageUrl: 'https://picsum.photos/400/400?random=9',
             gallery: [
                'https://picsum.photos/400/400?random=10',
                'https://picsum.photos/400/400?random=11',
                'https://picsum.photos/400/400?random=12'
            ],
            customizable: true,
            colors: [
              { name: 'Mix Color', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=9' },
              { name: 'Pink', hex: '#FFC0CB', imageUrl: 'https://picsum.photos/400/400?random=25' },
              { name: 'Green', hex: '#90EE90', imageUrl: 'https://picsum.photos/400/400?random=26' },
              { name: 'Yellow', hex: '#FFFFE0', imageUrl: 'https://picsum.photos/400/400?random=27' },
              { name: 'Orange', hex: '#FFA500', imageUrl: 'https://picsum.photos/400/400?random=28' },
            ],
        },
        {
            id: 'ag-3-pro-urethane',
            name: 'AG-3 Pro Urethane',
            description: 'Spin dan kontrol tingkat tour dengan cover urethane.',
            basePrice: 300000,
            imageUrl: 'https://picsum.photos/400/400?random=13',
            gallery: [
                'https://picsum.photos/400/400?random=14',
                'https://picsum.photos/400/400?random=15',
                'https://picsum.photos/400/400?random=16'
            ],
            customizable: true,
            colors: [
                { name: 'White', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=13' }
            ],
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
            isFloater: true,
            colors: [
                { name: 'White', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=20' }
            ],
        }
    ];
}

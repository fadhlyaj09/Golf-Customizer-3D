
import type { Product } from './types';

// Static fallback function
export function getDefaultProducts(): Product[] {
    return [
        {
            id: 'ag-1-standard',
            name: 'AG-1 Standard',
            description: 'Performa total untuk setiap pemain, dengan alignment assist.',
            basePrice: 175000,
            imageUrl: 'https://picsum.photos/400/400?random=101',
             gallery: [
                'https://picsum.photos/400/400?random=102',
                'https://picsum.photos/400/400?random=103',
                'https://picsum.photos/400/400?random=104'
            ],
            customizable: true,
            colors: [
                { name: 'White', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=101' }
            ],
        },
        {
            id: 'ag-1-polos',
            name: 'AG-1 Polos',
            description: 'Desain klasik dan bersih untuk nuansa tradisional.',
            basePrice: 200000,
            imageUrl: 'https://picsum.photos/400/400?random=105',
             gallery: [
                'https://picsum.photos/400/400?random=106',
                'https://picsum.photos/400/400?random=107',
                'https://picsum.photos/400/400?random=108'
            ],
            customizable: true,
            colors: [
                { name: 'White', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=105' }
            ],
        },
        {
            id: 'ag-2-color-matte',
            name: 'AG-2 Color Matte',
            description: 'Warna cerah dengan hasil akhir matte untuk visibilitas tinggi.',
            basePrice: 200000,
            imageUrl: 'https://picsum.photos/400/400?random=109',
             gallery: [
                'https://picsum.photos/400/400?random=110',
                'https://picsum.photos/400/400?random=111',
                'https://picsum.photos/400/400?random=112'
            ],
            customizable: true,
            colors: [
              { name: 'Mix Color', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=109' },
              { name: 'Pink', hex: '#FFC0CB', imageUrl: 'https://picsum.photos/400/400?random=125' },
              { name: 'Green', hex: '#90EE90', imageUrl: 'https://picsum.photos/400/400?random=126' },
              { name: 'Yellow', hex: '#FFFFE0', imageUrl: 'https://picsum.photos/400/400?random=127' },
              { name: 'Orange', hex: '#FFA500', imageUrl: 'https://picsum.photos/400/400?random=128' },
            ],
        },
        {
            id: 'ag-3-pro-urethane',
            name: 'AG-3 Pro Urethane',
            description: 'Spin dan kontrol tingkat tour dengan cover urethane.',
            basePrice: 300000,
            imageUrl: 'https://picsum.photos/400/400?random=113',
            gallery: [
                'https://picsum.photos/400/400?random=114',
                'https://picsum.photos/400/400?random=115',
                'https://picsum.photos/400/400?random=116'
            ],
            customizable: true,
            colors: [
                { name: 'White', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=113' }
            ],
        },
        {
            id: 'articogolf-floater',
            name: 'Articogolf Floater',
            description: 'Bola golf inovatif yang dapat mengapung di air. Sempurna untuk latihan di dekat danau atau rintangan air. Kustomisasi tersedia.',
            basePrice: 250000,
            imageUrl: 'https://picsum.photos/400/400?random=120',
             gallery: [
                'https://picsum.photos/400/400?random=121',
                'https://picsum.photos/400/400?random=122',
                'https://picsum.photos/400/400?random=123'
            ],
            customizable: true,
            isFloater: true,
            colors: [
                { name: 'White', hex: '#FFFFFF', imageUrl: 'https://picsum.photos/400/400?random=120' }
            ],
        }
    ];
}

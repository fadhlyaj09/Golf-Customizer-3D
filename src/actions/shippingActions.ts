'use server';

import type { City, Province, ShippingCost, GetShippingCostInput } from '@/lib/types';

// Mock data, as we don't have a real API
const provinces: Province[] = [
    { province_id: '1', province: 'Bali' },
    { province_id: '9', province: 'Jawa Barat' },
    { province_id: '10', province: 'Jawa Tengah' },
    { province_id: '11', province: 'Jawa Timur' },
    { province_id: '5', province: 'DI Yogyakarta' },
    { province_id: '6', province: 'DKI Jakarta' },
];

const cities: { [key: string]: City[] } = {
    '1': [ { city_id: '114', city_name: 'Denpasar' }, { city_id: '17', city_name: 'Badung' } ],
    '9': [ { city_id: '22', city_name: 'Bandung' }, { city_id: '78', city_name: 'Bekasi' }, { city_id: '115', city_name: 'Depok' } ],
    '10': [ { city_id: '444', city_name: 'Semarang' }, { city_id: '457', city_name: 'Surakarta (Solo)' } ],
    '11': [ { city_id: '458', city_name: 'Surabaya' }, { city_id: '255', city_name: 'Malang' } ],
    '5': [ { city_id: '573', city_name: 'Yogyakarta' } ],
    '6': [ { city_id: '151', city_name: 'Jakarta Barat' }, { city_id: '152', city_name: 'Jakarta Pusat' }, { city_id: '153', city_name: 'Jakarta Selatan' }, { city_id: '154', city_name: 'Jakarta Timur' }, { city_id: '155', city_name: 'Jakarta Utara' } ],
};

export async function getProvinces(): Promise<Province[]> {
    return provinces;
}

export async function getCities(provinceId: string): Promise<City[]> {
    return cities[provinceId] || [];
}

export async function getShippingCost(input: GetShippingCostInput): Promise<any> {
    // Return a fixed shipping cost as a placeholder, maybe slightly different based on input
    const baseCost = 20000 + (parseInt(input.destination, 10) % 10) * 1000;
    return [{
        code: 'jne',
        name: 'Jalur Nugraha Ekakurir (JNE)',
        costs: [
            {
                service: 'REG',
                description: 'Layanan Reguler',
                cost: [{ value: baseCost, etd: '2-3', note: '' }]
            },
            {
                service: 'YES',
                description: 'Yakin Esok Sampai',
                cost: [{ value: baseCost * 2, etd: '1-1', note: '' }]
            }
        ]
    }];
}

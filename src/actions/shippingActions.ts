'use server';

import type { City, Province, ShippingCost, GetShippingCostInput } from '@/lib/types';

// This is a mock implementation of a shipping API.
// In a real application, you would call a service like RajaOngkir, etc.
// The origin city is set in the .env file.

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
    // In a real app, this would fetch from an API
    return provinces;
}

export async function getCities(provinceId: string): Promise<City[]> {
    // In a real app, this would fetch from an API
    return cities[provinceId] || [];
}

export async function getShippingCost(input: GetShippingCostInput): Promise<any> {
    const { destination, weight, courier } = input;
    const origin = process.env.NEXT_PUBLIC_SHIPPING_ORIGIN_CITY_ID || '22'; // Default to Bandung

    if (!destination || !weight || !courier) {
        return [];
    }

    // This is a mock API call.
    // We'll return some static data that mimics the real API response structure.
    console.log(`Calculating shipping from ${origin} to ${destination} for ${weight}g using ${courier}`);

    // Generate a semi-random cost based on destination ID and weight
    const baseCost = 10000 + (parseInt(destination, 10) % 100) * 100;
    const weightInKg = Math.ceil(weight / 1000);
    const finalCost = baseCost * weightInKg;

    // Simulate different services from JNE
    const shippingOptions = {
        code: 'jne',
        name: 'Jalur Nugraha Ekakurir (JNE)',
        costs: [
            {
                service: 'REG',
                description: 'Layanan Reguler',
                cost: [{ value: finalCost, etd: '2-3', note: '' }]
            },
            {
                service: 'YES',
                description: 'Yakin Esok Sampai',
                cost: [{ value: finalCost * 1.5, etd: '1-1', note: '' }]
            },
            {
                service: 'OKE',
                description: 'Ongkos Kirim Ekonomis',
                cost: [{ value: finalCost * 0.8, etd: '3-5', note: '' }]
            }
        ]
    };

    // Return the response inside an array, as the original structure expected it.
    return [shippingOptions];
}

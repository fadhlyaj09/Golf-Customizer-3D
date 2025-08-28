'use server';

import type { City, Province, ShippingCost, GetShippingCostInput } from '@/lib/types';

export async function getProvinces(): Promise<Province[]> {
    console.warn("getProvinces is disabled.");
    return [];
}

export async function getCities(provinceId: string): Promise<City[]> {
    console.warn("getCities is disabled.");
    return [];
}

export async function getShippingCost(input: GetShippingCostInput): Promise<any> {
    console.warn("getShippingCost is disabled.");
    // Return a fixed shipping cost as a placeholder
    return [{
        code: 'jne',
        name: 'Jalur Nugraha Ekakurir (JNE)',
        costs: [
            {
                service: 'REG',
                description: 'Layanan Reguler',
                cost: [{ value: 20000, etd: '2-3', note: '' }]
            }
        ]
    }];
}

    
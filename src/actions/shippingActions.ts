'use server';

import { getProvincesFlow, getCitiesFlow, getShippingCostFlow, GetShippingCostInput, City, Province, ShippingCost } from '@/ai/flows/shipping-flow';

export async function getProvinces(): Promise<Province[]> {
    return await getProvincesFlow();
}

export async function getCities(provinceId: string): Promise<City[]> {
    return await getCitiesFlow(provinceId);
}

export async function getShippingCost(input: GetShippingCostInput): Promise<any> {
    return await getShippingCostFlow(input);
}

export type { City, Province, ShippingCost };

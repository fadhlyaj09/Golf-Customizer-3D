'use server';
/**
 * @fileOverview A shipping calculation agent that interacts with the RajaOngkir API.
 * 
 * - getProvincesFlow - Fetches a list of provinces.
 * - getCitiesFlow - Fetches a list of cities for a given province.
 * - getShippingCostFlow - Calculates the shipping cost.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {defineTool} from 'genkit/tool';

// Schemas for RajaOngkir API responses
const ProvinceSchema = z.object({
    province_id: z.string(),
    province: z.string(),
});
export type Province = z.infer<typeof ProvinceSchema>;

const CitySchema = z.object({
    city_id: z.string(),
    province_id: z.string(),
    province: z.string(),
    type: z.string(),
    city_name: z.string(),
    postal_code: z.string(),
});
export type City = z.infer<typeof CitySchema>;

const ShippingCostSchema = z.object({
    service: z.string(),
    description: z.string(),
    cost: z.array(z.object({
        value: z.number(),
        etd: z.string(),
        note: z.string(),
    })),
});
export type ShippingCost = z.infer<typeof ShippingCostSchema>;


const GetShippingCostInputSchema = z.object({
    destination: z.string().describe('The destination city ID.'),
    weight: z.number().describe('The weight of the package in grams.'),
    courier: z.string().describe('The courier code (e.g., jne, pos, tiki).'),
});
export type GetShippingCostInput = z.infer<typeof GetShippingCostInputSchema>;

// Internal function to call RajaOngkir API
async function callRajaOngkir<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
    if (!RAJAONGKIR_API_KEY) {
        throw new Error("RAJAONGKIR_API_KEY is not set in .env file");
    }
    const response = await fetch(`https://api.rajaongkir.com/starter/${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'key': RAJAONGKIR_API_KEY,
        },
    });
    if (!response.ok) {
        throw new Error(`RajaOngkir API call failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.rajaongkir.results as T;
}

// Tools defined for AI
const getProvincesTool = ai.defineTool(
    {
        name: 'getProvinces',
        description: 'Get a list of all provinces in Indonesia.',
        outputSchema: z.array(ProvinceSchema),
    },
    async () => {
        return await callRajaOngkir<Province[]>('province');
    }
);

const getCitiesTool = ai.defineTool(
    {
        name: 'getCities',
        description: 'Get a list of cities for a specific province.',
        inputSchema: z.object({ provinceId: z.string().describe('The ID of the province.') }),
        outputSchema: z.array(CitySchema),
    },
    async ({ provinceId }) => {
        return await callRajaOngkir<City[]>(`city?province=${provinceId}`);
    }
);

const getShippingCostTool = ai.defineTool(
    {
        name: 'getShippingCost',
        description: 'Calculate the shipping cost.',
        inputSchema: GetShippingCostInputSchema,
        outputSchema: z.any(), // RajaOngkir returns a complex object
    },
    async (input) => {
         const body = new URLSearchParams();
         body.append('origin', '501'); // Origin city (Yogyakarta)
         body.append('destination', input.destination);
         body.append('weight', String(input.weight));
         body.append('courier', input.courier);

        return await callRajaOngkir<any>('cost', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: body,
        });
    }
);


// Flows that can be called from the application
export const getProvincesFlow = ai.defineFlow(
    { name: 'getProvincesFlow', outputSchema: z.array(ProvinceSchema) },
    async () => await getProvincesTool()
);

export const getCitiesFlow = ai.defineFlow(
    { name: 'getCitiesFlow', inputSchema: z.string(), outputSchema: z.array(CitySchema) },
    async (provinceId) => await getCitiesTool({ provinceId })
);

export const getShippingCostFlow = ai.defineFlow(
    { name: 'getShippingCostFlow', inputSchema: GetShippingCostInputSchema, outputSchema: z.any() },
    async (input) => await getShippingCostTool(input)
);

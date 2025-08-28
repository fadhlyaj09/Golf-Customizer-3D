
'use server';
/**
 * @fileOverview A Genkit flow for saving order data to Google Sheets.
 */

import { ai } from '@/ai/genkit';
import { google } from 'googleapis';
import { z } from 'zod';

const OrderDataSchema = z.any(); // Allow any JSON object for the order data

export const SaveOrderToSheetOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type SaveOrderToSheetOutput = z.infer<typeof SaveOrderToSheetOutputSchema>;


const saveOrderFlow = ai.defineFlow(
  {
    name: 'saveOrderToSheetFlow',
    inputSchema: OrderDataSchema,
    outputSchema: SaveOrderToSheetOutputSchema,
  },
  async (orderData) => {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!sheetId || !clientEmail || !privateKey) {
      const errorMsg = 'Google Sheets environment variables are not set.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // Create a flat array of values for the new row
      const values = [
        orderData.orderId || '',
        orderData.createdAt || new Date().toISOString(),
        orderData.customerDetails.name || '',
        orderData.customerDetails.phone || '',
        `${orderData.customerDetails.address}, ${orderData.customerDetails.city}, ${orderData.customerDetails.province}, ${orderData.customerDetails.zip}`,
        orderData.items.map((item: any) => `${item.product.name} (x${item.quantity})`).join(', '),
        orderData.summary.total || 0,
        orderData.shippingDetails.courier || '',
        orderData.shippingDetails.service || '',
        orderData.paymentDetails.status || '',
        orderData.orderStatus || '',
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A1', // Appends to the first empty row of the sheet
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });

      return { success: true };

    } catch (error: any) {
      console.error('Error saving to Google Sheets:', error);
      return { success: false, error: error.message || 'An unknown error occurred.' };
    }
  }
);


export async function saveOrderToSheet(orderData: any): Promise<SaveOrderToSheetOutput> {
  return saveOrderFlow(orderData);
}

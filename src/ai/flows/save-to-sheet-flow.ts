'use server';

/**
 * @fileOverview A flow to save user registration data to a Google Sheet.
 * 
 * - saveToSheetFlow - The main flow that takes user data and appends it to a sheet.
 * - UserRegistrationSheetSchema - The Zod schema for the user data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { google } from 'googleapis';

export const UserRegistrationSheetSchema = z.object({
  firstName: z.string().describe("The user's first name."),
  lastName: z.string().describe("The user's last name."),
  email: z.string().email().describe("The user's email address."),
  phone: z.string().describe("The user's phone number."),
});

type UserRegistrationSheet = z.infer<typeof UserRegistrationSheetSchema>;

export async function saveUserToSheet(input: UserRegistrationSheet): Promise<{ success: boolean; message: string }> {
  return await saveToSheetFlow(input);
}


const saveToSheetFlow = ai.defineFlow(
  {
    name: 'saveToSheetFlow',
    inputSchema: UserRegistrationSheetSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    const { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;

    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      const errorMessage = 'Google Sheets API credentials are not configured in the environment variables.';
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }
    
    // The private key from .env might have literal '\n' which need to be replaced with actual newlines.
    const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      
      const timestamp = new Date().toISOString();
      const values = [
        [input.firstName, input.lastName, input.email, input.phone, timestamp],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'A1', // Sheet will auto-detect the last row
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values,
        },
      });

      return { success: true, message: 'User data saved to sheet successfully.' };
    } catch (error) {
      console.error('Error writing to Google Sheet:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, message: `Failed to save to sheet: ${message}` };
    }
  }
);

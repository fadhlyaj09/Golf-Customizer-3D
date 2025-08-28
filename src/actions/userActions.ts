'use server';

import { saveUserToSheet, UserRegistrationSheetSchema } from "@/ai/flows/save-to-sheet-flow";
import { z } from "zod";

type UserData = z.infer<typeof UserRegistrationSheetSchema>;

export async function saveNewUser(userData: UserData) {
    try {
        const result = await saveUserToSheet(userData);
        if (!result.success) {
            // Log the error but don't block the user's registration process
            console.error("Failed to save user to sheet:", result.message);
        }
        return result;
    } catch (error) {
        console.error("Error calling saveUserToSheet action:", error);
        // Return a generic error to the client
        return { success: false, message: "An unexpected error occurred while saving user data." };
    }
}


'use server';

import { saveUserToSheet, UserRegistrationSheetSchema } from "@/ai/flows/save-to-sheet-flow";
import { z } from "zod";

type UserData = z.infer<typeof UserRegistrationSheetSchema>;

/**
 * Saves user data to a Google Sheet. This function is designed to be called asynchronously ("fire and forget").
 * It will not throw an error back to the client if the sheet-saving process fails,
 * instead, it logs the error on the server. This ensures that a failure in this secondary
 * process does not interrupt the primary user registration flow.
 */
export async function saveNewUser(userData: UserData) {
    try {
        const result = await saveUserToSheet(userData);
        if (!result.success) {
            // Log the error for server-side monitoring, but don't block the user's registration.
            console.error("Failed to save user to sheet:", result.message);
        } else {
            console.log("Successfully saved new user to Google Sheet.");
        }
    } catch (error) {
        // Catch any unexpected errors from the flow itself.
        console.error("An unexpected error occurred while trying to save user data to the sheet:", error);
    }
}

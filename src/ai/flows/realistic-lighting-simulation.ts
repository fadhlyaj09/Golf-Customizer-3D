'use server';
/**
 * @fileOverview A Genkit flow for creating a realistic lighting simulation on a product image.
 *
 * This flow takes an image of a product (like a golf ball) and uses an AI model
 * to generate a new image with simulated realistic lighting, such as studio lighting.
 *
 * - realisticLightingSimulation - The main flow function.
 * - RealisticLightingInput - The input type for the flow.
 * - RealisticLightingOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const RealisticLightingInputSchema = z.object({
  productImageUri: z
    .string()
    .describe(
      "A data URI of the product image. Must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z
    .string()
    .default(
      'Re-render this golf ball with realistic, bright, neutral studio lighting. Keep the original design and logos exactly as they are. Place it on a clean, light gray, slightly reflective studio surface. The output should be a photorealistic image.'
    )
    .describe('The prompt to guide the image generation.'),
});
export type RealisticLightingInput = z.infer<
  typeof RealisticLightingInputSchema
>;

export const RealisticLightingOutputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      'The data URI of the generated image with realistic lighting.'
    ),
});
export type RealisticLightingOutput = z.infer<
  typeof RealisticLightingOutputSchema
>;

const lightingFlow = ai.defineFlow(
  {
    name: 'realisticLightingSimulation',
    inputSchema: RealisticLightingInputSchema,
    outputSchema: RealisticLightingOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.productImageUri } },
        { text: input.prompt },
      ],
      config: {
        // Must provide both TEXT and IMAGE, otherwise it will fail.
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce an output.');
    }

    return { imageUri: media.url };
  }
);

export async function realisticLightingSimulation(
  input: RealisticLightingInput
): Promise<RealisticLightingOutput> {
  return lightingFlow(input);
}

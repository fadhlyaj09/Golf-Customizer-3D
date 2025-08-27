'use server';

/**
 * @fileOverview A flow to generate a realistic preview of a custom golf ball design under different lighting conditions and angles.
 *
 * - generateRealisticPreview - A function that generates a realistic preview of the custom golf ball design.
 * - GenerateRealisticPreviewInput - The input type for the generateRealisticPreview function.
 * - GenerateRealisticPreviewOutput - The return type for the generateRealisticPreview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRealisticPreviewInputSchema = z.object({
  ballDesignDataUri: z
    .string()
    .describe(
      "A data URI of the golf ball design, including custom prints and text. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  lightingCondition: z
    .string()
    .describe('The desired lighting condition for the preview (e.g., sunny, overcast, indoor).'),
  angle: z.string().describe('The viewing angle of the golf ball (e.g., top-down, side view).'),
});

export type GenerateRealisticPreviewInput = z.infer<typeof GenerateRealisticPreviewInputSchema>;

const GenerateRealisticPreviewOutputSchema = z.object({
  previewImageDataUri: z
    .string()
    .describe(
      'A data URI of the generated image previewing the golf ball under the specified lighting conditions and angle. Expected format: data:<mimetype>;base64,<encoded_data>'
    ),
});

export type GenerateRealisticPreviewOutput = z.infer<typeof GenerateRealisticPreviewOutputSchema>;

export async function generateRealisticPreview(
  input: GenerateRealisticPreviewInput
): Promise<GenerateRealisticPreviewOutput> {
  return generateRealisticPreviewFlow(input);
}

const generateRealisticPreviewFlow = ai.defineFlow(
  {
    name: 'generateRealisticPreviewFlow',
    inputSchema: GenerateRealisticPreviewInputSchema,
    outputSchema: GenerateRealisticPreviewOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A realistic image of a custom golf ball. The design is provided in the image. The lighting should be ${input.lightingCondition}, and the viewing angle is ${input.angle}.`,
      input: [
        {media: {url: input.ballDesignDataUri}},
      ]
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {previewImageDataUri: media.url};
  }
);

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
import wav from 'wav';

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

const prompt = ai.definePrompt({
  name: 'realisticPreviewPrompt',
  input: {schema: GenerateRealisticPreviewInputSchema},
  output: {schema: GenerateRealisticPreviewOutputSchema},
  prompt: `You are an expert in generating realistic images of custom golf ball designs.

  Based on the provided golf ball design, lighting condition, and angle, create a realistic image that showcases how the final product will look.

  Golf Ball Design: {{media url=ballDesignDataUri}}
  Lighting Condition: {{{lightingCondition}}}
  Angle: {{{angle}}}

  Ensure the generated image accurately reflects the custom prints, text, and chosen lighting condition and angle.
  Return the generated image as a data URI.
  `,
});

const generateRealisticPreviewFlow = ai.defineFlow(
  {
    name: 'generateRealisticPreviewFlow',
    inputSchema: GenerateRealisticPreviewInputSchema,
    outputSchema: GenerateRealisticPreviewOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: [
        {media: {url: input.ballDesignDataUri}},
        {
          text: `Generate a realistic image of the golf ball with ${input.lightingCondition} lighting and from a ${input.angle} angle.`,
        },
      ],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {previewImageDataUri: media.url};
  }
);

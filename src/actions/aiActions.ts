'use server';

import {
  generateRealisticPreview,
  GenerateRealisticPreviewInput,
  GenerateRealisticPreviewOutput,
} from '@/ai/flows/realistic-lighting-simulation';

export async function getRealisticPreview(
  input: GenerateRealisticPreviewInput
): Promise<GenerateRealisticPreviewOutput> {
  try {
    const result = await generateRealisticPreview(input);
    return result;
  } catch (error) {
    console.error('Error generating realistic preview:', error);
    // It's better to return a structured error response
    throw new Error('Failed to generate preview. The AI model might be unavailable.');
  }
}

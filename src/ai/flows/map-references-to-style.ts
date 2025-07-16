'use server';
/**
 * @fileOverview This file defines a Genkit flow for mapping references to a specified citation style.
 *
 * - mapReferencesToStyle - An async function that takes document text and a citation style, and returns the reformatted references.
 * - MapReferencesToStyleInput - The input type for the mapReferencesToStyle function.
 * - MapReferencesToStyleOutput - The output type for the mapReferencesToStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MapReferencesToStyleInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document containing the references.'),
  citationStyle: z.string().describe('The desired citation style (e.g., APA, MLA, Chicago).'),
});
export type MapReferencesToStyleInput = z.infer<typeof MapReferencesToStyleInputSchema>;

const MapReferencesToStyleOutputSchema = z.object({
  reformattedReferences: z
    .string()
    .describe('The reformatted references according to the specified citation style.'),
});
export type MapReferencesToStyleOutput = z.infer<typeof MapReferencesToStyleOutputSchema>;

export async function mapReferencesToStyle(
  input: MapReferencesToStyleInput
): Promise<MapReferencesToStyleOutput> {
  return mapReferencesToStyleFlow(input);
}

const mapReferencesToStylePrompt = ai.definePrompt({
  name: 'mapReferencesToStylePrompt',
  input: {schema: MapReferencesToStyleInputSchema},
  output: {schema: MapReferencesToStyleOutputSchema},
  prompt: `You are an expert in reformatting academic references according to various citation styles.

  Given the following document text and a desired citation style, reformat the references to match the specified style.

  Document Text: {{{documentText}}}
  Citation Style: {{{citationStyle}}}

  Reformatted References:`,
});

const mapReferencesToStyleFlow = ai.defineFlow(
  {
    name: 'mapReferencesToStyleFlow',
    inputSchema: MapReferencesToStyleInputSchema,
    outputSchema: MapReferencesToStyleOutputSchema,
  },
  async input => {
    const {output} = await mapReferencesToStylePrompt(input);
    return output!;
  }
);

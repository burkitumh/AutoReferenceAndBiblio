// 'use server';
/**
 * @fileOverview Reformats citations in a document according to a selected style.
 *
 * - reformatCitations - A function that reformats citations and bibliography.
 * - ReformatCitationsInput - The input type for the reformatCitations function.
 * - ReformatCitationsOutput - The return type for the reformatCitations function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReformatCitationsInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be reformatted.'),
  selectedCitationStyle: z
    .string()
    .describe('The citation style to be used for reformatting (e.g., APA, MLA, Chicago).'),
  detectedReferences: z.string().describe('Detected references in the document in Zotero/Mendeley format'),
});

export type ReformatCitationsInput = z.infer<typeof ReformatCitationsInputSchema>;

const ReformatCitationsOutputSchema = z.object({
  reformattedDocument: z
    .string()
    .describe('The document with reformatted in-text citations and bibliography.'),
});

export type ReformatCitationsOutput = z.infer<typeof ReformatCitationsOutputSchema>;

export async function reformatCitations(input: ReformatCitationsInput): Promise<ReformatCitationsOutput> {
  return reformatCitationsFlow(input);
}

const reformatCitationsPrompt = ai.definePrompt({
  name: 'reformatCitationsPrompt',
  input: {schema: ReformatCitationsInputSchema},
  output: {schema: ReformatCitationsOutputSchema},
  prompt: `You are an expert in academic writing and citation formatting.

  Your task is to reformat the in-text citations and bibliography of a given document according to a specified citation style.
  You need to understand the intricacies of various citation styles and apply them accurately to the document.
  Ensure that the reformatted document adheres to all the guidelines of the selected citation style, including the format of in-text citations, the order of information in bibliography entries, and the overall layout of the references section.
  In-text citations should also be added as proper citation fields that automatically update in Microsoft Word.

  Here is the document text:
  {{{documentText}}}

  Here is the selected citation style:
  {{{selectedCitationStyle}}}

  Here are the detected references in Zotero/Mendeley format:
  {{{detectedReferences}}}

  Please provide the reformatted document with correctly formatted in-text citations and bibliography.
  `,
});

const reformatCitationsFlow = ai.defineFlow(
  {
    name: 'reformatCitationsFlow',
    inputSchema: ReformatCitationsInputSchema,
    outputSchema: ReformatCitationsOutputSchema,
  },
  async input => {
    const {output} = await reformatCitationsPrompt(input);
    return output!;
  }
);

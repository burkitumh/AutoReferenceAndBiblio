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
  // If mock mode is enabled, return a mock response to allow UI testing without an API key.
  if (process.env.MOCK_AI === 'true') {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    const mockBibliography = `\n\nBibliography\n\n[1] Doe, J. (2024). A Mock Paper on Everything. Mock Journal of Testing, 1(1), 1-10. (Formatted in ${input.selectedCitationStyle} style).`
    return {
      reformattedDocument: `${input.documentText}${mockBibliography}`
    };
  }
  return reformatCitationsFlow(input);
}

const reformatCitationsPrompt = ai.definePrompt({
  name: 'reformatCitationsPrompt',
  input: {schema: ReformatCitationsInputSchema},
  output: {schema: ReformatCitationsOutputSchema},
  prompt: `You are an expert in academic writing and citation formatting.

Your task is to reformat a given document. You will receive the document text, a list of references, and a target citation style.

You must perform the following actions:
1.  Read the entire 'Document Text'.
2.  Identify the in-text citations within the 'Document Text'.
3.  Use the provided 'Detected References' to create a properly formatted bibliography at the end of the document according to the 'Selected Citation Style'.
4.  Replace the original in-text citations with new ones that are correctly formatted and correspond to the new bibliography.
5.  Return the *entire, complete document*, including the original text, with the updated in-text citations and the newly generated bibliography appended at the end. Ensure the bibliography is correctly ordered.

Here is the document text:
{{{documentText}}}

Here are the detected references in Zotero/Mendeley format. Use these to create the bibliography and format the in-text citations:
{{{detectedReferences}}}

Here is the selected citation style:
{{{selectedCitationStyle}}}

Please provide the full, reformatted document.
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

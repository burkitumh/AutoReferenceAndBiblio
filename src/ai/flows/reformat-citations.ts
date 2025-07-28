'use server';
/**
 * @fileOverview Reformats citations in a document according to a selected style.
 *
 * - reformatCitations - A function that reformats citations and bibliography.
 * - ReformatCitationsInput - The input type for the reformatCitations function.
 * - ReformatCitationsOutput - The return type for the reformatCitations function.
 */

import {genkit, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import { mockReformatCitations } from './mock-reformat-citations';

const ReformatCitationsInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be reformatted.'),
  selectedCitationStyle: z
    .string()
    .describe('The citation style to be used for reformatting (e.g., APA, MLA, Chicago).'),
  detectedReferences: z.string().describe('A list of references provided by the user, potentially from Zotero or Mendeley.'),
  apiKey: z.string().optional().describe('The Gemini API key.'),
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
  if (process.env.NEXT_PUBLIC_MOCK_AI === 'true') {
    return mockReformatCitations(input);
  }

  const {apiKey, ...promptData} = input;
  
  const ai = genkit({
    plugins: [googleAI({apiKey})],
    model: 'googleai/gemini-2.0-flash',
  });

  const reformatCitationsPrompt = ai.definePrompt({
    name: 'reformatCitationsPrompt',
    input: {schema: ReformatCitationsInputSchema.omit({apiKey: true})},
    output: {schema: ReformatCitationsOutputSchema},
    prompt: `You are an expert in academic writing and citation formatting. Your task is to reformat a given document by updating its in-text citations and generating a corresponding bibliography.

You will receive the full 'Document Text', a list of 'Detected References', and a 'Selected Citation Style'.

You must perform the following actions with precision:
1.  **Analyze the Document:** Read the entire 'Document Text' and identify all existing in-text citations (e.g., [1], (Author, Year)).
2.  **Generate Bibliography:** Use the provided 'Detected References' to create a new, properly formatted bibliography. The bibliography must be ordered correctly according to the rules of the 'Selected Citation Style' (e.g., alphabetically for APA, order of appearance for Vancouver).
3.  **Update In-Text Citations:** This is the most critical step. Replace the original in-text citations with new ones that are correctly formatted and numbered/ordered to match the new bibliography you just created. For example, if a source was cited as [3] but is now the first item in the bibliography, its in-text citation must be changed to [1].
4.  **Assemble Final Document:** Return the *entire, complete document*. This includes the original text but with the **updated in-text citations**, plus the newly generated and correctly ordered bibliography appended at the end.

Here is the document text:
{{{documentText}}}

Here are the detected references. Use these to create the bibliography and format the in-text citations:
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
    async (flowInput) => {
      const {output} = await reformatCitationsPrompt(promptData);
      return output!;
    }
  );

  return reformatCitationsFlow(input);
}

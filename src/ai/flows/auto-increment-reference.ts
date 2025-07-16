'use server';

/**
 * @fileOverview A flow that automatically increments the reference number upon insertion of a new reference.
 *
 * - autoIncrementReference - A function that handles the auto-incrementing of reference numbers.
 * - AutoIncrementReferenceInput - The input type for the autoIncrementReference function.
 * - AutoIncrementReferenceOutput - The return type for the autoIncrementReference function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoIncrementReferenceInputSchema = z.object({
  text: z.string().describe('The document text with citations.'),
  lastReferenceNumber: z.number().describe('The last reference number used in the document.'),
  newReferenceText: z.string().describe('The text of the new reference to be inserted.'),
  citationStyle: z.string().describe('The citation style to follow.'),
});
export type AutoIncrementReferenceInput = z.infer<typeof AutoIncrementReferenceInputSchema>;

const AutoIncrementReferenceOutputSchema = z.object({
  updatedText: z.string().describe('The updated document text with the new reference inserted and numbered correctly.'),
  newReferenceNumber: z.number().describe('The new reference number assigned to the inserted reference.'),
});
export type AutoIncrementReferenceOutput = z.infer<typeof AutoIncrementReferenceOutputSchema>;

export async function autoIncrementReference(input: AutoIncrementReferenceInput): Promise<AutoIncrementReferenceOutput> {
  return autoIncrementReferenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoIncrementReferencePrompt',
  input: {schema: AutoIncrementReferenceInputSchema},
  output: {schema: AutoIncrementReferenceOutputSchema},
  prompt: `You are an expert in automatically incrementing reference numbers in a document.

You will receive the document text, the last reference number used, the text of the new reference to be inserted, and the citation style to follow.

Your task is to insert the new reference into the document, increment the reference number, and update the document text accordingly. You must also return the new reference number.

Document Text: {{{text}}}
Last Reference Number: {{{lastReferenceNumber}}}
New Reference Text: {{{newReferenceText}}}
Citation Style: {{{citationStyle}}}

Output:
Updated Text:
New Reference Number:`, // Ensure that the output contains the updated document text and the new reference number.
});

const autoIncrementReferenceFlow = ai.defineFlow(
  {
    name: 'autoIncrementReferenceFlow',
    inputSchema: AutoIncrementReferenceInputSchema,
    outputSchema: AutoIncrementReferenceOutputSchema,
  },
  async input => {
    const newReferenceNumber = input.lastReferenceNumber + 1;
    const updatedText = input.text + `[${newReferenceNumber}] ` + input.newReferenceText; // basic implementation, can be improved

    const {output} = await prompt({...input, newReferenceNumber, updatedText});
    return {
      updatedText: output?.updatedText ?? updatedText,
      newReferenceNumber: output?.newReferenceNumber ?? newReferenceNumber,
    };
  }
);

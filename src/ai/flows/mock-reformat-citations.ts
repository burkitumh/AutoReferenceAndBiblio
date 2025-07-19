'use server';

import type { ReformatCitationsInput, ReformatCitationsOutput } from "./reformat-citations";

/**
 * @fileOverview A more intelligent mock implementation of the reformatCitations flow for testing purposes.
 * This mock simulates reordering citations and updating the bibliography based on the order of appearance in the text.
 */
export async function mockReformatCitations(input: ReformatCitationsInput): Promise<ReformatCitationsOutput> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

  // 1. Parse the references provided by the user.
  const providedReferences = input.detectedReferences.trim().split('\n').filter(ref => ref.trim() !== '');
  
  // 2. Find all unique citations in the document text, in their order of appearance.
  const citationRegex = /\[(\d+)\]/g;
  const uniqueCitationsInOrder = [...new Set(Array.from(input.documentText.matchAll(citationRegex), m => parseInt(m[1])))];

  // 3. Create the new bibliography using the user-provided references.
  // We also create a map from the old citation number to its new number.
  const newBibliography: string[] = [];
  const oldToNewCitationMap: { [key: number]: number } = {};

  uniqueCitationsInOrder.forEach((oldNum, index) => {
    // Only map if there is a corresponding reference provided by the user.
    if (index < providedReferences.length) {
      const newNum = index + 1;
      oldToNewCitationMap[oldNum] = newNum;
      
      // Use the actual reference text provided by the user for the new bibliography.
      const refText = providedReferences[index].replace(/^\[\d+\]\s*/, ''); // remove old numbering if present
      newBibliography.push(`[${newNum}] ${refText}`);
    }
  });


  // 4. Replace the old citations in the text with the new, mapped numbers.
  const renumberedText = input.documentText.replace(citationRegex, (match, oldNumStr) => {
    const oldNum = parseInt(oldNumStr);
    const newNum = oldToNewCitationMap[oldNum];
    if (newNum !== undefined) {
      return `[${newNum}]`;
    }
    return `[?]`; // Return '?' if a citation was found in text but no corresponding reference was provided.
  });

  // 5. Assemble the final document.
  const finalBibliography = newBibliography.length > 0 
    ? `\n\nBibliography\n(Formatted in ${input.selectedCitationStyle} style - Mock)\n\n${newBibliography.join('\n')}`
    : '';

  return {
    reformattedDocument: `${renumberedText}${finalBibliography}`
  };
}

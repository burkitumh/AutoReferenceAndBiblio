'use server';

import type { ReformatCitationsInput, ReformatCitationsOutput } from "./reformat-citations";

/**
 * @fileOverview A more intelligent mock implementation of the reformatCitations flow for testing purposes.
 * This mock simulates reordering citations and updating the bibliography.
 */
export async function mockReformatCitations(input: ReformatCitationsInput): Promise<ReformatCitationsOutput> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

  // 1. Parse the user-provided references.
  const providedReferences = input.detectedReferences.trim().split('\n').filter(ref => ref.trim() !== '');
  
  // 2. Extract original citations from the text, like "[1]", "[2]".
  const citationRegex = /\[(\d+)\]/g;
  const originalCitationsInText = [...input.documentText.matchAll(citationRegex)];
  
  // 3. Create a new bibliography and a mapping from the old citation number to the new one.
  // In this mock, we'll re-number based on the order of references the user pasted.
  const newBibliography: string[] = [];
  const oldToNewCitationMap: { [key: number]: number } = {};

  // Create a mapping. For this mock, we assume the user provides references in the desired new order.
  const uniqueOldCitationNumbers = [...new Set(originalCitationsInText.map(c => parseInt(c[1])))].sort((a, b) => a - b);
  
  uniqueOldCitationNumbers.forEach((oldNum, index) => {
    if (index < providedReferences.length) {
      const newNum = index + 1;
      oldToNewCitationMap[oldNum] = newNum;
      // Use the actual reference text provided by the user for the new bibliography.
      const refText = providedReferences[index].replace(/\[\d+\]\s*/, ''); // remove old numbering if present
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
    return `[?]`; // Return '?' if we couldn't map this citation.
  });

  // 5. Assemble the final document.
  const finalBibliography = `\n\nBibliography\n(Formatted in ${input.selectedCitationStyle} style - Mock)\n\n${newBibliography.join('\n')}`;

  return {
    reformattedDocument: `${renumberedText}${finalBibliography}`
  };
}

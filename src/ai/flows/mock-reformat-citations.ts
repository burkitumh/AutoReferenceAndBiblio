'use server';

import type { ReformatCitationsInput, ReformatCitationsOutput } from "./reformat-citations";

/**
 * @fileOverview A more intelligent mock implementation of the reformatCitations flow for testing purposes.
 * This mock simulates reordering citations and updating the bibliography based on the order of appearance in the text.
 */
export async function mockReformatCitations(input: ReformatCitationsInput): Promise<ReformatCitationsOutput> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

  const { documentText, detectedReferences, selectedCitationStyle } = input;

  // 1. Parse the provided references into an array.
  const providedReferences = detectedReferences.trim().split('\n').filter(ref => ref.trim() !== '');

  // 2. Find all unique citations in the document text, maintaining their order of first appearance.
  const citationRegex = /\[(\d+)\]/g;
  const oldCitationNumbersInOrder = [...new Set(Array.from(documentText.matchAll(citationRegex), m => parseInt(m[1])))];

  // 3. Create the new bibliography and a map from old citation numbers to new ones.
  // The new bibliography order is determined by the order of appearance in the text.
  const newBibliography: string[] = [];
  const oldToNewCitationMap: { [key: number]: number } = {};
  
  // We only create as many new bibliography entries as there are provided references.
  const numCitationsToProcess = Math.min(oldCitationNumbersInOrder.length, providedReferences.length);

  for (let i = 0; i < numCitationsToProcess; i++) {
    const oldNum = oldCitationNumbersInOrder[i];
    const newNum = i + 1;
    oldToNewCitationMap[oldNum] = newNum;
    
    // Strip any existing numbering like "[1] " or "1. " from the provided reference text.
    const refText = providedReferences[i].replace(/^\[\d+\]\s*|^\d+\.\s*/, '');
    newBibliography.push(`[${newNum}] ${refText}`);
  }

  // 4. Replace all occurrences of the old citations in the text with the new, mapped numbers.
  const renumberedText = documentText.replace(citationRegex, (match, oldNumStr) => {
    const oldNum = parseInt(oldNumStr);
    const newNum = oldToNewCitationMap[oldNum];
    if (newNum !== undefined) {
      return `[${newNum}]`;
    }
    // If a citation in the text doesn't have a corresponding provided reference, mark it as unresolved.
    return `[?]`;
  });

  // 5. Assemble the final document.
  const finalBibliography = newBibliography.length > 0
    ? `\n\nBibliography\n(Formatted in ${selectedCitationStyle} style - Mock)\n\n${newBibliography.join('\n')}`
    : '';

  return {
    reformattedDocument: `${renumberedText}${finalBibliography}`
  };
}

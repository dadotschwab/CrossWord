import type { WordInput, PlacedWord, PuzzleGrid, Direction } from '../types/puzzle.types';

interface Slot {
  direction: Direction;
  startRow: number;
  startCol: number;
  length: number;
}

// Template grid layouts
const templates: Slot[][] = [
  // Small template (8x8, 5-8 words)
  [
    { direction: 'across', startRow: 0, startCol: 0, length: 5 },
    { direction: 'across', startRow: 2, startCol: 0, length: 6 },
    { direction: 'across', startRow: 4, startCol: 2, length: 5 },
    { direction: 'across', startRow: 6, startCol: 0, length: 7 },
    { direction: 'down', startRow: 0, startCol: 2, length: 5 },
    { direction: 'down', startRow: 0, startCol: 4, length: 7 },
    { direction: 'down', startRow: 2, startCol: 6, length: 5 },
  ],

  // Medium template (10x10, 8-12 words)
  [
    { direction: 'across', startRow: 0, startCol: 0, length: 8 },
    { direction: 'across', startRow: 2, startCol: 2, length: 7 },
    { direction: 'across', startRow: 4, startCol: 0, length: 9 },
    { direction: 'across', startRow: 6, startCol: 1, length: 8 },
    { direction: 'across', startRow: 8, startCol: 2, length: 6 },
    { direction: 'down', startRow: 0, startCol: 2, length: 6 },
    { direction: 'down', startRow: 0, startCol: 5, length: 7 },
    { direction: 'down', startRow: 0, startCol: 7, length: 8 },
    { direction: 'down', startRow: 2, startCol: 3, length: 7 },
    { direction: 'down', startRow: 2, startCol: 8, length: 6 },
  ],

  // Large template (12x12, 12-15 words)
  [
    { direction: 'across', startRow: 0, startCol: 0, length: 10 },
    { direction: 'across', startRow: 2, startCol: 1, length: 9 },
    { direction: 'across', startRow: 4, startCol: 0, length: 11 },
    { direction: 'across', startRow: 6, startCol: 2, length: 9 },
    { direction: 'across', startRow: 8, startCol: 0, length: 10 },
    { direction: 'across', startRow: 10, startCol: 1, length: 8 },
    { direction: 'down', startRow: 0, startCol: 2, length: 7 },
    { direction: 'down', startRow: 0, startCol: 5, length: 9 },
    { direction: 'down', startRow: 0, startCol: 8, length: 10 },
    { direction: 'down', startRow: 2, startCol: 3, length: 8 },
    { direction: 'down', startRow: 2, startCol: 10, length: 8 },
    { direction: 'down', startRow: 4, startCol: 6, length: 7 },
  ],
];

function selectTemplate(wordCount: number): Slot[] {
  if (wordCount <= 8) {
    return templates[0];
  } else if (wordCount <= 12) {
    return templates[1];
  } else {
    return templates[2];
  }
}

function matchWordsToSlots(words: WordInput[], slots: Slot[]): Map<number, WordInput> {
  // Sort words by length (longest first)
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

  // Sort slots by length (longest first)
  const sortedSlots = [...slots].sort((a, b) => b.length - a.length);

  const matching = new Map<number, WordInput>();
  const usedWordIndices = new Set<number>();

  // Try to match each slot with a word
  for (let i = 0; i < Math.min(sortedSlots.length, sortedWords.length); i++) {
    const slot = sortedSlots[i];

    // Find first unused word that fits this slot
    for (let j = 0; j < sortedWords.length; j++) {
      if (usedWordIndices.has(j)) continue;

      const word = sortedWords[j];
      if (word.word.length === slot.length) {
        matching.set(i, word);
        usedWordIndices.add(j);
        break;
      }
    }

    // If no exact match, find closest match (within 2 characters)
    if (!matching.has(i)) {
      for (let j = 0; j < sortedWords.length; j++) {
        if (usedWordIndices.has(j)) continue;

        const word = sortedWords[j];
        if (Math.abs(word.word.length - slot.length) <= 2 && word.word.length <= slot.length) {
          matching.set(i, word);
          usedWordIndices.add(j);
          break;
        }
      }
    }
  }

  return matching;
}

function createGrid(slots: Slot[], wordMatching: Map<number, WordInput>): { grid: string[][]; dimensions: { rows: number; cols: number } } {
  // Determine grid dimensions
  let maxRow = 0;
  let maxCol = 0;

  slots.forEach((slot, index) => {
    const word = wordMatching.get(index);
    if (!word) return;

    if (slot.direction === 'across') {
      maxRow = Math.max(maxRow, slot.startRow);
      maxCol = Math.max(maxCol, slot.startCol + word.word.length - 1);
    } else {
      maxRow = Math.max(maxRow, slot.startRow + word.word.length - 1);
      maxCol = Math.max(maxCol, slot.startCol);
    }
  });

  const rows = maxRow + 1;
  const cols = maxCol + 1;

  // Initialize grid with empty strings (black cells)
  const grid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));

  // Place words in grid
  slots.forEach((slot, index) => {
    const word = wordMatching.get(index);
    if (!word) return;

    const letters = word.word.toUpperCase().split('');

    if (slot.direction === 'across') {
      for (let i = 0; i < letters.length; i++) {
        grid[slot.startRow][slot.startCol + i] = '';  // Mark as white cell initially
      }
    } else {
      for (let i = 0; i < letters.length; i++) {
        grid[slot.startRow + i][slot.startCol] = '';  // Mark as white cell initially
      }
    }
  });

  return { grid, dimensions: { rows, cols } };
}

function assignNumbers(slots: Slot[], wordMatching: Map<number, WordInput>): PlacedWord[] {
  const placedWords: PlacedWord[] = [];
  const numberMap = new Map<string, number>();
  let currentNumber = 1;

  // Sort slots by position (top-to-bottom, left-to-right)
  const sortedIndices = Array.from(wordMatching.keys()).sort((a, b) => {
    const slotA = slots[a];
    const slotB = slots[b];
    if (slotA.startRow !== slotB.startRow) {
      return slotA.startRow - slotB.startRow;
    }
    return slotA.startCol - slotB.startCol;
  });

  sortedIndices.forEach((index) => {
    const slot = slots[index];
    const word = wordMatching.get(index);
    if (!word) return;

    const key = `${slot.startRow},${slot.startCol}`;

    if (!numberMap.has(key)) {
      numberMap.set(key, currentNumber++);
    }

    placedWords.push({
      id: word.id,
      word: word.word.toUpperCase(),
      clue: word.clue,
      direction: slot.direction,
      startRow: slot.startRow,
      startCol: slot.startCol,
      number: numberMap.get(key)!,
    });
  });

  return placedWords;
}

export function generateCrossword(words: WordInput[]): PuzzleGrid | null {
  // Validate input
  if (words.length < 5) {
    return null;
  }

  // Select appropriate template
  const template = selectTemplate(words.length);

  // Match words to slots
  const wordMatching = matchWordsToSlots(words, template);

  if (wordMatching.size < 5) {
    return null; // Not enough words matched
  }

  // Create grid
  const { grid, dimensions } = createGrid(template, wordMatching);

  // Assign numbers and create placed words
  const placedWords = assignNumbers(template, wordMatching);

  return {
    grid,
    words: placedWords,
    dimensions,
  };
}

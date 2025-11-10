// Puzzle-related types

export interface WordInput {
  id: string;
  word: string;
  clue: string;
  language: string;
}

export type Direction = 'across' | 'down';

export interface PlacedWord {
  id: string;
  word: string;
  clue: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  number: number; // Puzzle clue number
}

export interface PuzzleGrid {
  grid: string[][]; // 2D array: null for black cells, '' for empty, 'A' for filled
  words: PlacedWord[];
  dimensions: {
    rows: number;
    cols: number;
  };
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface SelectedCell extends CellPosition {
  direction: Direction;
}

export interface WordSolution {
  word_id: string;
  time_seconds: number;
  errors: number;
  revealed_letters: number;
  correct: boolean;
}

export interface PuzzleState {
  userGrid: string[][];
  selectedCell: SelectedCell | null;
  hintsUsed: number;
  startTime: number;
  wordTimings: Map<string, { startTime: number; errors: number; revealedCount: number }>;
}

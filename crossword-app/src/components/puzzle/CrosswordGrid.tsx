import { useState, useEffect, useCallback, useRef } from 'react';
import type { PuzzleGrid, PlacedWord } from '../../types/puzzle.types';
import CrosswordCell from './CrosswordCell';

interface CrosswordGridProps {
  puzzle: PuzzleGrid;
  userGrid: string[][];
  onCellChange: (row: number, col: number, value: string) => void;
  onWordSelect: (word: PlacedWord | null) => void;
}

export default function CrosswordGrid({ puzzle, userGrid, onCellChange, onWordSelect }: CrosswordGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<PlacedWord | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [cellSize, setCellSize] = useState(40);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate cell size based on container width
  useEffect(() => {
    const calculateCellSize = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const maxDimension = Math.max(puzzle.dimensions.rows, puzzle.dimensions.cols);

      // Calculate cell size to fill container (minus padding and borders)
      const padding = 16; // 8px padding on each side
      const borderWidth = 4; // 2px border on each side
      const availableWidth = containerWidth - padding - borderWidth;
      const calculatedCellSize = Math.floor(availableWidth / maxDimension);

      setCellSize(Math.max(30, Math.min(calculatedCellSize, 80))); // Min 30px, max 80px
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [puzzle.dimensions]);

  // Find all words that contain a specific cell
  const findWordsAtCell = useCallback((row: number, col: number) => {
    return puzzle.words.filter((word) => {
      if (word.direction === 'across') {
        return row === word.startRow && col >= word.startCol && col < word.startCol + word.word.length;
      } else {
        return col === word.startCol && row >= word.startRow && row < word.startRow + word.word.length;
      }
    });
  }, [puzzle.words]);

  // Check if cell is the starting cell of a word
  const isStartingCell = useCallback((row: number, col: number, word: PlacedWord) => {
    return word.startRow === row && word.startCol === col;
  }, []);

  // Update highlighted cells when word selection changes
  useEffect(() => {
    if (!selectedWord) {
      setHighlightedCells(new Set());
      onWordSelect(null);
      return;
    }

    const cells = new Set<string>();
    if (selectedWord.direction === 'across') {
      for (let c = selectedWord.startCol; c < selectedWord.startCol + selectedWord.word.length; c++) {
        cells.add(`${selectedWord.startRow},${c}`);
      }
    } else {
      for (let r = selectedWord.startRow; r < selectedWord.startRow + selectedWord.word.length; r++) {
        cells.add(`${r},${selectedWord.startCol}`);
      }
    }
    setHighlightedCells(cells);
    onWordSelect(selectedWord);
  }, [selectedWord, onWordSelect]);

  const handleCellFocus = (row: number, col: number) => {
    const wordsAtCell = findWordsAtCell(row, col);

    if (wordsAtCell.length === 0) return;

    // If clicking on already selected cell of a word with multiple directions, toggle direction
    if (selectedCell && selectedCell.row === row && selectedCell.col === col && wordsAtCell.length > 1) {
      // Toggle to the other word at this position
      const otherWord = wordsAtCell.find(w => w.id !== selectedWord?.id);
      if (otherWord) {
        setSelectedWord(otherWord);
        setSelectedCell({ row, col });
      }
      return;
    }

    // Check if this is a starting cell
    const startingWords = wordsAtCell.filter(w => isStartingCell(row, col, w));

    if (startingWords.length > 0) {
      // If multiple words start here, prefer the first one (or toggle if clicking same cell)
      setSelectedWord(startingWords[0]);
      setSelectedCell({ row, col });
    } else if (wordsAtCell.length === 1) {
      // Only one word passes through this cell, select it
      setSelectedWord(wordsAtCell[0]);
      setSelectedCell({ row, col });
    } else {
      // Multiple words, but not a starting cell - just select the cell without a word
      setSelectedCell({ row, col });
      setSelectedWord(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    // Arrow key navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      let newRow = row;
      let newCol = col;

      if (e.key === 'ArrowRight') newCol++;
      if (e.key === 'ArrowLeft') newCol--;
      if (e.key === 'ArrowUp') newRow--;
      if (e.key === 'ArrowDown') newRow++;

      // Check if new position is valid (not black cell)
      if (newRow >= 0 && newRow < puzzle.dimensions.rows && newCol >= 0 && newCol < puzzle.dimensions.cols) {
        const wordsAtNewCell = findWordsAtCell(newRow, newCol);
        if (wordsAtNewCell.length > 0) {
          setSelectedCell({ row: newRow, col: newCol });

          // If we have a selected word and the new cell is part of it, keep the word selected
          if (selectedWord && wordsAtNewCell.some(w => w.id === selectedWord.id)) {
            // Keep current word selected
          } else if (wordsAtNewCell.length === 1) {
            setSelectedWord(wordsAtNewCell[0]);
          } else {
            // Multiple words at new cell, don't auto-select
            setSelectedWord(null);
          }
        }
      }
      return;
    }

    // Tab: Move to next word
    if (e.key === 'Tab') {
      e.preventDefault();
      if (selectedWord) {
        const currentWordIndex = puzzle.words.indexOf(selectedWord);
        const nextWord = puzzle.words[(currentWordIndex + 1) % puzzle.words.length];
        setSelectedWord(nextWord);
        setSelectedCell({ row: nextWord.startRow, col: nextWord.startCol });
      }
      return;
    }

    // Backspace: Clear and move back within current word
    if (e.key === 'Backspace') {
      e.preventDefault();
      onCellChange(row, col, '');

      if (selectedWord) {
        // Move to previous cell within the current word
        if (selectedWord.direction === 'across' && col > selectedWord.startCol) {
          setSelectedCell({ row, col: col - 1 });
        } else if (selectedWord.direction === 'down' && row > selectedWord.startRow) {
          setSelectedCell({ row: row - 1, col });
        }
      }
      return;
    }
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    onCellChange(row, col, value);

    // Only auto-advance if we have a selected word and typed a value
    if (value && selectedWord) {
      const { direction, startRow, startCol, word } = selectedWord;

      // Calculate next position within the current word
      let nextRow = row;
      let nextCol = col;

      if (direction === 'across') {
        nextCol = col + 1;
        // Check if next cell is still within the current word
        if (nextCol < startCol + word.length) {
          setSelectedCell({ row: nextRow, col: nextCol });
        } else {
          // Word is complete, deselect everything
          setSelectedCell(null);
          setSelectedWord(null);
        }
      } else {
        nextRow = row + 1;
        // Check if next cell is still within the current word
        if (nextRow < startRow + word.length) {
          setSelectedCell({ row: nextRow, col: nextCol });
        } else {
          // Word is complete, deselect everything
          setSelectedCell(null);
          setSelectedWord(null);
        }
      }
    }
  };

  // Get cell number (clue number)
  const getCellNumber = (row: number, col: number): number | undefined => {
    const word = puzzle.words.find((w) => w.startRow === row && w.startCol === col);
    return word?.number;
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="inline-block bg-gray-100 p-2">
        <div className="inline-block border-2 border-gray-900">
          {puzzle.grid.map((rowCells, rowIndex) => (
            <div key={rowIndex} className="flex">
              {rowCells.map((_, colIndex) => {
                const isBlack = !findWordsAtCell(rowIndex, colIndex).length;
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isHighlighted = highlightedCells.has(`${rowIndex},${colIndex}`);
                const number = getCellNumber(rowIndex, colIndex);

                return (
                  <CrosswordCell
                    key={`${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    value={userGrid[rowIndex][colIndex]}
                    number={number}
                    isBlack={isBlack}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    cellSize={cellSize}
                    onChange={handleCellChange}
                    onFocus={handleCellFocus}
                    onKeyDown={handleKeyDown}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

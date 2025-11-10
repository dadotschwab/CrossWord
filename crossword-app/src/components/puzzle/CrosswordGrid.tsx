import { useState, useEffect, useCallback } from 'react';
import type { PuzzleGrid, PlacedWord, Direction } from '../../types/puzzle.types';
import CrosswordCell from './CrosswordCell';

interface CrosswordGridProps {
  puzzle: PuzzleGrid;
  userGrid: string[][];
  onCellChange: (row: number, col: number, value: string) => void;
  onWordSelect: (word: PlacedWord) => void;
}

export default function CrosswordGrid({ puzzle, userGrid, onCellChange, onWordSelect }: CrosswordGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<Direction>('across');
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());

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

  // Find word in current direction at cell
  const findCurrentWord = useCallback((row: number, col: number, dir: Direction) => {
    return puzzle.words.find((word) => {
      if (word.direction !== dir) return false;

      if (dir === 'across') {
        return row === word.startRow && col >= word.startCol && col < word.startCol + word.word.length;
      } else {
        return col === word.startCol && row >= word.startRow && row < word.startRow + word.word.length;
      }
    });
  }, [puzzle.words]);

  // Update highlighted cells when selection changes
  useEffect(() => {
    if (!selectedCell) {
      setHighlightedCells(new Set());
      return;
    }

    const currentWord = findCurrentWord(selectedCell.row, selectedCell.col, direction);
    if (!currentWord) {
      setHighlightedCells(new Set());
      return;
    }

    const cells = new Set<string>();
    if (direction === 'across') {
      for (let c = currentWord.startCol; c < currentWord.startCol + currentWord.word.length; c++) {
        cells.add(`${currentWord.startRow},${c}`);
      }
    } else {
      for (let r = currentWord.startRow; r < currentWord.startRow + currentWord.word.length; r++) {
        cells.add(`${r},${currentWord.startCol}`);
      }
    }
    setHighlightedCells(cells);

    // Notify parent of word selection
    onWordSelect(currentWord);
  }, [selectedCell, direction, findCurrentWord, onWordSelect]);

  const handleCellFocus = (row: number, col: number) => {
    // If clicking on already selected cell, toggle direction
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      const words = findWordsAtCell(row, col);
      if (words.length > 1) {
        setDirection(direction === 'across' ? 'down' : 'across');
      }
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    const currentWord = findCurrentWord(row, col, direction);
    if (!currentWord) return;

    // Navigation
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
        const isBlack = puzzle.grid[newRow][newCol] === '' && !findWordsAtCell(newRow, newCol).length;
        if (!isBlack) {
          setSelectedCell({ row: newRow, col: newCol });
        }
      }
    }

    // Tab: Move to next word
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentWordIndex = puzzle.words.indexOf(currentWord);
      const nextWord = puzzle.words[(currentWordIndex + 1) % puzzle.words.length];
      setSelectedCell({ row: nextWord.startRow, col: nextWord.startCol });
      setDirection(nextWord.direction);
    }

    // Backspace: Clear and move back
    if (e.key === 'Backspace') {
      e.preventDefault();
      onCellChange(row, col, '');

      // Move to previous cell in current word
      if (direction === 'across' && col > currentWord.startCol) {
        setSelectedCell({ row, col: col - 1 });
      } else if (direction === 'down' && row > currentWord.startRow) {
        setSelectedCell({ row: row - 1, col });
      }
    }
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    onCellChange(row, col, value);

    // Auto-advance to next cell
    if (value && selectedCell) {
      const currentWord = findCurrentWord(row, col, direction);
      if (!currentWord) return;

      if (direction === 'across' && col < currentWord.startCol + currentWord.word.length - 1) {
        setSelectedCell({ row, col: col + 1 });
      } else if (direction === 'down' && row < currentWord.startRow + currentWord.word.length - 1) {
        setSelectedCell({ row: row + 1, col });
      }
    }
  };

  // Get cell number (clue number)
  const getCellNumber = (row: number, col: number): number | undefined => {
    const word = puzzle.words.find((w) => w.startRow === row && w.startCol === col);
    return word?.number;
  };

  return (
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
  );
}

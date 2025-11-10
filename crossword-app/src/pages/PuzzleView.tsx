import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { List, Word } from '../types/database.types';
import type { PuzzleGrid, PlacedWord, WordInput } from '../types/puzzle.types';
import { getList, getWords } from '../services/mock-data.service';
import { generateCrossword } from '../services/crossword-generator.service';
import { Button, Modal } from '../components/ui';
import CrosswordGrid from '../components/puzzle/CrosswordGrid';
import CluesList from '../components/puzzle/CluesList';
import PuzzleControls from '../components/puzzle/PuzzleControls';
import { MAX_HINTS_PER_PUZZLE } from '../utils/constants';

export default function PuzzleView() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<List | null>(null);
  const [puzzle, setPuzzle] = useState<PuzzleGrid | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedWord, setSelectedWord] = useState<PlacedWord | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [_errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const infoOverlayRef = useRef<HTMLDivElement>(null);

  // Close info panel on click outside
  useEffect(() => {
    if (!isInfoOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (infoOverlayRef.current && !infoOverlayRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInfoOpen]);

  // Close info panel on Escape key
  useEffect(() => {
    if (!isInfoOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInfoOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isInfoOpen]);

  useEffect(() => {
    if (listId) {
      const foundList = getList(listId);
      const listWords = getWords(listId);

      if (foundList && listWords.length >= 5) {
        setList(foundList);

        // Convert words to WordInput format
        const wordInputs: WordInput[] = listWords.map((word: Word) => ({
          id: word.id,
          word: word.word,
          clue: word.definition,
          language: word.language,
        }));

        // Generate puzzle
        const generatedPuzzle = generateCrossword(wordInputs);

        if (generatedPuzzle) {
          setPuzzle(generatedPuzzle);
          // Initialize empty user grid
          const emptyGrid = Array(generatedPuzzle.dimensions.rows)
            .fill(null)
            .map(() => Array(generatedPuzzle.dimensions.cols).fill(''));
          setUserGrid(emptyGrid);
        } else {
          alert('Failed to generate crossword. Please try again.');
          navigate(`/lists/${listId}`);
        }
      } else {
        navigate(`/lists/${listId}`);
      }
    }
  }, [listId, navigate]);

  const handleCellChange = (row: number, col: number, value: string) => {
    const newGrid = userGrid.map((r) => [...r]);
    newGrid[row][col] = value;
    setUserGrid(newGrid);

    // Clear error state for this cell
    setErrorCells((prev) => {
      const next = new Set(prev);
      next.delete(`${row},${col}`);
      return next;
    });
  };

  const handleCheckSolution = () => {
    if (!puzzle) return;

    const errors = new Set<string>();

    puzzle.words.forEach((word) => {
      const letters = word.word.split('');

      letters.forEach((letter, index) => {
        let row: number, col: number;

        if (word.direction === 'across') {
          row = word.startRow;
          col = word.startCol + index;
        } else {
          row = word.startRow + index;
          col = word.startCol;
        }

        const userLetter = userGrid[row][col];
        if (userLetter && userLetter !== letter) {
          errors.add(`${row},${col}`);
        }
      });
    });

    setErrorCells(errors);

    if (errors.size === 0 && isGridComplete) {
      alert('Perfect! All answers are correct! 🎉');
    } else if (errors.size > 0) {
      alert(`Found ${errors.size} error${errors.size !== 1 ? 's' : ''}. Incorrect cells are marked in red.`);
    } else {
      alert('Looking good so far! Keep going.');
    }
  };

  const handleRevealHint = () => {
    if (!puzzle || !selectedWord || hintsUsed >= MAX_HINTS_PER_PUZZLE) return;

    const word = selectedWord;
    const letters = word.word.split('');

    // Find first empty cell in selected word
    for (let i = 0; i < letters.length; i++) {
      let row: number, col: number;

      if (word.direction === 'across') {
        row = word.startRow;
        col = word.startCol + i;
      } else {
        row = word.startRow + i;
        col = word.startCol;
      }

      if (!userGrid[row][col]) {
        handleCellChange(row, col, letters[i]);
        setHintsUsed(hintsUsed + 1);
        return;
      }
    }

    alert('This word is already complete!');
  };

  const isGridComplete = useMemo(() => {
    if (!puzzle) return false;

    return puzzle.words.every((word) => {
      const letters = word.word.split('');
      return letters.every((letter, index) => {
        let row: number, col: number;

        if (word.direction === 'across') {
          row = word.startRow;
          col = word.startCol + index;
        } else {
          row = word.startRow + index;
          col = word.startCol;
        }

        return userGrid[row]?.[col] === letter;
      });
    });
  }, [puzzle, userGrid]);

  const handleCompletePuzzle = () => {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    setIsCompletionModalOpen(true);
    console.log(`Puzzle completed in ${elapsedSeconds} seconds with ${hintsUsed} hints used`);
  };

  const handleClueClick = (word: PlacedWord) => {
    setSelectedWord(word);
  };

  if (!list || !puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/lists/${listId}`}>
                <Button variant="outline" size="sm">
                  ← Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
                <p className="text-sm text-gray-600">{puzzle.words.length} words</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Crossword Grid - 50% width */}
          <div className="flex flex-col items-center justify-start">
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <CrosswordGrid
                puzzle={puzzle}
                userGrid={userGrid}
                onCellChange={handleCellChange}
                onWordSelect={setSelectedWord}
              />
            </div>
          </div>

          {/* Clues and Controls - 50% width */}
          <div className="relative space-y-4">
            <PuzzleControls
              hintsUsed={hintsUsed}
              maxHints={MAX_HINTS_PER_PUZZLE}
              onCheckSolution={handleCheckSolution}
              onRevealHint={handleRevealHint}
              canComplete={isGridComplete}
              onComplete={handleCompletePuzzle}
              onInfoClick={() => setIsInfoOpen(true)}
            />

            <div className="bg-white rounded-lg shadow-md p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Clues</h2>
              <CluesList
                words={puzzle.words}
                selectedWord={selectedWord}
                onClueClick={handleClueClick}
              />
            </div>

            {/* Info Overlay */}
            <div
              ref={infoOverlayRef}
              className={`absolute inset-0 bg-white rounded-lg shadow-md p-6 overflow-y-auto transition-all duration-200 ${
                isInfoOpen ? 'z-10 opacity-100' : '-z-10 opacity-0 pointer-events-none'
              }`}
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <div className="relative">
                <button
                  onClick={() => setIsInfoOpen(false)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-3 text-lg">How to Use:</p>

                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Controls:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                        <li><strong>Check Solution</strong>: Validates your answers and shows errors</li>
                        <li><strong>Reveal Letter</strong>: Shows one letter in the selected word (3 max)</li>
                        <li><strong>Complete Puzzle</strong>: Finish when all words are correct</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 mb-1">Navigation:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                        <li>Click a starting cell to begin typing a word</li>
                        <li>Type letters to fill cells automatically</li>
                        <li>Use <strong>arrow keys</strong> to navigate cells</li>
                        <li>Press <strong>Tab</strong> to jump to next word</li>
                        <li>Click a cell twice to toggle between across/down</li>
                        <li>Use <strong>Backspace</strong> to delete and move back</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 mb-1">Tips:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                        <li>Use hints sparingly for better learning</li>
                        <li>Complete one word at a time for clarity</li>
                        <li>Check your work before completing the puzzle</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Completion Modal */}
      <Modal
        open={isCompletionModalOpen}
        onOpenChange={setIsCompletionModalOpen}
        title="Puzzle Complete! 🎉"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Congratulations! You've successfully completed the puzzle.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Hints used:</span>
              <span className="font-semibold">{hintsUsed} / {MAX_HINTS_PER_PUZZLE}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Words completed:</span>
              <span className="font-semibold">{puzzle.words.length}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate(`/lists/${listId}`)} className="flex-1">
              Back to List
            </Button>
            <Button onClick={() => window.location.reload()} className="flex-1">
              New Puzzle
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

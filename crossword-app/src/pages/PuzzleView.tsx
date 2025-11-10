import { useState, useEffect, useMemo } from 'react';
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Crossword Grid - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <CrosswordGrid
                puzzle={puzzle}
                userGrid={userGrid}
                onCellChange={handleCellChange}
                onWordSelect={setSelectedWord}
              />
            </div>
          </div>

          {/* Clues and Controls - 1/3 width */}
          <div className="space-y-6">
            <PuzzleControls
              hintsUsed={hintsUsed}
              maxHints={MAX_HINTS_PER_PUZZLE}
              onCheckSolution={handleCheckSolution}
              onRevealHint={handleRevealHint}
              canComplete={isGridComplete}
              onComplete={handleCompletePuzzle}
            />

            <div className="bg-white rounded-lg shadow-md p-6 max-h-[600px] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Clues</h2>
              <CluesList
                words={puzzle.words}
                selectedWord={selectedWord}
                onClueClick={handleClueClick}
              />
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

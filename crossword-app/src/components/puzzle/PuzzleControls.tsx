import { Button } from '../ui';

interface PuzzleControlsProps {
  hintsUsed: number;
  maxHints: number;
  onCheckSolution: () => void;
  onRevealHint: () => void;
  canComplete: boolean;
  onComplete: () => void;
}

export default function PuzzleControls({
  hintsUsed,
  maxHints,
  onCheckSolution,
  onRevealHint,
  canComplete,
  onComplete,
}: PuzzleControlsProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Puzzle Controls</h3>

        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={onCheckSolution}
          >
            Check Solution
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={onRevealHint}
            disabled={hintsUsed >= maxHints}
          >
            Reveal Letter ({hintsUsed}/{maxHints} hints used)
          </Button>

          <Button
            variant="primary"
            className="w-full"
            onClick={onComplete}
            disabled={!canComplete}
          >
            {canComplete ? 'Complete Puzzle' : 'Complete all words first'}
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Use arrow keys to navigate</li>
          <li>Press Tab to move to next word</li>
          <li>Click a cell twice to switch direction</li>
          <li>Use hints sparingly for better learning</li>
        </ul>
      </div>
    </div>
  );
}

import { Button } from '../ui';
import InfoTooltip from '../ui/InfoTooltip';

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
  const tipsContent = (
    <div className="text-sm">
      <p className="font-semibold text-gray-900 mb-3">How to Use:</p>

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
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-3">
        <h3 className="font-semibold text-gray-900">Puzzle Controls</h3>
        <InfoTooltip content={tipsContent} />
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onCheckSolution}
          className="flex-1"
        >
          Check Solution
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRevealHint}
          disabled={hintsUsed >= maxHints}
          className="flex-1"
        >
          Reveal Letter ({hintsUsed}/{maxHints})
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onComplete}
          disabled={!canComplete}
          className="flex-1"
        >
          {canComplete ? 'Complete' : 'Complete all first'}
        </Button>
      </div>
    </div>
  );
}

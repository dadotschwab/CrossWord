import { Button } from '../ui';
import InfoTooltip from '../ui/InfoTooltip';

interface PuzzleControlsProps {
  hintsUsed: number;
  maxHints: number;
  onCheckSolution: () => void;
  onRevealHint: () => void;
  canComplete: boolean;
  onComplete: () => void;
  onInfoClick: () => void;
}

export default function PuzzleControls({
  hintsUsed,
  maxHints,
  onCheckSolution,
  onRevealHint,
  canComplete,
  onComplete,
  onInfoClick,
}: PuzzleControlsProps) {

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-3">
        <h3 className="font-semibold text-gray-900">Puzzle Controls</h3>
        <InfoTooltip onClick={onInfoClick} />
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

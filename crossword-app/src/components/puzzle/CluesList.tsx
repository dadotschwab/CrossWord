import type { PlacedWord } from '../../types/puzzle.types';

interface CluesListProps {
  words: PlacedWord[];
  selectedWord: PlacedWord | null;
  correctWords: Set<string>;
  onClueClick: (word: PlacedWord) => void;
}

export default function CluesList({ words, selectedWord, correctWords, onClueClick }: CluesListProps) {
  const acrossWords = words.filter((w) => w.direction === 'across').sort((a, b) => a.number - b.number);
  const downWords = words.filter((w) => w.direction === 'down').sort((a, b) => a.number - b.number);

  const ClueItem = ({ word }: { word: PlacedWord }) => {
    const isCorrect = correctWords.has(word.id);

    return (
      <div
        onClick={() => onClueClick(word)}
        className={`
          p-2 rounded cursor-pointer transition-colors flex items-start gap-2
          ${selectedWord?.id === word.id ? 'bg-primary-100 border-l-4 border-primary-600' : 'hover:bg-gray-100'}
        `}
      >
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="font-bold text-primary-600">{word.number}.</span>
          {isCorrect && (
            <svg
              className="w-4 h-4 text-green-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-gray-800">{word.clue}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Across Column */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Across</h3>
        <div className="space-y-1">
          {acrossWords.map((word) => (
            <ClueItem key={word.id} word={word} />
          ))}
        </div>
      </div>

      {/* Down Column */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Down</h3>
        <div className="space-y-1">
          {downWords.map((word) => (
            <ClueItem key={word.id} word={word} />
          ))}
        </div>
      </div>
    </div>
  );
}

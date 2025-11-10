import type { PlacedWord } from '../../types/puzzle.types';

interface CluesListProps {
  words: PlacedWord[];
  selectedWord: PlacedWord | null;
  onClueClick: (word: PlacedWord) => void;
}

export default function CluesList({ words, selectedWord, onClueClick }: CluesListProps) {
  const acrossWords = words.filter((w) => w.direction === 'across').sort((a, b) => a.number - b.number);
  const downWords = words.filter((w) => w.direction === 'down').sort((a, b) => a.number - b.number);

  const ClueItem = ({ word }: { word: PlacedWord }) => (
    <div
      onClick={() => onClueClick(word)}
      className={`
        p-2 rounded cursor-pointer transition-colors
        ${selectedWord?.id === word.id ? 'bg-primary-100 border-l-4 border-primary-600' : 'hover:bg-gray-100'}
      `}
    >
      <span className="font-bold text-primary-600 mr-2">{word.number}.</span>
      <span className="text-gray-800">{word.clue}</span>
    </div>
  );

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

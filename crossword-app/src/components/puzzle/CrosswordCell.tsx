import { useRef, useEffect } from 'react';

interface CrosswordCellProps {
  row: number;
  col: number;
  value: string;
  number?: number;
  isBlack: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  onChange: (row: number, col: number, value: string) => void;
  onFocus: (row: number, col: number) => void;
  onKeyDown: (e: React.KeyboardEvent, row: number, col: number) => void;
}

export default function CrosswordCell({
  row,
  col,
  value,
  number,
  isBlack,
  isSelected,
  isHighlighted,
  onChange,
  onFocus,
  onKeyDown,
}: CrosswordCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  if (isBlack) {
    return <div className="w-10 h-10 bg-gray-900" />;
  }

  return (
    <div className="relative w-10 h-10">
      {number && (
        <span className="absolute top-0.5 left-0.5 text-[8px] font-semibold text-gray-600 pointer-events-none z-10">
          {number}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        maxLength={1}
        value={value || ''}
        onChange={(e) => onChange(row, col, e.target.value.toUpperCase())}
        onFocus={() => onFocus(row, col)}
        onKeyDown={(e) => onKeyDown(e, row, col)}
        className={`
          w-full h-full border text-center text-lg font-bold uppercase
          focus:outline-none focus:ring-2 focus:ring-primary-500
          ${isSelected ? 'bg-primary-100 border-primary-500 ring-2 ring-primary-500' : ''}
          ${isHighlighted && !isSelected ? 'bg-primary-50 border-primary-300' : ''}
          ${!isSelected && !isHighlighted ? 'bg-white border-gray-300' : ''}
        `}
      />
    </div>
  );
}

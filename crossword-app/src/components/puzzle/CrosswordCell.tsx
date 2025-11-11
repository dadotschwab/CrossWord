import { useRef, useEffect } from 'react';

interface CrosswordCellProps {
  row: number;
  col: number;
  value: string;
  number?: number;
  isBlack: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isError: boolean;
  cellSize: number;
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
  isError,
  cellSize,
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

  const cellStyle = { width: `${cellSize}px`, height: `${cellSize}px` };
  const fontSize = Math.max(12, Math.floor(cellSize * 0.5));
  const numberFontSize = Math.max(8, Math.floor(cellSize * 0.15));

  if (isBlack) {
    return <div style={cellStyle} className="bg-gray-900" />;
  }

  return (
    <div className="relative" style={cellStyle}>
      {number && (
        <span
          className="absolute top-0.5 left-0.5 font-semibold text-gray-600 pointer-events-none z-10"
          style={{ fontSize: `${numberFontSize}px` }}
        >
          {number}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        maxLength={1}
        value={value || ''}
        onChange={(e) => onChange(row, col, e.target.value.toUpperCase())}
        onFocus={(e) => {
          e.target.select(); // Select all text when focused so typing replaces it
          onFocus(row, col);
        }}
        onKeyDown={(e) => onKeyDown(e, row, col)}
        style={{ fontSize: `${fontSize}px` }}
        className={`
          w-full h-full border text-center font-bold uppercase
          focus:outline-none focus:ring-2 focus:ring-primary-500
          ${isError ? 'bg-red-100 border-red-500 text-red-700' : ''}
          ${isSelected && !isError ? 'bg-primary-100 border-primary-500 ring-2 ring-primary-500' : ''}
          ${isHighlighted && !isSelected && !isError ? 'bg-primary-50 border-primary-300' : ''}
          ${!isSelected && !isHighlighted && !isError ? 'bg-white border-gray-300' : ''}
        `}
      />
    </div>
  );
}

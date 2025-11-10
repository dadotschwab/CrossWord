import { useState, useEffect, useRef } from 'react';
import { Modal, Button } from '../ui';

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (word: string, definition: string) => void;
}

interface WordPair {
  word: string;
  definition: string;
}

const MAX_ROWS = 10;

export default function AddWordModal({ open, onClose, onAdd }: AddWordModalProps) {
  const [rows, setRows] = useState<WordPair[]>([
    { word: '', definition: '' },
    { word: '', definition: '' }
  ]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setRows([
        { word: '', definition: '' },
        { word: '', definition: '' }
      ]);
      // Focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

  const handleInputChange = (rowIndex: number, pairIndex: number, field: 'word' | 'definition', value: string) => {
    const newRows = [...rows];
    const absoluteIndex = rowIndex * 2 + pairIndex;

    // Ensure we have enough pairs
    while (newRows.length <= absoluteIndex) {
      newRows.push({ word: '', definition: '' });
    }

    newRows[absoluteIndex][field] = value;
    setRows(newRows);

    // Auto-add new visual row (2 pairs) if both pairs in current row are filled and we're not at max
    const firstPair = newRows[rowIndex * 2];
    const secondPair = newRows[rowIndex * 2 + 1];
    const isRowFilled = firstPair?.word.trim() && firstPair?.definition.trim() &&
                       secondPair?.word.trim() && secondPair?.definition.trim();

    // Check if we're on the last visual row
    const isLastVisualRow = (rowIndex + 1) * 2 === newRows.length;

    if (isRowFilled && isLastVisualRow && newRows.length < MAX_ROWS) {
      setRows([...newRows, { word: '', definition: '' }, { word: '', definition: '' }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, pairIndex: number, field: 'word' | 'definition') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      // Calculate current input index (4 inputs per visual row)
      const currentInput = rowIndex * 4 + pairIndex * 2 + (field === 'word' ? 0 : 1);
      const nextInput = currentInput + 1;

      // Focus next input if it exists
      if (inputRefs.current[nextInput]) {
        inputRefs.current[nextInput]?.focus();
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      // Calculate current input index
      const currentInput = rowIndex * 4 + pairIndex * 2 + (field === 'word' ? 0 : 1);
      const prevInput = currentInput - 1;

      // Focus previous input if it exists
      if (prevInput >= 0 && inputRefs.current[prevInput]) {
        inputRefs.current[prevInput]?.focus();
      }
    }
  };

  const handleSubmit = () => {
    // Filter out empty rows and add all filled words
    const filledRows = rows.filter(row => row.word.trim() && row.definition.trim());

    if (filledRows.length === 0) {
      return;
    }

    // Add each word
    filledRows.forEach(row => {
      onAdd(row.word.trim(), row.definition.trim());
    });

    // Reset and close
    setRows([
      { word: '', definition: '' },
      { word: '', definition: '' }
    ]);
    onClose();
  };

  const handleClose = () => {
    setRows([
      { word: '', definition: '' },
      { word: '', definition: '' }
    ]);
    onClose();
  };

  const hasFilledRows = rows.some(row => row.word.trim() && row.definition.trim());

  // Calculate visual rows (each row has 2 pairs)
  const visualRows: WordPair[][] = [];
  for (let i = 0; i < rows.length; i += 2) {
    visualRows.push([rows[i], rows[i + 1] || { word: '', definition: '' }]);
  }

  return (
    <Modal open={open} onOpenChange={handleClose} title="Add New Words" size="lg">
      <div className="space-y-3">
        {/* Header labels */}
        <div className="grid grid-cols-4 gap-3">
          <label className="text-sm font-medium text-gray-700">Word</label>
          <label className="text-sm font-medium text-gray-700">Definition</label>
          <label className="text-sm font-medium text-gray-700">Word</label>
          <label className="text-sm font-medium text-gray-700">Definition</label>
        </div>

        {/* Input rows - 2 pairs per row */}
        {visualRows.map((rowPairs, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-3">
            {/* First pair */}
            <input
              ref={el => inputRefs.current[rowIndex * 4] = el}
              type="text"
              value={rowPairs[0]?.word || ''}
              onChange={(e) => handleInputChange(rowIndex, 0, 'word', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, 'word')}
              placeholder="e.g., hello"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              ref={el => inputRefs.current[rowIndex * 4 + 1] = el}
              type="text"
              value={rowPairs[0]?.definition || ''}
              onChange={(e) => handleInputChange(rowIndex, 0, 'definition', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, 'definition')}
              placeholder="e.g., greeting"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            {/* Second pair */}
            <input
              ref={el => inputRefs.current[rowIndex * 4 + 2] = el}
              type="text"
              value={rowPairs[1]?.word || ''}
              onChange={(e) => handleInputChange(rowIndex, 1, 'word', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, 1, 'word')}
              placeholder="e.g., goodbye"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              ref={el => inputRefs.current[rowIndex * 4 + 3] = el}
              type="text"
              value={rowPairs[1]?.definition || ''}
              onChange={(e) => handleInputChange(rowIndex, 1, 'definition', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, 1, 'definition')}
              placeholder="e.g., farewell"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        ))}

        {/* Info text */}
        <p className="text-xs text-gray-500 mt-2">
          Fill both word pairs in a row to add more rows. Press Enter to save all words (max {MAX_ROWS}).
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!hasFilledRows}>
            Add {rows.filter(r => r.word.trim() && r.definition.trim()).length > 1
              ? `${rows.filter(r => r.word.trim() && r.definition.trim()).length} Words`
              : 'Word'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

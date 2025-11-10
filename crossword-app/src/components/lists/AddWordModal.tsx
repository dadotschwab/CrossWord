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
  const [rows, setRows] = useState<WordPair[]>([{ word: '', definition: '' }]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setRows([{ word: '', definition: '' }]);
      // Focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

  const handleInputChange = (index: number, field: 'word' | 'definition', value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);

    // Auto-add new row if both fields are filled and we're not at max
    const currentRow = newRows[index];
    if (currentRow.word.trim() && currentRow.definition.trim() && index === rows.length - 1 && rows.length < MAX_ROWS) {
      setRows([...newRows, { word: '', definition: '' }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: 'word' | 'definition') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Handle forward tab navigation
      if (field === 'word') {
        // From word to definition in same row - default behavior
        return;
      } else if (field === 'definition') {
        // From definition to next row's word
        if (index < rows.length - 1) {
          e.preventDefault();
          const nextInputIndex = (index + 1) * 2; // Each row has 2 inputs
          inputRefs.current[nextInputIndex]?.focus();
        }
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      // Handle backward tab navigation
      if (field === 'definition') {
        // From definition to word in same row - default behavior
        return;
      } else if (field === 'word' && index > 0) {
        // From word to previous row's definition
        e.preventDefault();
        const prevInputIndex = (index - 1) * 2 + 1;
        inputRefs.current[prevInputIndex]?.focus();
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
    setRows([{ word: '', definition: '' }]);
    onClose();
  };

  const handleClose = () => {
    setRows([{ word: '', definition: '' }]);
    onClose();
  };

  const hasFilledRows = rows.some(row => row.word.trim() && row.definition.trim());

  return (
    <Modal open={open} onOpenChange={handleClose} title="Add New Words" size="lg">
      <div className="space-y-3">
        {/* Header labels */}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-gray-700">Word</label>
          <label className="text-sm font-medium text-gray-700">Definition / Translation</label>
        </div>

        {/* Input rows */}
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-2 gap-3">
            <input
              ref={el => inputRefs.current[index * 2] = el}
              type="text"
              value={row.word}
              onChange={(e) => handleInputChange(index, 'word', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index, 'word')}
              placeholder="e.g., hello"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              ref={el => inputRefs.current[index * 2 + 1] = el}
              type="text"
              value={row.definition}
              onChange={(e) => handleInputChange(index, 'definition', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index, 'definition')}
              placeholder="e.g., a greeting"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        ))}

        {/* Info text */}
        <p className="text-xs text-gray-500 mt-2">
          Fill both fields to add more rows. Press Enter to save all words (max {MAX_ROWS}).
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


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWordSchema } from '../../utils/validators';
import type { CreateWordFormData } from '../../utils/validators';
import type { Word } from '../../types/database.types';
import { Modal, Input, Button } from '../ui';
import { useEffect } from 'react';

interface EditWordModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: (word: string, definition: string) => void;
  word: Word;
}

export default function EditWordModal({ open, onClose, onEdit, word }: EditWordModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateWordFormData>({
    resolver: zodResolver(createWordSchema),
    defaultValues: {
      word: word.word,
      definition: word.definition,
    },
  });

  // Update form values when word changes
  useEffect(() => {
    reset({
      word: word.word,
      definition: word.definition,
    });
  }, [word, reset]);

  const onSubmit = (data: CreateWordFormData) => {
    onEdit(data.word, data.definition);
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={handleClose} title="Edit Word" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Word"
          placeholder="e.g., hello"
          {...register('word')}
          error={errors.word?.message}
        />

        <Input
          label="Definition / Translation"
          placeholder="e.g., a greeting"
          {...register('definition')}
          error={errors.definition?.message}
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}

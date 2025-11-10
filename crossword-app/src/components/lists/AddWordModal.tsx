import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWordSchema } from '../../utils/validators';
import type { CreateWordFormData } from '../../utils/validators';
import { Modal, Input, Button } from '../ui';

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (word: string, definition: string) => void;
}

export default function AddWordModal({ open, onClose, onAdd }: AddWordModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateWordFormData>({
    resolver: zodResolver(createWordSchema),
  });

  const onSubmit = (data: CreateWordFormData) => {
    onAdd(data.word, data.definition);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={handleClose} title="Add New Word" size="md">
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
          <Button type="submit">Add Word</Button>
        </div>
      </form>
    </Modal>
  );
}

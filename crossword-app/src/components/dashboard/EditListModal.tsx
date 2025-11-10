import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createListSchema } from '../../utils/validators';
import type { CreateListFormData } from '../../utils/validators';
import type { List } from '../../types/database.types';
import { Modal, Input, Select, Button } from '../ui';
import { LANGUAGES } from '../../utils/constants';
import { useEffect } from 'react';

interface EditListModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: (name: string, targetLanguage: string, sourceLanguage: string) => void;
  list: List;
}

export default function EditListModal({ open, onClose, onEdit, list }: EditListModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateListFormData>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      name: list.name,
      target_language: list.target_language,
      source_language: list.source_language,
    },
  });

  // Update form values when list changes
  useEffect(() => {
    reset({
      name: list.name,
      target_language: list.target_language,
      source_language: list.source_language,
    });
  }, [list, reset]);

  const onSubmit = (data: CreateListFormData) => {
    onEdit(data.name, data.target_language, data.source_language);
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const languageOptions = Object.entries(LANGUAGES).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Modal open={open} onOpenChange={handleClose} title="Edit List" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="List Name"
          placeholder="e.g., Spanish Vocabulary A1"
          {...register('name')}
          error={errors.name?.message}
        />

        <Select
          label="Target Language (language you're learning)"
          options={languageOptions}
          {...register('target_language')}
          error={errors.target_language?.message}
        />

        <Select
          label="Source Language (your native language)"
          options={languageOptions}
          {...register('source_language')}
          error={errors.source_language?.message}
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

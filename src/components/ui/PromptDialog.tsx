'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  label: string;
  placeholder?: string;
  confirmLabel?: string;
  danger?: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export const PromptDialog = ({
  isOpen,
  title,
  label,
  placeholder,
  confirmLabel = 'Simpan',
  danger = false,
  onSubmit,
  onCancel,
}: PromptDialogProps) => {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const reset = () => {
    setValue('');
    setTouched(false);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (value.trim()) {
      onSubmit(value.trim());
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const showError = touched && !value.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel}>
            Batal
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={handleSubmit}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
        />
      </label>
      {showError && (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          Kolom ini wajib diisi.
        </p>
      )}
    </Modal>
  );
};

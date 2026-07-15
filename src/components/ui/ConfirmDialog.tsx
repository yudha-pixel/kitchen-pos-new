'use client';

import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="text-sm text-ink-secondary">{message}</p>
  </Modal>
);

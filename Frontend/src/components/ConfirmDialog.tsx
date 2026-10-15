import { Modal } from '@/components/ui';
import { useI18n } from '@/i18n/I18nContext';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isDanger = false,
  loading = false,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex items-start gap-4">
        {isDanger && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-error-600" />
          </div>
        )}
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-primary-800 mb-2">{title}</h3>
          <p className="text-sm text-primary-600 mb-6">{message}</p>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-sand-100">
        <button
          onClick={onClose}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          {cancelText || t('cancel')}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
            isDanger
              ? 'bg-error-600 hover:bg-error-700 disabled:bg-error-400 text-white'
              : 'bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white'
          }`}
        >
          {loading ? '...' : confirmText || t('confirm')}
        </button>
      </div>
    </Modal>
  );
}

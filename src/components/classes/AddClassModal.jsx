import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { addClass, validateClassName, checkDuplicateClassName } from '../../firebase/classes';
import toast from 'react-hot-toast';

export default function AddClassModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [className, setClassName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateClassName(className);
    if (!validation.valid) {
      setError(t(validation.error));
      return;
    }

    setSaving(true);
    try {
      const isDuplicate = await checkDuplicateClassName(className);
      if (isDuplicate) {
        setError(t('modals.errors.studentIdDuplicate', 'Class already exists'));
        setSaving(false);
        return;
      }

      await addClass({ name: className });
      toast.success(t('classes.successAdded'));
      setClassName('');
      onSuccess();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setClassName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('classes.addClass')}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('classes.className')} *
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                if (error) setError('');
              }}
              placeholder={t('classes.classNamePlaceholder')}
              className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Format: grade.number (contoh: 6.1, 7.2, 10.3)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('modals.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
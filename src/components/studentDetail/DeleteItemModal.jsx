import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function DeleteItemModal({ entry, isOpen, onClose, onConfirm, loading }) {
  const { t } = useTranslation();

  if (!isOpen || !entry) return null;

  const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date();
  const formattedDate = format(entryDate, 'MMMM dd, yyyy');

  const formatWeight = (weight) => {
    return (weight || 0).toFixed(2);
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {t('studentDetail.deleteItemTitle')}
          </h2>

          <p className="text-gray-500 mb-4">
            {t('studentDetail.deleteItemWarning')}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-900 font-medium">
              {t('studentDetail.deleteItemDetails', {
                type: entry.wasteTypeName,
                weight: formatWeight(entry.weight),
                amount: formatCurrency(entry.amount),
              })}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {t('studentDetail.deleteItemFrom', { date: formattedDate })}
            </p>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            {t('studentDetail.deleteItemNote')}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t('modals.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                t('common.loading')
              ) : (
                <>
                  {t('studentDetail.confirmDelete')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
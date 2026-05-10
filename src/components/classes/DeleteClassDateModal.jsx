import { useTranslation } from 'react-i18next';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '../../utils/portalHelpers';

export default function DeleteClassDateModal({ dateGroup, isOpen, onClose, onConfirm, loading }) {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      toast.success(t('classDetail.dateEntriesDeleted', { date: new Date(dateGroup.dateKey).toLocaleDateString() }));
    }
  };

  if (!isOpen || !dateGroup) return null;

  const totalWeight = dateGroup.entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = dateGroup.entries.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('classDetail.deleteDateTitle')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">
                {t('classDetail.deleteDateWarning', { date: new Date(dateGroup.dateKey).toLocaleDateString() })}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-600">{t('classDetail.deleteDateDetails')}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('classDetail.deleteDateItems')}</span>
              <span className="font-medium text-gray-900">{dateGroup.entryCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('classDetail.deleteDateWeight')}</span>
              <span className="font-medium text-gray-900">{formatNumber(totalWeight)} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('classDetail.deleteDateEarnings')}</span>
              <span className="font-medium text-green-600">Rp {formatNumber(totalEarnings)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500">{t('classDetail.deleteDateNote')}</p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('modals.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {t('classDetail.confirmDelete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
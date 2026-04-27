import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

export default function StudentHeader({ student, getInitials, onAddEntry }) {
  const { t } = useTranslation();

  if (!student) {
    return null;
  }

  const initials = getInitials(student.name);

  const getClassBadgeColor = (cls) => {
    const colors = {
      '6A': 'bg-green-100 text-green-700',
      '6B': 'bg-blue-100 text-blue-700',
      '6C': 'bg-purple-100 text-purple-700',
      '7A': 'bg-green-100 text-green-700',
      '7B': 'bg-blue-100 text-blue-700',
      '7C': 'bg-purple-100 text-purple-700',
    };
    return colors[cls] || 'bg-gray-100 text-gray-700';
  };

  const formatWeight = (weight) => {
    const w = weight || 0;
    return w.toFixed(2);
  };

  const formatCurrency = (amount) => {
    const a = amount || 0;
    return a.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 truncate max-w-[300px]">
                {student.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getClassBadgeColor(student.class)}`}
              >
                {student.class}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {t('common.rollNoLabel')} {student.rollNo}
            </p>
            {student.createdAt && (
              <p className="text-gray-400 text-sm">
                {t('common.joinedOn', { date: formatDate(student.createdAt) })}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-blue-50 rounded-lg px-4 py-3 min-w-[140px] border border-blue-100">
            <p className="text-blue-600 text-sm font-medium">{t('studentDetail.totalWaste')}</p>
            <p className="text-xl font-bold text-blue-700">{formatWeight(student.totalWaste)} kg</p>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-3 min-w-[140px] border border-green-100">
            <p className="text-green-600 text-sm font-medium">{t('studentDetail.totalEarnings')}</p>
            <p className="text-xl font-bold text-green-700">Rp{formatCurrency(student.totalEarnings)}</p>
          </div>
          <button
            onClick={onAddEntry}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('studentDetail.addWasteEntry')}
          </button>
        </div>
      </div>
    </div>
  );
}
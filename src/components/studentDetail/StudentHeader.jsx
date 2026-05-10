import { useTranslation } from 'react-i18next';
import { formatDateShort } from '../../utils/dateHelpers';
import { formatNumber } from '../../utils/portalHelpers';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { getInitials, getClassGradient } from '../../utils/studentUtils';
import StudentAvatar from '../ui/StudentAvatar';

export default function StudentHeader({ student, getInitials: getInit, onAddEntry }) {
  const { t } = useTranslation();

  if (!student) {
    return null;
  }

  const initials = getInit ? getInit(student.name) : getInitials(student.name);
  const classGradient = getClassGradient(student.class);

  const formatWeight = (weight) => {
    return formatNumber(weight || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return formatDateShort(timestamp);
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-2 border-green-600/60 p-4 md:p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <StudentAvatar name={student.name} cls={student.class} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate max-w-[200px] md:max-w-[300px]">
                  {student.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${classGradient} text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                  {student.class}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                <span>ID: {student.studentId}</span>
                <span className="text-gray-300">•</span>
                <span>{t('common.joinedOn', { date: formatDate(student.createdAt) })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl px-3 md:px-4 py-2 md:py-3 min-w-[120px] md:min-w-[140px] border border-blue-200/50 shadow-md shadow-blue-100/50 hover:shadow-lg hover:shadow-blue-100/70 hover:scale-105 transition-all duration-300 cursor-default">
              <p className="text-blue-600 text-xs md:text-sm font-medium">{t('studentDetail.totalWaste')}</p>
              <p className="text-lg md:text-xl font-bold text-blue-700">{formatWeight(student.totalWaste)} kg</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl px-3 md:px-4 py-2 md:py-3 min-w-[120px] md:min-w-[140px] border border-green-200/50 shadow-md shadow-green-100/50 hover:shadow-lg hover:shadow-green-100/70 hover:scale-105 transition-all duration-300 cursor-default">
              <p className="text-green-600 text-xs md:text-sm font-medium">{t('studentDetail.totalEarnings')}</p>
              <p className="text-lg md:text-xl font-bold text-green-700">Rp{formatCurrency(student.totalEarnings)}</p>
            </div>
            <button
              onClick={onAddEntry}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-medium transition-all duration-300 text-sm md:text-base shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-200/60 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              {t('studentDetail.addWasteEntry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
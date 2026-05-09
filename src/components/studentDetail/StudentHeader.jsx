import { useTranslation } from 'react-i18next';
import { formatDateShort } from '../../utils/dateHelpers';
import { Plus, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const avatarColorSchemes = [
  { from: 'from-amber-100', to: 'to-orange-200', text: 'text-amber-700', ring: 'ring-amber-400/30', shadow: 'shadow-amber-200/50' },
  { from: 'from-sky-100', to: 'to-blue-200', text: 'text-sky-700', ring: 'ring-sky-400/30', shadow: 'shadow-sky-200/50' },
  { from: 'from-rose-100', to: 'to-pink-200', text: 'text-rose-700', ring: 'ring-rose-400/30', shadow: 'shadow-rose-200/50' },
  { from: 'from-violet-100', to: 'to-purple-200', text: 'text-violet-700', ring: 'ring-violet-400/30', shadow: 'shadow-violet-200/50' },
  { from: 'from-teal-100', to: 'to-cyan-200', text: 'text-teal-700', ring: 'ring-teal-400/30', shadow: 'shadow-teal-200/50' },
  { from: 'from-emerald-100', to: 'to-green-200', text: 'text-emerald-700', ring: 'ring-emerald-400/30', shadow: 'shadow-emerald-200/50' },
  { from: 'from-lime-100', to: 'to-emerald-200', text: 'text-lime-700', ring: 'ring-lime-400/30', shadow: 'shadow-lime-200/50' },
  { from: 'from-fuchsia-100', to: 'to-pink-200', text: 'text-fuchsia-700', ring: 'ring-fuchsia-400/30', shadow: 'shadow-fuchsia-200/50' },
  { from: 'from-indigo-100', to: 'to-blue-200', text: 'text-indigo-700', ring: 'ring-indigo-400/30', shadow: 'shadow-indigo-200/50' },
  { from: 'from-cyan-100', to: 'to-sky-200', text: 'text-cyan-700', ring: 'ring-cyan-400/30', shadow: 'shadow-cyan-200/50' },
  { from: 'from-orange-100', to: 'to-amber-200', text: 'text-orange-700', ring: 'ring-orange-400/30', shadow: 'shadow-orange-200/50' },
  { from: 'from-slate-100', to: 'to-gray-200', text: 'text-slate-700', ring: 'ring-slate-400/30', shadow: 'shadow-slate-200/50' },
];

const getAvatarColor = (name, cls) => {
  if (!name || !cls) return avatarColorSchemes[0];
  const str = `${name}${cls}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColorSchemes.length;
  return avatarColorSchemes[index];
};

export default function StudentHeader({ student, getInitials, onAddEntry }) {
  const { t } = useTranslation();

  if (!student) {
    return null;
  }

  const initials = getInitials(student.name);
  const avatarColor = getAvatarColor(student.name, student.class);

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

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return formatDateShort(timestamp);
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-4 md:p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`w-14 h-14 md:w-18 md:h-18 rounded-2xl bg-gradient-to-br ${avatarColor.from} ${avatarColor.to} flex items-center justify-center shadow-lg ${avatarColor.shadow} ring-4 ${avatarColor.ring} transition-transform duration-300 hover:scale-105`}>
            <span className={`text-lg md:text-xl font-bold ${avatarColor.text}`}>{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate max-w-[200px] md:max-w-[300px]">
                {student.name}
              </h1>
              <span
                className={`px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium ${getClassBadgeColor(student.class)}`}
              >
                {student.class}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {t('common.studentIdLabel')} {student.studentId}
            </p>
            {student.createdAt && (
              <p className="text-gray-400 text-sm">
                {t('common.joinedOn', { date: formatDate(student.createdAt) })}
              </p>
            )}
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
  );
}
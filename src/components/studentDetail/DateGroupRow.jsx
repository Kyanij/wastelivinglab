import { useTranslation } from 'react-i18next';
import { formatDateShort } from '../../utils/dateHelpers';
import { formatNumber } from '../../utils/portalHelpers';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import EntrySubTable from './EntrySubTable';

const DATE_COLORS = [
  { bg: 'from-emerald-50 to-green-100', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  { bg: 'from-green-50 to-emerald-100', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-500' },
  { bg: 'from-teal-50 to-green-100', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-500' },
  { bg: 'from-emerald-50 to-teal-100', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-500' },
  { bg: 'from-green-50 to-lime-100', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-500' },
  { bg: 'from-teal-50 to-emerald-100', border: 'border-teal-200', text: 'text-teal-600', badge: 'bg-teal-500' },
  { bg: 'from-emerald-50 to-green-100', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
];

export default function DateGroupRow({
  dateGroup,
  colorIndex = 0,
  isExpanded,
  onToggle,
  onEditDate,
  onDeleteDate,
  onEditItem,
  onDeleteItem,
}) {
  const { t } = useTranslation();
  const colors = DATE_COLORS[colorIndex % DATE_COLORS.length];

  const formatDate = (date) => {
    const d = date.date ? date.date : date.dateKey;
    return formatDateShort(d);
  };

  const formatWeight = (weight) => {
    return formatNumber(weight || 0);
  };

  const entryCount = dateGroup.entryCount ?? dateGroup.entries?.length ?? 0;
  const entryCountText =
    entryCount === 1
      ? `1 ${t('studentDetail.entries').slice(0, -1)}`
      : `${entryCount} ${t('studentDetail.entries')}`;

  return (
    <div className={`group bg-gradient-to-r ${colors.bg} rounded-2xl border ${colors.border} shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}>
      <div
        className="flex items-center justify-between p-3 md:p-4 cursor-pointer transition-all duration-300"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/60 shadow-sm transition-all duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            {isExpanded ? (
              <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 ${colors.text}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 ${colors.text} transition-colors`} />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-sm md:text-base ${colors.text} tracking-tight`}>
              {formatDate(dateGroup)}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-600 transition-colors">{entryCountText}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">{t('studentDetail.totalWeightHeader')}</p>
            <p className="font-bold text-gray-800 text-sm md:text-base">{formatWeight(dateGroup.totalWeight)} kg</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{t('studentDetail.totalEarningsHeader')}</p>
            <p className={`font-bold text-sm md:text-base ${colors.text.replace('700', '600')}`}>Rp {formatNumber(dateGroup.totalEarnings)}</p>
          </div>
          {(onEditDate && onDeleteDate) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => { e.stopPropagation(); onEditDate(dateGroup); }}
                className="pointer-events-auto relative z-10 flex items-center justify-center gap-1.5 p-2 text-sm font-medium text-indigo-600 bg-indigo-50/50 border border-indigo-200/50 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteDate(dateGroup); }}
                className="pointer-events-auto relative z-10 flex items-center justify-center gap-1.5 p-2 text-sm font-medium text-red-600 bg-red-50/50 border border-red-200/50 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-lg hover:shadow-red-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-white/40 p-3 md:p-4 bg-white/50">
          <EntrySubTable
            entries={dateGroup.entries}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            dateGroup={dateGroup}
          />
        </div>
      )}
    </div>
  );
}
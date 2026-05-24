import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import { formatNumber } from '../../utils/portalHelpers';
import DateGroupRow from './DateGroupRow';

export default function HistoryTable({
  dateGroups,
  isExpanded,
  onToggle,
  onEditDate,
  onDeleteDate,
  onEditItem,
  onDeleteItem,
  filteredTotalWeight,
  filteredTotalEarnings,
  hasActiveFilters,
}) {
  const { t } = useTranslation();

  if (!dateGroups || dateGroups.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/50 p-8 md:p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
          <Package className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg mb-2">
          {t('studentDetail.emptyState')}
        </h3>
        <p className="text-gray-500 text-sm">{t('studentDetail.emptyStateHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dateGroups.map((dateGroup, index) => (
        <DateGroupRow
          key={dateGroup.dateKey}
          dateGroup={dateGroup}
          colorIndex={index}
          isExpanded={isExpanded(dateGroup.dateKey)}
          onToggle={() => onToggle(dateGroup.dateKey)}
          onEditDate={() => onEditDate(dateGroup)}
          onDeleteDate={() => onDeleteDate(dateGroup)}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      ))}
      {dateGroups.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-4 md:p-5 text-white shadow-xl shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white/80 text-xs md:text-sm font-medium">{t('common.total')}</p>
                <p className="text-lg md:text-xl font-bold">{dateGroups.length} {dateGroups.length === 1 ? 'day' : 'days'} of entries</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs md:text-sm">{formatNumber(filteredTotalWeight || 0)} kg total waste</p>
              <p className="text-xl md:text-2xl font-bold">Rp {formatNumber(filteredTotalEarnings || 0)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
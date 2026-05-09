import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
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
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden">
      <div className="border-b border-gray-100/50 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex items-center px-3 md:px-4 py-3 md:py-4 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
            <div className="w-[10%]"></div>
            <div className="w-[20%]">{t('studentDetail.date')}</div>
            <div className="w-[20%] text-right">
              {t('studentDetail.totalWeightHeader')}
            </div>
            <div className="w-[20%] text-right">
              {t('studentDetail.totalEarningsHeader')}
            </div>
            <div className="w-[20%]">{t('studentDetail.entries')}</div>
            <div className="w-[10%]"></div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {dateGroups.map((dateGroup) => (
            <DateGroupRow
              key={dateGroup.dateKey}
              dateGroup={dateGroup}
              isExpanded={isExpanded(dateGroup.dateKey)}
              onToggle={() => onToggle(dateGroup.dateKey)}
              onEditDate={onEditDate}
              onDeleteDate={onDeleteDate}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100/50 overflow-x-auto">
          <div className="min-w-[600px] flex items-center px-3 md:px-4 py-3 md:py-4">
            <div className="w-[10%]"></div>
            <div className="w-[20%]">
              <span className="text-sm md:text-base font-bold text-orange-700">
                {t('common.total')}
              </span>
            </div>
            <div className="w-[20%] text-right">
              <span className="text-sm md:text-base font-bold text-gray-900">
                {(filteredTotalWeight || 0).toFixed(2)} kg
              </span>
            </div>
            <div className="w-[20%] text-right">
              <span className="text-sm md:text-base font-bold text-green-600">
                Rp{(filteredTotalEarnings || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-[20%]"></div>
            <div className="w-[10%]"></div>
          </div>
        </div>
      )}
    </div>
  );
}
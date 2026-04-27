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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 font-medium mb-2">
          {t('studentDetail.emptyState')}
        </h3>
        <p className="text-gray-500 text-sm">{t('studentDetail.emptyStateHint')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100">
        <div className="flex items-center px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
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

      <div>
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

      {hasActiveFilters && (
        <div className="bg-orange-50 border-t border-orange-100 px-4 py-3">
          <div className="flex items-center">
            <div className="w-[10%]"></div>
            <div className="w-[20%]">
              <span className="text-base font-bold text-orange-700">
                {t('common.total')}
              </span>
            </div>
            <div className="w-[20%] text-right">
              <span className="text-base font-bold text-gray-900">
                {(filteredTotalWeight || 0).toFixed(2)} kg
              </span>
            </div>
            <div className="w-[20%] text-right">
              <span className="text-base font-bold text-green-600">
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
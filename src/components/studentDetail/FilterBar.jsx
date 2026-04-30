import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { useWasteTypes } from '../../hooks/useWasteTypes';
import EnhancedDateRangePicker from '../../components/reports/EnhancedDateRangePicker';

export default function FilterBar({ filters, setFilters, hasActiveFilters, resetFilters, dateRange, onDateRangeChange }) {
  const { t } = useTranslation();
  const { wasteTypes } = useWasteTypes();

  const handleDateRangeChangeInternal = (from, to) => {
    if (onDateRangeChange) {
      onDateRangeChange(from, to);
    }
    setFilters((prev) => ({
      ...prev,
      dateFrom: from instanceof Date ? from.toISOString().split('T')[0] : from,
      dateTo: to instanceof Date ? to.toISOString().split('T')[0] : to,
    }));
  };

  const handleWasteTypeChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      wasteTypeId: value,
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <EnhancedDateRangePicker
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChangeInternal}
        />
        
        <div className="hidden lg:block w-px h-8 bg-gray-200" />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.wasteTypeId}
            onChange={handleWasteTypeChange}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[150px]"
          >
            <option value="all">{t('studentDetail.allWasteTypes')}</option>
            {wasteTypes.map((wt) => (
              <option key={wt.id} value={wt.id}>
                {wt.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.reset')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
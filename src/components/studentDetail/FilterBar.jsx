import { useTranslation } from 'react-i18next';
import { Calendar, Download, RotateCcw } from 'lucide-react';
import { useWasteTypes } from '../../hooks/useWasteTypes';
import toast from 'react-hot-toast';

export default function FilterBar({ filters, setFilters, hasActiveFilters, resetFilters }) {
  const { t } = useTranslation();
  const { wasteTypes } = useWasteTypes();

  const handleDateFromChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      dateFrom: value,
    }));
  };

  const handleDateToChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      dateTo: value,
    }));
  };

  const handleWasteTypeChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      wasteTypeId: value,
    }));
  };

  const handleExport = () => {
    toast.success('Coming soon!');
  };

  const isDateFromAfterDateTo = () => {
    if (filters.dateFrom && filters.dateTo) {
      return new Date(filters.dateFrom) > new Date(filters.dateTo);
    }
    return false;
  };

  const dateError = isDateFromAfterDateTo();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={handleDateFromChange}
            className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              dateError ? 'border-red-500' : 'border-gray-200'
            }`}
          />
        </div>

        <span className="text-gray-400">-</span>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateTo}
            onChange={handleDateToChange}
            className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              dateError ? 'border-red-500' : 'border-gray-200'
            }`}
          />
        </div>

        <select
          value={filters.wasteTypeId}
          onChange={handleWasteTypeChange}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">{t('studentDetail.allWasteTypes')}</option>
          {wasteTypes.map((wt) => (
            <option key={wt.id} value={wt.id}>
              {wt.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('studentDetail.export')}
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t('studentDetail.resetFilters')}
          </button>
        )}
      </div>

      {dateError && (
        <p className="text-red-500 text-sm mt-2">
          {t('studentDetail.dateFrom')} cannot be after {t('studentDetail.to')}
        </p>
      )}
    </div>
  );
}
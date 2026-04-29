import { useTranslation } from 'react-i18next';
import { Download, RefreshCw, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function PageHeader({ 
  title, 
  description,
  dateRange, 
  onDateRangeChange,
  showClassFilter = false,
  showWasteTypeFilter = false,
  classes = [],
  wasteTypes = [],
  selectedClass = 'all',
  selectedWasteType = 'all',
  onClassChange,
  onWasteTypeChange,
  onRefresh,
  onExport
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A6B3C] text-white rounded-xl font-medium hover:bg-[#15803d] transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('reports.exportPDF')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={format(dateRange.from, 'yyyy-MM-dd')}
            onChange={(e) => onDateRangeChange(new Date(e.target.value), dateRange.to)}
            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
          />
          <span className="text-gray-400">–</span>
          <input
            type="date"
            value={format(dateRange.to, 'yyyy-MM-dd')}
            onChange={(e) => onDateRangeChange(dateRange.from, new Date(e.target.value))}
            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
          />
        </div>

        {showClassFilter && (
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">{t('reports.allClasses')}</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        )}

        {showWasteTypeFilter && (
          <select
            value={selectedWasteType}
            onChange={(e) => onWasteTypeChange(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">{t('reports.allWasteTypes')}</option>
            {wasteTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
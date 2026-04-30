import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export default function FilterBar({ filters, onFiltersChange, classes, wasteTypes }) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState({
    dateFrom: filters.dateFrom || null,
    dateTo: filters.dateTo || null,
    studentClass: filters.studentClass || 'all',
    wasteType: filters.wasteType || 'all',
  });

  const isAllTime = !localFilters.dateFrom && !localFilters.dateTo;

  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
      studentClass: filters.studentClass || 'all',
      wasteType: filters.wasteType || 'all',
    }));
  }, [filters]);

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    if (key === 'dateFrom' || key === 'dateTo') {
      updated.dateFrom = updated.dateFrom || null;
      updated.dateTo = updated.dateTo || null;
    }
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleAllTimeToggle = (checked) => {
    if (checked) {
      const updated = { ...localFilters, dateFrom: null, dateTo: null };
      setLocalFilters(updated);
      onFiltersChange(updated);
    } else {
      const updated = { ...localFilters, dateFrom: startOfMonth(new Date()), dateTo: endOfMonth(new Date()) };
      setLocalFilters(updated);
      onFiltersChange(updated);
    }
  };

  const handleReset = () => {
    const defaultFilters = {
      dateFrom: null,
      dateTo: null,
      studentClass: 'all',
      wasteType: 'all',
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white shadow-sm p-3 md:p-4 mb-4 md:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="p-2 rounded-xl bg-gray-100">
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          <label className="flex items-center gap-2 h-10 px-3 border border-gray-200 rounded-xl bg-white cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={isAllTime}
              onChange={(e) => handleAllTimeToggle(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 hidden sm:inline">All Time</span>
          </label>
          <div className={`flex items-center gap-2 ${isAllTime ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="date"
              value={localFilters.dateFrom ? format(localFilters.dateFrom, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleChange('dateFrom', new Date(e.target.value))}
              disabled={isAllTime}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:bg-gray-100"
            />
            <span className="text-gray-400 text-sm hidden sm:inline">to</span>
            <input
              type="date"
              value={localFilters.dateTo ? format(localFilters.dateTo, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleChange('dateTo', new Date(e.target.value))}
              disabled={isAllTime}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="hidden lg:block w-px h-8 bg-gray-200" />

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Select value={localFilters.studentClass} onValueChange={(v) => handleChange('studentClass', v)}>
            <SelectTrigger className="w-[130px] md:w-[140px] h-10">
              <SelectValue placeholder={t('students.allClasses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('students.allClasses')}</SelectItem>
              {classes.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localFilters.wasteType} onValueChange={(v) => handleChange('wasteType', v)}>
            <SelectTrigger className="w-[130px] md:w-[160px] h-10">
              <SelectValue placeholder="All Waste Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Waste Types</SelectItem>
              {wasteTypes.map(wt => (
                <SelectItem key={wt.id} value={wt.name}>{wt.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-500 hover:text-gray-700">
            <Filter className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
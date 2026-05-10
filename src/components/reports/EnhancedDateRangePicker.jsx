import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  subDays,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  addMonths,
  startOfYear,
  endOfYear
} from 'date-fns';
import { id } from 'date-fns/locale';
import ExportPDFButton from './ExportPDFButton';

const presets = [
  { key: 'today', label: 'reports.today', days: 0 },
  { key: 'yesterday', label: 'reports.yesterday', days: -1 },
  { key: 'last7days', label: 'reports.last7Days', days: 7 },
  { key: 'last30days', label: 'reports.last30Days', days: 30 },
  { key: 'thisMonth', label: 'reports.thisMonth', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { key: 'lastMonth', label: 'reports.lastMonth', getValue: () => { 
    const lastMonth = subMonths(new Date(), 1);
    return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
  }},
  { key: 'thisYear', label: 'reports.thisYear', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
];

export default function EnhancedDateRangePicker({ dateRange, onDateRangeChange, onRefresh, pdfData, filters, reportType, classDropdown, classValue, classOnChange }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dateRange.from);
  const [selecting, setSelecting] = useState('from');
  const [tempRange, setTempRange] = useState({ from: dateRange.from, to: dateRange.to });
  const locale = i18n.language === 'id' ? id : undefined;

  useEffect(() => {
    setTempRange({ from: dateRange.from, to: dateRange.to });
  }, [dateRange]);

  const handlePreset = (preset) => {
    let newRange;
    if (preset.getValue) {
      newRange = preset.getValue();
    } else {
      const today = new Date();
      if (preset.days === 0) {
        newRange = { from: startOfDay(today), to: endOfDay(today) };
      } else if (preset.days === -1) {
        const yesterday = subDays(today, 1);
        newRange = { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      } else {
        newRange = { from: subDays(today, preset.days - 1), to: today };
      }
    }
    setTempRange(newRange);
    onDateRangeChange(newRange.from, newRange.to);
    setIsOpen(false);
  };

  const handleDayClick = (day) => {
    if (selecting === 'from') {
      setTempRange({ from: day, to: day });
      setSelecting('to');
    } else {
      if (day < tempRange.from) {
        setTempRange({ from: day, to: day });
        setSelecting('from');
      } else {
        const newRange = { from: tempRange.from, to: day };
        setTempRange(newRange);
        onDateRangeChange(newRange.from, newRange.to);
        setIsOpen(false);
        setSelecting('from');
      }
    }
  };

  const handleApply = () => {
    onDateRangeChange(tempRange.from, tempRange.to);
    setIsOpen(false);
  };

  const renderCalendar = (monthOffset = 0) => {
    const monthStart = addMonths(currentMonth, monthOffset);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
    
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = new Date(day);
      day.setDate(day.getDate() + 1);
    }

    const weekDays = i18n.language === 'id' 
      ? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
      : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    return (
      <div className="w-64">
        <div className="text-center text-sm font-semibold text-gray-700 mb-2">
          {format(monthStart, 'MMMM yyyy', { locale })}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const isCurrentMonth = isSameMonth(d, monthStart);
            const isSelected = (selecting === 'from' && isSameDay(d, tempRange.from)) || 
                              (selecting === 'to' && isSameDay(d, tempRange.to));
            const isInRange = isWithinInterval(d, { start: tempRange.from, end: tempRange.to });
            const isToday = isSameDay(d, new Date());
            
            return (
              <button
                key={i}
                onClick={() => isCurrentMonth && handleDayClick(d)}
                disabled={!isCurrentMonth}
                className={`
                  w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200
                  ${!isCurrentMonth ? 'text-gray-200 cursor-default' : ''}
                  ${isCurrentMonth && !isSelected && !isInRange ? 'text-gray-600 hover:bg-gray-100' : ''}
                  ${isSelected ? 'bg-primary text-white shadow-md scale-105' : ''}
                  ${isInRange && !isSelected ? 'bg-primary/10 text-primary' : ''}
                  ${isToday && !isSelected ? 'ring-2 ring-primary/30' : ''}
                `}
              >
                {format(d, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Display Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-xs text-gray-500 font-medium">{t('reports.dateRange')}</div>
              <div className="text-sm font-semibold text-gray-900">
                {format(tempRange.from, 'MMM d, yyyy', { locale })} – {format(tempRange.to, 'MMM d, yyyy', { locale })}
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            {presets.slice(0, 4).map((preset) => (
              <button
                key={preset.key}
                onClick={() => handlePreset(preset)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
              >
                {t(preset.label)}
              </button>
            ))}
          </div>

          {/* Class Dropdown (if provided) */}
          {classDropdown && (
            <div className="relative">
              <select
                value={classValue}
                onChange={classOnChange}
                className="appearance-none w-[140px] px-3 py-1.5 pr-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 cursor-pointer hover:border-green-300/50 transition-all duration-200"
              >
                <option value="all">{t('students.allClasses')}</option>
                {classDropdown.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Refresh Button - moved to right */}
          <div className="ml-auto flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary/30 transition-all duration-200 group"
                title={t('common.refresh')}
              >
                <svg className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            {pdfData && (
              <ExportPDFButton
                reportType={reportType || 'overview'}
                data={pdfData}
                filters={filters}
              />
            )}
          </div>
        </div>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-start gap-6">
              {/* Presets List */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                  {t('reports.quickSelect')}
                </div>
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePreset(preset)}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    {t(preset.label)}
                  </button>
                ))}
              </div>

              {/* Calendar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                {renderCalendar(0)}
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Selection Indicator */}
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t('reports.selectedRange')}
                </div>
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/5 to-emerald-50 rounded-xl border border-primary/20">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-gray-800">
                    {format(tempRange.from, 'MMM d', { locale })} – {format(tempRange.to, 'MMM d, yyyy', { locale })}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({Math.ceil((tempRange.to - tempRange.from) / (1000 * 60 * 60 * 24)) + 1} {t('reports.days')})
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleApply}
                    className="flex-1 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    {t('common.apply')}
                  </button>
                  <button
                    onClick={() => {
                      setTempRange({ from: dateRange.from, to: dateRange.to });
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>

            {selecting === 'to' && (
              <div className="mt-3 text-xs text-primary font-medium bg-primary/5 px-3 py-2 rounded-lg">
                ← {t('reports.selectEndDate')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


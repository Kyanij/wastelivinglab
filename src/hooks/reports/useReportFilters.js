import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { startOfMonth, endOfMonth, subMonths, format, isValid, parseISO } from 'date-fns';

export function useReportFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getInitialDates = () => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    const fromDate = from && isValid(parseISO(from)) ? parseISO(from) : startOfMonth(new Date());
    const toDate = to && isValid(parseISO(to)) ? parseISO(to) : endOfMonth(new Date());
    
    return { from: fromDate, to: toDate };
  };

  const [dateRange, setDateRange] = useState(getInitialDates);
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || 'all');
  const [selectedWasteType, setSelectedWasteType] = useState(searchParams.get('type') || 'all');

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('from', format(dateRange.from, 'yyyy-MM-dd'));
    params.set('to', format(dateRange.to, 'yyyy-MM-dd'));
    if (selectedClass !== 'all') params.set('class', selectedClass);
    if (selectedWasteType !== 'all') params.set('type', selectedWasteType);
    setSearchParams(params, { replace: true });
  }, [dateRange, selectedClass, selectedWasteType, setSearchParams]);

  const comparisonRange = useMemo(() => {
    const diff = dateRange.to.getTime() - dateRange.from.getTime();
    const to = subMonths(dateRange.from, 1);
    const from = new Date(to.getTime() - diff);
    return { from, to };
  }, [dateRange]);

  const updateDateRange = (from, to) => {
    setDateRange({ from, to });
  };

  const updateClass = (cls) => {
    setSelectedClass(cls);
  };

  const updateWasteType = (type) => {
    setSelectedWasteType(type);
  };

  const resetFilters = () => {
    setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    setSelectedClass('all');
    setSelectedWasteType('all');
  };

  return {
    dateRange,
    comparisonRange,
    selectedClass,
    selectedWasteType,
    updateDateRange,
    updateClass,
    updateWasteType,
    resetFilters,
  };
}

export function formatDateRange(from, to) {
  return `${format(from, 'MMM d, yyyy')} – ${format(to, 'MMM d, yyyy')}`;
}

export function formatComparisonPeriod(from, to) {
  return `vs ${format(from, 'MMM d')} – ${format(to, 'MMM d')}`;
}
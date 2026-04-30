import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { startOfMonth, endOfMonth, subMonths, format, isValid, parseISO } from 'date-fns';

export function useReportFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInteracted = useRef(false);

  const getInitialDates = () => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (from && to) {
      hasInteracted.current = true;
    }

    const fromDate = from && isValid(parseISO(from)) ? parseISO(from) : startOfMonth(new Date());
    const toDate = to && isValid(parseISO(to)) ? parseISO(to) : endOfMonth(new Date());

    return { from: fromDate, to: toDate };
  };

  const [dateRange, setDateRange] = useState(getInitialDates);
  const [selectedClass, setSelectedClass] = useState(() => {
    const cls = searchParams.get('class');
    if (cls) hasInteracted.current = true;
    return cls || 'all';
  });
  const [selectedWasteType, setSelectedWasteType] = useState(() => {
    const type = searchParams.get('type');
    if (type) hasInteracted.current = true;
    return type || 'all';
  });

  useEffect(() => {
    if (!hasInteracted.current) return;

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
    hasInteracted.current = true;
    setDateRange({ from, to });
  };

  const updateClass = (cls) => {
    hasInteracted.current = true;
    setSelectedClass(cls);
  };

  const updateWasteType = (type) => {
    hasInteracted.current = true;
    setSelectedWasteType(type);
  };

  const resetFilters = () => {
    hasInteracted.current = true;
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
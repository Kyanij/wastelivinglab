import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClassById, getEntriesByClassId } from '../../firebase/classes';

const toLocalDateString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useClassDetail(classId) {
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const doFetch = async () => {
      try {
        const classResult = await getClassById(classId);
        
        if (!isMounted) return;
        
        if (!classResult) {
          setError('Class not found');
          setLoading(false);
          navigate('/classes', { replace: true });
          return;
        }
        
        setClassData(classResult);

        const entriesList = await getEntriesByClassId(classId);
        
        if (!isMounted) return;
        
        const sortedEntries = (entriesList || []).sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
          return dateB - dateA;
        });
        
        setEntries(sortedEntries);
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error loading data');
          setLoading(false);
        }
      }
    };

    doFetch();
    
    return () => { isMounted = false; };
  }, [classId, navigate]);

  const refetch = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const classResult = await getClassById(classId);
      if (!classResult) {
        setError('Class not found');
        setLoading(false);
        return;
      }
      setClassData(classResult);

      const entriesList = await getEntriesByClassId(classId);
      const sortedEntries = (entriesList || []).sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
        return dateB - dateA;
      });
      setEntries(sortedEntries);
    } catch (err) {
      setError(err.message || 'Error reloading data');
    } finally {
      setLoading(false);
    }
  };

  return { classData, entries, loading, error, refetch, toLocalDateString };
}

export function useFilters() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const defaultDateFrom = toLocalDateString(firstDayOfMonth);
  const defaultDateTo = toLocalDateString(today);

  const [filters, setFilters] = useState({
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
    wasteTypeId: 'all',
  });

  const hasActiveFilters = filters.dateFrom !== defaultDateFrom || filters.dateTo !== defaultDateTo || filters.wasteTypeId !== 'all';

  const resetFilters = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setFilters({
      dateFrom: toLocalDateString(firstDayOfMonth),
      dateTo: toLocalDateString(today),
      wasteTypeId: 'all',
    });
  };

  return { filters, setFilters, hasActiveFilters, resetFilters, defaultDateFrom, defaultDateTo };
}

export function filterEntries(entries, filters) {
  return entries.filter((entry) => {
    const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date);
    const entryDateStr = toLocalDateString(entryDate);
    
    if (filters.dateFrom) {
      if (entryDateStr < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      if (entryDateStr > filters.dateTo) return false;
    }
    if (filters.wasteTypeId !== 'all' && entry.wasteTypeId !== filters.wasteTypeId) return false;
    return true;
  });
}

export function groupEntriesByDate(entries) {
  const grouped = entries.reduce((acc, entry) => {
    const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date);
    const key = toLocalDateString(entryDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map((dateKey) => {
    const dateEntries = grouped[dateKey];
    return {
      dateKey,
      date: new Date(dateKey),
      entries: dateEntries,
      totalWeight: dateEntries.reduce((sum, e) => sum + (e.weight || 0), 0),
      totalEarnings: dateEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
      entryCount: dateEntries.length,
    };
  });
}

export function useExpandedDates() {
  const [expandedDates, setExpandedDates] = useState(new Set());

  const toggleDate = (dateKey) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      next.has(dateKey) ? next.delete(dateKey) : next.add(dateKey);
      return next;
    });
  };

  const isExpanded = (dateKey) => expandedDates.has(dateKey);
  const expandAll = (dateKeys) => setExpandedDates(new Set(dateKeys));
  const collapseAll = () => setExpandedDates(new Set());

  return { expandedDates, toggleDate, isExpanded, expandAll, collapseAll };
}
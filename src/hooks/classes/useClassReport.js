import { useState, useEffect, useMemo } from 'react';
import { getAllClassWasteEntries, getAllClasses } from '../../firebase/classes';
import { format, startOfWeek } from 'date-fns';

export function useClassReport(filters = {}) {
  const [classEntries, setClassEntries] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [entriesData, classesData] = await Promise.all([
          getAllClassWasteEntries(),
          getAllClasses(),
        ]);
        setClassEntries(entriesData);
        setAllClasses(classesData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredEntries = useMemo(() => {
    let result = classEntries;
    if (filters.dateFrom) {
      result = result.filter(e => {
        if (!e.date) return false;
        const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
        return d >= filters.dateFrom;
      });
    }
    if (filters.dateTo) {
      result = result.filter(e => {
        if (!e.date) return false;
        const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
        return d <= filters.dateTo;
      });
    }
    if (filters.classFilter && filters.classFilter !== 'all') {
      result = result.filter(e => e.className === filters.classFilter);
    }
    return result;
  }, [classEntries, filters]);

  const kpis = useMemo(() => {
    const totalWaste = filteredEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const totalEarnings = filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalEntries = filteredEntries.length;
    const avgPerEntry = totalEntries > 0 ? totalWaste / totalEntries : 0;
    return { totalWaste, totalEarnings, totalEntries, avgPerEntry };
  }, [filteredEntries]);

  const wasteByClass = useMemo(() => {
    const map = {};
    filteredEntries.forEach(e => {
      const cls = e.className || 'Unknown';
      if (!map[cls]) map[cls] = { weight: 0, earnings: 0 };
      map[cls].weight += e.weight || 0;
      map[cls].earnings += e.amount || 0;
    });
    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        value: Math.round(data.weight * 100) / 100,
        earnings: Math.round(data.earnings * 100) / 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEntries]);

  const wasteTrendData = useMemo(() => {
    const map = {};
    filteredEntries.forEach(e => {
      if (!e.date) return;
      const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
      const key = format(d, 'yyyy-MM-dd');
      if (!map[key]) map[key] = 0;
      map[key] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEntries]);

  const weeklyTrendData = useMemo(() => {
    const map = {};
    filteredEntries.forEach(e => {
      if (!e.date) return;
      const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      const key = format(weekStart, 'yyyy-MM-dd');
      if (!map[key]) map[key] = 0;
      map[key] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEntries]);

  const monthlyTrendData = useMemo(() => {
    const map = {};
    filteredEntries.forEach(e => {
      if (!e.date) return;
      const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
      const key = format(d, 'yyyy-MM');
      if (!map[key]) map[key] = 0;
      map[key] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEntries]);

  const wasteTypeBreakdown = useMemo(() => {
    if (!filters.classFilter || filters.classFilter === 'all') return [];
    const map = {};
    filteredEntries.forEach(e => {
      const type = e.wasteTypeName || 'Unknown';
      if (!map[type]) map[type] = { weight: 0, earnings: 0 };
      map[type].weight += e.weight || 0;
      map[type].earnings += e.amount || 0;
    });
    const totalWaste = filteredEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        weight: Math.round(data.weight * 100) / 100,
        earnings: Math.round(data.earnings * 100) / 100,
        percentage: totalWaste > 0 ? (data.weight / totalWaste) * 100 : 0,
      }))
      .sort((a, b) => b.weight - a.weight);
  }, [filteredEntries, filters.classFilter]);

  return {
    loading,
    error,
    kpis,
    wasteByClass,
    wasteTrendData,
    weeklyTrendData,
    monthlyTrendData,
    wasteTypeBreakdown,
    allClasses,
    refetch: () => {
      setLoading(true);
      getAllClassWasteEntries().then(setClassEntries).finally(() => setLoading(false));
    },
  };
}
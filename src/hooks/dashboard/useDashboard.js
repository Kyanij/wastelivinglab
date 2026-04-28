import { useState, useEffect, useMemo } from 'react';
import { getAllStudents } from '../../firebase/students';
import { getAllWasteEntries } from '../../firebase/wasteEntries';
import { format, startOfWeek } from 'date-fns';

export function useDashboard(filters = {}) {
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [studentsData, entriesData] = await Promise.all([
          getAllStudents(),
          getAllWasteEntries(),
        ]);
        setStudents(studentsData);
        setEntries(entriesData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredEntries = useMemo(() => {
    let result = entries;
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
    if (filters.studentClass && filters.studentClass !== 'all') {
      result = result.filter(e => e.studentClass === filters.studentClass);
    }
    if (filters.wasteType && filters.wasteType !== 'all') {
      result = result.filter(e => e.wasteTypeName === filters.wasteType);
    }
    return result;
  }, [entries, filters]);

  const previousEntries = useMemo(() => {
    if (!filters.dateFrom || !filters.dateTo) return [];
    const rangeMs = filters.dateTo.getTime() - filters.dateFrom.getTime();
    const prevStart = new Date(filters.dateFrom.getTime() - rangeMs - 1);
    const prevEnd = new Date(filters.dateFrom.getTime() - 1);
    return entries.filter(e => {
      if (!e.date) return false;
      const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
      return d >= prevStart && d <= prevEnd;
    });
  }, [entries, filters]);

  const kpis = useMemo(() => {
    const totalWaste = filteredEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const totalEarnings = filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const activeStudentIds = new Set(filteredEntries.map(e => e.studentId).filter(Boolean));
    const avgWaste = activeStudentIds.size > 0 ? totalWaste / students.length : 0;

    const prevWaste = previousEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const prevEarnings = previousEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const prevActiveCount = new Set(previousEntries.map(e => e.studentId).filter(Boolean)).size;

    const wasteTrend = prevWaste > 0 ? ((totalWaste - prevWaste) / prevWaste) * 100 : 0;
    const earningsTrend = prevEarnings > 0 ? ((totalEarnings - prevEarnings) / prevEarnings) * 100 : 0;
    const activeTrend = prevActiveCount > 0 ? ((activeStudentIds.size - prevActiveCount) / prevActiveCount) * 100 : 0;
    const avgTrend = prevWaste > 0 ? ((totalWaste / students.length) - (prevWaste / students.length)) / (prevWaste / students.length) * 100 : 0;

    const topStudent = [...students]
      .sort((a, b) => (b.totalWaste || 0) - (a.totalWaste || 0))[0];

    return {
      totalWaste,
      totalEarnings,
      activeStudents: activeStudentIds.size,
      avgWastePerStudent: avgWaste,
      topPerformer: topStudent,
      trends: {
        waste: wasteTrend,
        earnings: earningsTrend,
        active: activeTrend,
        avg: avgTrend,
      },
    };
  }, [filteredEntries, previousEntries, students]);

  const wasteByType = useMemo(() => {
    const map = {};
    filteredEntries.forEach(e => {
      const type = e.wasteTypeName || 'Others';
      if (!map[type]) map[type] = 0;
      map[type] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEntries]);

  const wasteByClass = useMemo(() => {
    const map = {};
    filteredEntries.forEach(e => {
      const cls = e.studentClass || 'Unknown';
      if (!map[cls]) map[cls] = 0;
      map[cls] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
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

  const topStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => (b.totalWaste || 0) - (a.totalWaste || 0))
      .slice(0, 5)
      .map((s, i) => ({
        rank: i + 1,
        id: s.id,
        name: s.name,
        class: s.class,
        totalWaste: s.totalWaste || 0,
        totalEarnings: s.totalEarnings || 0,
      }));
  }, [students]);

  const recentActivity = useMemo(() => {
    return entries
      .filter(e => e.createdAt)
      .sort((a, b) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return tb - ta;
      })
      .slice(0, 10)
      .map(e => ({
        id: e.id,
        studentName: e.studentName || 'Unknown',
        wasteType: e.wasteTypeName || 'Unknown',
        weight: e.weight || 0,
        amount: e.amount || 0,
        date: e.date,
        createdAt: e.createdAt,
      }));
  }, [entries]);

  const uniqueClasses = useMemo(() => {
    return [...new Set(students.map(s => s.class).filter(Boolean))].sort();
  }, [students]);

  return {
    loading,
    error,
    students,
    entries,
    filteredEntries,
    kpis,
    wasteByType,
    wasteByClass,
    wasteTrendData,
    weeklyTrendData,
    monthlyTrendData,
    topStudents,
    recentActivity,
    uniqueClasses,
  };
}
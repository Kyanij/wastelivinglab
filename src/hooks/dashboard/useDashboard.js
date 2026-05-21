import { useState, useEffect, useMemo } from 'react';
import { getAllStudents } from '../../firebase/students';
import { getAllWasteEntries } from '../../firebase/wasteEntries';
import { getAllClasses, getAllClassWasteEntries } from '../../firebase/classes';
import { format, startOfWeek } from 'date-fns';

export function useDashboard(filters = {}) {
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classEntries, setClassEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [studentsData, entriesData, classesData, classEntriesData] = await Promise.all([
          getAllStudents(),
          getAllWasteEntries(),
          getAllClasses(),
          getAllClassWasteEntries(),
        ]);
        setStudents(studentsData);
        setEntries(entriesData);
        setClasses(classesData);
        setClassEntries(classEntriesData);
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

  const filteredClassEntries = useMemo(() => {
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
    if (filters.studentClass && filters.studentClass !== 'all') {
      result = result.filter(e => e.className === filters.studentClass);
    }
    if (filters.wasteType && filters.wasteType !== 'all') {
      result = result.filter(e => e.wasteTypeName === filters.wasteType);
    }
    return result;
  }, [classEntries, filters]);

  const allFilteredEntries = useMemo(() => {
    const normalizedClassEntries = filteredClassEntries.map(e => ({
      ...e,
      studentClass: e.className,
    }));
    return [...filteredEntries, ...normalizedClassEntries];
  }, [filteredEntries, filteredClassEntries]);

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

  const previousClassEntries = useMemo(() => {
    if (!filters.dateFrom || !filters.dateTo) return [];
    const rangeMs = filters.dateTo.getTime() - filters.dateFrom.getTime();
    const prevStart = new Date(filters.dateFrom.getTime() - rangeMs - 1);
    const prevEnd = new Date(filters.dateFrom.getTime() - 1);
    return classEntries.filter(e => {
      if (!e.date) return false;
      const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
      return d >= prevStart && d <= prevEnd;
    });
  }, [classEntries, filters]);

  const kpis = useMemo(() => {
    const studentWaste = filteredEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const studentEarnings = filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const classWaste = filteredClassEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const classEarnings = filteredClassEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalWaste = studentWaste + classWaste;
    const totalEarnings = studentEarnings + classEarnings;
    const activeStudentIds = new Set(filteredEntries.map(e => e.studentId).filter(Boolean));
    const avgWaste = activeStudentIds.size > 0 ? totalWaste / students.length : 0;

    const prevStudentWaste = previousEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const prevStudentEarnings = previousEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const prevClassWaste = previousClassEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const prevClassEarnings = previousClassEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

    const prevTotalWaste = prevStudentWaste + prevClassWaste;
    const prevTotalEarnings = prevStudentEarnings + prevClassEarnings;
    const prevActiveCount = new Set(previousEntries.map(e => e.studentId).filter(Boolean)).size;

    const wasteTrend = prevTotalWaste > 0 ? ((totalWaste - prevTotalWaste) / prevTotalWaste) * 100 : 0;
    const earningsTrend = prevTotalEarnings > 0 ? ((totalEarnings - prevTotalEarnings) / prevTotalEarnings) * 100 : 0;
    const activeTrend = prevActiveCount > 0 ? ((activeStudentIds.size - prevActiveCount) / prevActiveCount) * 100 : 0;
    const avgTrend = prevTotalWaste > 0
      ? ((totalWaste / students.length) - (prevTotalWaste / students.length)) / (prevTotalWaste / students.length) * 100
      : 0;

    const topStudent = [...students]
      .sort((a, b) => (b.totalWaste || 0) - (a.totalWaste || 0))[0];

    return {
      totalWaste,
      totalEarnings,
      studentWaste,
      classWaste,
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
  }, [filteredEntries, filteredClassEntries, previousEntries, previousClassEntries, students]);

  const wasteByType = useMemo(() => {
    const map = {};
    allFilteredEntries.forEach(e => {
      const type = e.wasteTypeName || 'Others';
      if (!map[type]) map[type] = 0;
      map[type] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [allFilteredEntries]);

  const wasteByClass = useMemo(() => {
    const map = {};
    filteredEntries.forEach(e => {
      const cls = e.studentClass || 'Unknown';
      if (!map[cls]) map[cls] = 0;
      map[cls] += e.weight || 0;
    });
    filteredClassEntries.forEach(e => {
      const cls = e.className || 'Unknown';
      if (!map[cls]) map[cls] = 0;
      map[cls] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEntries, filteredClassEntries]);

  const wasteTrendData = useMemo(() => {
    const map = {};
    allFilteredEntries.forEach(e => {
      if (!e.date) return;
      const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
      const key = format(d, 'yyyy-MM-dd');
      if (!map[key]) map[key] = 0;
      map[key] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allFilteredEntries]);

  const weeklyTrendData = useMemo(() => {
    const map = {};
    allFilteredEntries.forEach(e => {
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
  }, [allFilteredEntries]);

  const monthlyTrendData = useMemo(() => {
    const map = {};
    allFilteredEntries.forEach(e => {
      if (!e.date) return;
      const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
      const key = format(d, 'yyyy-MM');
      if (!map[key]) map[key] = 0;
      map[key] += e.weight || 0;
    });
    return Object.entries(map)
      .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allFilteredEntries]);

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

  const topClasses = useMemo(() => {
    return [...classes]
      .sort((a, b) => (b.totalWaste || 0) - (a.totalWaste || 0))
      .slice(0, 5)
      .map((c, i) => ({
        rank: i + 1,
        id: c.id,
        name: c.name,
        totalWaste: c.totalWaste || 0,
        totalEarnings: c.totalEarnings || 0,
      }));
  }, [classes]);

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

  const recentClassActivity = useMemo(() => {
    return classEntries
      .filter(e => e.createdAt)
      .sort((a, b) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return tb - ta;
      })
      .slice(0, 10)
      .map(e => ({
        id: e.id,
        className: e.className || 'Unknown',
        wasteType: e.wasteTypeName || 'Unknown',
        weight: e.weight || 0,
        amount: e.amount || 0,
        date: e.date,
        createdAt: e.createdAt,
      }));
  }, [classEntries]);

  const uniqueClasses = useMemo(() => {
    const studentClasses = students.map(s => s.class).filter(Boolean);
    const collectionClasses = classes.map(c => c.name).filter(Boolean);
    return [...new Set([...studentClasses, ...collectionClasses])].sort();
  }, [students, classes]);

  return {
    loading,
    error,
    students,
    entries,
    classes,
    classEntries,
    filteredEntries,
    filteredClassEntries,
    kpis,
    wasteByType,
    wasteByClass,
    wasteTrendData,
    weeklyTrendData,
    monthlyTrendData,
    topStudents,
    topClasses,
    recentActivity,
    recentClassActivity,
    uniqueClasses,
  };
}
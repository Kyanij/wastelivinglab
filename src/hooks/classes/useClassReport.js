import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getAllClassWasteEntries, getAllClasses } from '../../firebase/classes';
import { getAllWasteEntries } from '../../firebase/wasteEntries';
import { getAllStudents } from '../../firebase/students';
import { format, startOfWeek } from 'date-fns';

// Cache date parsing - converts Firestore Timestamp or Date to a Date object once
function toDate(d) {
  if (!d) return null;
  if (d instanceof Date) return d;
  if (d.toDate) return d.toDate();
  return new Date(d);
}

// Get date key string once
function dateKey(d) {
  const date = toDate(d);
  return date ? format(date, 'yyyy-MM-dd') : null;
}

// Build date-grouped data for expandable table
function buildDateGroupedData(entries, filters) {
  const { dateFrom, dateTo, classFilter } = filters;
  const dateMap = {};

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    
    // Apply filters
    if (dateFrom || dateTo || (classFilter && classFilter !== 'all')) {
      const d = toDate(e.date);
      if (!d) continue;
      if (dateFrom && d < dateFrom) continue;
      if (dateTo && d > dateTo) continue;
      if (classFilter && classFilter !== 'all' && e.className !== classFilter) continue;
    }

    const key = dateKey(e.date);
    if (!key) continue;

    if (!dateMap[key]) {
      dateMap[key] = {
        dateKey: key,
        date: toDate(e.date),
        entries: [],
        totalWeight: 0,
        totalEarnings: 0,
      };
    }

    const group = dateMap[key];
    const wName = (e.wasteTypeName || '').trim();
    if (!wName) return;
    group.entries.push({
      id: e.id,
      wasteTypeName: wName,
      weight: e.weight || 0,
      price: e.price || 0,
      amount: e.amount || 0,
    });
    group.totalWeight += e.weight || 0;
    group.totalEarnings += e.amount || 0;
  }

  return Object.values(dateMap)
    .map(g => ({
      ...g,
      totalWeight: Math.round(g.totalWeight * 100) / 100,
      totalEarnings: Math.round(g.totalEarnings * 100) / 100,
      entryCount: g.entries.length,
    }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

// Single-pass filter + transform for entries
function filterAndGroup(entries, filters) {
  const { dateFrom, dateTo, classFilter } = filters;
  const wasteByClassMap = {};
  const wasteByTypeMap = {};
  const trendMap = {};
  const weekMap = {};
  const monthMap = {};
  const classParticipationMap = {};
  let totalWaste = 0;
  let totalEarnings = 0;
  let totalEntries = 0;

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    
    // Single-pass date + class filter
    if (dateFrom || dateTo || (classFilter && classFilter !== 'all')) {
      const d = toDate(e.date);
      if (!d) continue;
      if (dateFrom && d < dateFrom) continue;
      if (dateTo && d > dateTo) continue;
      if (classFilter && classFilter !== 'all' && e.className !== classFilter) continue;
    }

    const weight = e.weight || 0;
    const amount = e.amount || 0;
    const cls = (e.className || '').trim();
    const type = (e.wasteTypeName || '').trim();
    if (!cls || !type) continue;
    const key = dateKey(e.date);

    totalWaste += weight;
    totalEarnings += amount;
    totalEntries++;

    // Waste by class
    if (!wasteByClassMap[cls]) wasteByClassMap[cls] = { weight: 0, earnings: 0 };
    wasteByClassMap[cls].weight += weight;
    wasteByClassMap[cls].earnings += amount;

    // Waste by type
    if (!wasteByTypeMap[type]) wasteByTypeMap[type] = { weight: 0, earnings: 0 };
    wasteByTypeMap[type].weight += weight;
    wasteByTypeMap[type].earnings += amount;

    // Participation - classes per date
    if (key) {
      if (!classParticipationMap[key]) classParticipationMap[key] = new Set();
      classParticipationMap[key].add(cls);
    }

    // Trend data
    if (key) {
      trendMap[key] = (trendMap[key] || 0) + weight;
    }

    // Weekly trend
    const d = toDate(e.date);
    if (d) {
      const weekStart = startOfWeek(d, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      weekMap[weekKey] = (weekMap[weekKey] || 0) + weight;

      // Monthly trend
      const monthKey = format(d, 'yyyy-MM');
      monthMap[monthKey] = (monthMap[monthKey] || 0) + weight;
    }
  }

  return {
    kpis: {
      totalWaste: Math.round(totalWaste * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalEntries,
      avgPerEntry: totalEntries > 0 ? Math.round((totalWaste / totalEntries) * 100) / 100 : 0,
    },
    wasteByClass: Object.entries(wasteByClassMap)
      .map(([name, data]) => ({
        name,
        value: Math.round(data.weight * 100) / 100,
        earnings: Math.round(data.earnings * 100) / 100,
      }))
      .sort((a, b) => b.value - a.value),
    wasteTypeBreakdown: classFilter && classFilter !== 'all' ? Object.entries(wasteByTypeMap)
      .map(([name, data]) => ({
        name,
        weight: Math.round(data.weight * 100) / 100,
        earnings: Math.round(data.earnings * 100) / 100,
        percentage: totalWaste > 0 ? (data.weight / totalWaste) * 100 : 0,
      }))
      .sort((a, b) => b.weight - a.weight) : [],
    trendData: Object.entries(trendMap)
      .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    weekData: Object.entries(weekMap)
      .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    monthData: Object.entries(monthMap)
      .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    classParticipationMap,
    dateGroupedData: classFilter && classFilter !== 'all' ? buildDateGroupedData(entries, filters) : [],
  };
}

export function useClassReport(filters = {}) {
  const [classEntries, setClassEntries] = useState([]);
  const [studentEntries, setStudentEntries] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      setLoading(true);
      try {
        const [entriesData, studentData, classesData] = await Promise.all([
          getAllClassWasteEntries(),
          getAllWasteEntries(),
          getAllClasses(),
        ]);
        if (!cancelled && mountedRef.current) {
          setClassEntries(entriesData);
          setStudentEntries(studentData);
          setAllClasses(classesData);
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          setError(err);
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    }
    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Single-pass computation for class entries
  const computed = useMemo(() => {
    return filterAndGroup(classEntries, filters);
  }, [classEntries, filters]);

  // Compute student participation: students from the selected class who submitted entries
  const participationTrendData = useMemo(() => {
    const studentMap = {};
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;
    const classFilter = filters.classFilter;

    // Get student IDs for the selected class (enrolled students)
    // Match case-insensitively since classes collection uses normalized names
    let classStudentIds = new Set();
    if (classFilter && classFilter !== 'all') {
      const normalizedClass = classFilter.toLowerCase().trim().replace(/\s+/g, '');
      allStudents.forEach(s => {
        const studentClass = (s.class || '').toLowerCase().trim().replace(/\s+/g, '');
        if (studentClass === normalizedClass) {
          classStudentIds.add(s.id);
        }
      });
    }

    // Count unique students per date from wasteEntries
    for (let i = 0; i < studentEntries.length; i++) {
      const e = studentEntries[i];
      const d = toDate(e.date);
      if (!d) continue;
      if (dateFrom && d < dateFrom) continue;
      if (dateTo && d > dateTo) continue;
      
      const studentId = e.studentId;
      if (!studentId) continue;

      // If class filter is active, only count students enrolled in that class
      if (classFilter && classFilter !== 'all' && !classStudentIds.has(studentId)) continue;

      const key = format(d, 'yyyy-MM-dd');
      if (!studentMap[key]) studentMap[key] = new Set();
      studentMap[key].add(studentId);
    }

    // Merge class + student participation data
    const allDates = new Set([...Object.keys(computed.classParticipationMap), ...Object.keys(studentMap)]);
    return Array.from(allDates)
      .sort((a, b) => a.localeCompare(b))
      .map(date => ({
        date,
        classes: computed.classParticipationMap[date] ? computed.classParticipationMap[date].size : 0,
        students: studentMap[date] ? studentMap[date].size : 0,
      }));
  }, [studentEntries, allStudents, computed.classParticipationMap, filters.dateFrom, filters.dateTo, filters.classFilter]);

  const refetch = useCallback(() => {
    setLoading(true);
    Promise.all([getAllClassWasteEntries(), getAllWasteEntries(), getAllStudents()])
      .then(([entries, students, studentsData]) => {
        setClassEntries(entries);
        setStudentEntries(students);
        setAllStudents(studentsData);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    loading,
    error,
    kpis: computed.kpis,
    wasteByClass: computed.wasteByClass,
    wasteTrendData: computed.trendData,
    weeklyTrendData: computed.weekData,
    monthlyTrendData: computed.monthData,
    wasteTypeBreakdown: computed.wasteTypeBreakdown,
    dateGroupedData: computed.dateGroupedData,
    participationTrendData,
    allClasses,
    refetch,
  };
}

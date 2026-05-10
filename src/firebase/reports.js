import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from './config';
import { startOfMonth, endOfMonth, subMonths, format, isValid } from 'date-fns';

const wasteEntriesCollection = collection(db, 'wasteEntries');
const studentsCollection = collection(db, 'students');
const wasteTypesCollection = collection(db, 'wasteTypes');

function toTimestamp(date) {
  if (!date) return null;
  if (date instanceof Timestamp) return date;
  if (date instanceof Date) return Timestamp.fromDate(date);
  return Timestamp.fromDate(new Date(date));
}

function fromTimestamp(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  return ts.toDate();
}

export async function getOverviewData(dateRange, comparisonRange, selectedClass = 'all', selectedWasteType = 'all') {
  const { from, to } = dateRange;
  const { from: compFrom, to: compTo } = comparisonRange;

  const currentQuery = query(
    wasteEntriesCollection,
    where('date', '>=', toTimestamp(from)),
    where('date', '<=', toTimestamp(to)),
    orderBy('date', 'asc')
  );

  const prevQuery = query(
    wasteEntriesCollection,
    where('date', '>=', toTimestamp(compFrom)),
    where('date', '<=', toTimestamp(compTo))
  );

  const [currentSnapshot, prevSnapshot, studentsSnapshot, wasteTypesSnapshot] = await Promise.all([
    getDocs(currentQuery),
    getDocs(prevQuery),
    getDocs(studentsCollection),
    getDocs(wasteTypesCollection)
  ]);

  const currentEntries = currentSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const prevEntries = prevSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const students = studentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const wasteTypes = wasteTypesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  // Filter entries by selected class and waste type
  const filteredCurrentEntries = currentEntries.filter(entry => {
    const matchClass = selectedClass === 'all' || entry.studentClass === selectedClass;
    const matchType = selectedWasteType === 'all' || entry.wasteTypeId === selectedWasteType;
    return matchClass && matchType;
  });

  const filteredPrevEntries = prevEntries.filter(entry => {
    const matchClass = selectedClass === 'all' || entry.studentClass === selectedClass;
    const matchType = selectedWasteType === 'all' || entry.wasteTypeId === selectedWasteType;
    return matchClass && matchType;
  });

  const totalWaste = filteredCurrentEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = filteredCurrentEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const prevWaste = filteredPrevEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const prevEarnings = filteredPrevEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

  const wasteChange = prevWaste > 0 ? ((totalWaste - prevWaste) / prevWaste) * 100 : 0;
  const earningsChange = prevEarnings > 0 ? ((totalEarnings - prevEarnings) / prevEarnings) * 100 : 0;

  const uniqueStudents = new Set(filteredCurrentEntries.map(e => e.studentId));
  const activeStudents = uniqueStudents.size;
  const prevUniqueStudents = new Set(filteredPrevEntries.map(e => e.studentId));
  const prevActiveStudents = prevUniqueStudents.size;
  const studentsChange = activeStudents - prevActiveStudents;

  const avgPerStudent = activeStudents > 0 ? totalWaste / activeStudents : 0;
  const prevAvgPerStudent = prevActiveStudents > 0 ? prevWaste / prevActiveStudents : 0;
  const avgChange = prevAvgPerStudent > 0 ? ((avgPerStudent - prevAvgPerStudent) / prevAvgPerStudent) * 100 : 0;

  const wasteByType = {};
  const dailyData = {};
  
  filteredCurrentEntries.forEach(entry => {
    const typeName = entry.wasteTypeName || 'Unknown';
    wasteByType[typeName] = (wasteByType[typeName] || 0) + (entry.weight || 0);

    const dateKey = entry.date ? format(fromTimestamp(entry.date), 'MMM d') : 'Unknown';
    dailyData[dateKey] = (dailyData[dateKey] || 0) + (entry.weight || 0);
  });

  const typeData = Object.entries(wasteByType).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100
  }));

  const trendData = Object.entries(dailyData).map(([date, waste]) => ({
    date,
    waste: Math.round(waste * 100) / 100
  }));

  const studentStats = {};
  filteredCurrentEntries.forEach(entry => {
    const sid = entry.studentId;
    if (!studentStats[sid]) {
      studentStats[sid] = { 
        studentId: sid, 
        studentName: entry.studentName || 'Unknown',
        studentClass: entry.studentClass || 'N/A',
        totalWaste: 0, 
        totalEarnings: 0 
      };
    }
    studentStats[sid].totalWaste += entry.weight || 0;
    studentStats[sid].totalEarnings += entry.amount || 0;
  });

  const topStudents = Object.values(studentStats)
    .sort((a, b) => b.totalWaste - a.totalWaste)
    .slice(0, 5)
    .map(s => ({
      ...s,
      totalWaste: Math.round(s.totalWaste * 100) / 100,
      totalEarnings: Math.round(s.totalEarnings * 100) / 100
    }));

  const uniqueClasses = [...new Set(students.map(s => s.class).filter(Boolean))].sort();

  const topClass = uniqueClasses.length > 0 ? uniqueClasses[0] : 'N/A';
  const classStats = {};
  filteredCurrentEntries.forEach(entry => {
    const cls = entry.studentClass || 'Unknown';
    if (!classStats[cls]) classStats[cls] = 0;
    classStats[cls] += entry.weight || 0;
  });
  const leadingClass = Object.entries(classStats).sort((a, b) => b[1] - a[1])[0];

  return {
    kpis: {
      totalWaste: { value: totalWaste, change: wasteChange },
      totalEarnings: { value: totalEarnings, change: earningsChange },
      activeStudents: { value: activeStudents, change: studentsChange },
      avgPerStudent: { value: avgPerStudent, change: avgChange }
    },
    charts: {
      trend: trendData,
      typeDistribution: typeData
    },
    topStudents,
    uniqueClasses,
    topClass: leadingClass ? leadingClass[0] : 'N/A',
    topWasteType: typeData.length > 0 ? typeData.sort((a, b) => b.value - a.value)[0].name : 'N/A'
  };
}

export async function getStudentReportData(studentId, dateRange, comparisonRange) {
  if (!studentId) return null;

  const studentDoc = await getDoc(doc(studentsCollection, studentId));
  if (!studentDoc.exists()) return null;

  const student = { id: studentDoc.id, ...studentDoc.data() };

  const entriesQuery = query(
    wasteEntriesCollection,
    where('studentId', '==', studentId),
    where('date', '>=', toTimestamp(dateRange.from)),
    where('date', '<=', toTimestamp(dateRange.to)),
    orderBy('date', 'desc')
  );

  const prevEntriesQuery = query(
    wasteEntriesCollection,
    where('studentId', '==', studentId),
    where('date', '>=', toTimestamp(comparisonRange.from)),
    where('date', '<=', toTimestamp(comparisonRange.to))
  );

  const [entriesSnapshot, prevSnapshot, allStudentsSnapshot] = await Promise.all([
    getDocs(entriesQuery),
    getDocs(prevEntriesQuery),
    getDocs(studentsCollection)
  ]);

  const entries = entriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const prevEntries = prevSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const allStudents = allStudentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const totalWaste = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalEntries = entries.length;

  const prevWaste = prevEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const prevEarnings = prevEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const prevEntryCount = prevEntries.length;

  const wasteChange = prevWaste > 0 ? ((totalWaste - prevWaste) / prevWaste) * 100 : 0;
  const earningsChange = prevEarnings > 0 ? ((totalEarnings - prevEarnings) / prevEarnings) * 100 : 0;
  const entriesChange = totalEntries - prevEntryCount;
  const avgPerEntry = totalEntries > 0 ? totalWaste / totalEntries : 0;
  const prevAvgPerEntry = prevEntryCount > 0 ? prevWaste / prevEntryCount : 0;
  const avgChange = prevAvgPerEntry > 0 ? ((avgPerEntry - prevAvgPerEntry) / prevAvgPerEntry) * 100 : 0;

  const dailyData = {};
  const wasteByType = {};

  entries.forEach(entry => {
    const dateKey = entry.date ? format(fromTimestamp(entry.date), 'MMM d') : 'Unknown';
    dailyData[dateKey] = (dailyData[dateKey] || 0) + (entry.weight || 0);

    const typeName = entry.wasteTypeName || 'Unknown';
    wasteByType[typeName] = (wasteByType[typeName] || 0) + (entry.weight || 0);
  });

  const trendData = Object.entries(dailyData).map(([date, waste]) => ({
    date,
    waste: Math.round(waste * 100) / 100
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const typeData = Object.entries(wasteByType).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100
  }));

  const allStudentStats = {};
  allStudents.forEach(s => {
    if (s.totalWaste) allStudentStats[s.id] = s.totalWaste;
  });

  const sortedStudents = Object.entries(allStudentStats)
    .sort((a, b) => b[1] - a[1]);
  
  const rank = sortedStudents.findIndex(([id]) => id === studentId) + 1;
  const avgWasteAll = allStudents.reduce((sum, s) => sum + (s.totalWaste || 0), 0) / allStudents.length;
  const comparisonToAvg = avgWasteAll > 0 ? ((totalWaste - avgWasteAll) / avgWasteAll) * 100 : 0;

  const groupedEntries = entries.reduce((acc, entry) => {
    const dateKey = entry.date ? format(fromTimestamp(entry.date), 'yyyy-MM-dd') : 'unknown';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push({ ...entry, date: fromTimestamp(entry.date) });
    return acc;
  }, {});

  const structuredEntries = Object.entries(groupedEntries)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .map(([date, items]) => {
      const totalWeight = items.reduce((sum, i) => sum + (i.weight || 0), 0);
      const totalAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);
      return {
        date,
        items: items.map(i => ({
          ...i,
          weight: i.weight || 0,
          rate: i.rate || 0,
          amount: i.amount || 0
        })),
        totalWeight: Math.round(totalWeight * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      };
    });

  return {
    student,
    kpis: {
      totalWaste: { value: totalWaste, change: wasteChange },
      totalEarnings: { value: totalEarnings, change: earningsChange },
      totalEntries: { value: totalEntries, change: entriesChange },
      avgPerEntry: { value: avgPerEntry, change: avgChange }
    },
    charts: {
      trend: trendData,
      typeDistribution: typeData
    },
    entries: structuredEntries,
    rank,
    totalStudents: sortedStudents.length,
    comparisonToAvg
  };
}

export async function getClassReportData(dateRange, comparisonRange, selectedClass = null) {
  const { from: currFrom, to: currTo } = dateRange;
  const { from: compFrom, to: compTo } = comparisonRange;

  // Current period query
  const entriesQuery = query(
    wasteEntriesCollection,
    where('date', '>=', toTimestamp(currFrom)),
    where('date', '<=', toTimestamp(currTo))
  );

  // Previous period query for comparison
  const prevQuery = query(
    wasteEntriesCollection,
    where('date', '>=', toTimestamp(compFrom)),
    where('date', '<=', toTimestamp(compTo))
  );

  const [entriesSnapshot, prevSnapshot, studentsSnapshot, wasteTypesSnapshot] = await Promise.all([
    getDocs(entriesQuery),
    getDocs(prevQuery),
    getDocs(studentsCollection),
    getDocs(wasteTypesCollection)
  ]);

  const students = studentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const wasteTypes = wasteTypesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  let entries = entriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const prevEntries = prevSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  // Filter by selected class if provided
  if (selectedClass && selectedClass !== 'all') {
    entries = entries.filter(e => e.studentClass === selectedClass);
    // Also filter previous period for comparison
  }

  // Get all unique classes from students for dropdown
  const allClasses = [...new Set(students.map(s => s.class).filter(Boolean))].sort();

  // Calculate class-level stats
  const classStats = {};
  const classStudentCount = {};

  students.forEach(s => {
    const cls = s.class || 'Unknown';
    classStudentCount[cls] = (classStudentCount[cls] || 0) + 1;
  });

  entries.forEach(entry => {
    const cls = entry.studentClass || 'Unknown';
    if (!classStats[cls]) {
      classStats[cls] = { totalWaste: 0, studentIds: new Set() };
    }
    classStats[cls].totalWaste += entry.weight || 0;
    classStats[cls].studentIds.add(entry.studentId);
  });

  // Previous period stats for comparison
  const prevClassStats = {};
  prevEntries.forEach(entry => {
    const cls = entry.studentClass || 'Unknown';
    if (!prevClassStats[cls]) {
      prevClassStats[cls] = 0;
    }
    prevClassStats[cls] += entry.weight || 0;
  });

  // Calculate KPI values with comparison
  const totalWaste = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const prevTotalWaste = prevEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const prevTotalEarnings = prevEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

  const wasteChange = prevTotalWaste > 0 ? ((totalWaste - prevTotalWaste) / prevTotalWaste) * 100 : 0;
  const earningsChange = prevTotalEarnings > 0 ? ((totalEarnings - prevTotalEarnings) / prevTotalEarnings) * 100 : 0;

  const activeClasses = Object.keys(classStats).length;
  const prevActiveClasses = Object.keys(prevClassStats).length;
  const classesChange = activeClasses - prevActiveClasses;

  const uniqueStudents = new Set(entries.map(e => e.studentId).filter(Boolean));
  const activeStudents = uniqueStudents.size;
  const prevUniqueStudents = new Set(prevEntries.map(e => e.studentId).filter(Boolean));
  const prevActiveStudents = prevUniqueStudents.size;
  const studentsChange = activeStudents - prevActiveStudents;

  const avgPerClass = activeClasses > 0 ? totalWaste / activeClasses : 0;
  const avgPerStudent = activeStudents > 0 ? totalWaste / activeStudents : 0;
  const prevAvgPerClass = prevActiveClasses > 0 ? prevTotalWaste / prevActiveClasses : 0;
  const prevAvgPerStudent = prevActiveStudents > 0 ? prevTotalWaste / prevActiveStudents : 0;
  const avgChange = selectedClass && selectedClass !== 'all' 
    ? (prevAvgPerStudent > 0 ? ((avgPerStudent - prevAvgPerStudent) / prevAvgPerStudent) * 100 : 0)
    : (prevAvgPerClass > 0 ? ((avgPerClass - prevAvgPerClass) / prevAvgPerClass) * 100 : 0);

  // Class distribution for bar chart (all classes)
  const classDistribution = Object.entries(classStats)
    .map(([cls, stats]) => ({
      class: cls,
      totalWaste: Math.round(stats.totalWaste * 100) / 100,
      studentCount: classStudentCount[cls] || 0
    }))
    .sort((a, b) => b.totalWaste - a.totalWaste);

  // Student stats for selected class
  let studentStats = {};
  if (selectedClass && selectedClass !== 'all') {
    entries.forEach(entry => {
      const sid = entry.studentId;
      if (!studentStats[sid]) {
        studentStats[sid] = {
          studentId: sid,
          studentName: entry.studentName || 'Unknown',
          studentClass: entry.studentClass || 'N/A',
          totalWaste: 0,
          totalEarnings: 0
        };
      }
      studentStats[sid].totalWaste += entry.weight || 0;
      studentStats[sid].totalEarnings += entry.amount || 0;
    });

    // Add students with zero waste (from the selected class)
    students
      .filter(s => s.class === selectedClass)
      .forEach(s => {
        if (!studentStats[s.id]) {
          studentStats[s.id] = {
            studentId: s.id,
            studentName: s.name || 'Unknown',
            studentClass: s.class || 'N/A',
            totalWaste: 0,
            totalEarnings: 0
          };
        }
      });
  }

  const studentRanking = Object.values(studentStats)
    .map(s => ({
      ...s,
      totalWaste: Math.round(s.totalWaste * 100) / 100,
      totalEarnings: Math.round(s.totalEarnings * 100) / 100
    }))
    .sort((a, b) => b.totalWaste - a.totalWaste);

  // Trend data for line chart - daily aggregation
  const dailyData = {};
  const weeklyData = {};
  const monthlyData = {};

  entries.forEach(entry => {
    if (!entry.date) return;
    const date = fromTimestamp(entry.date);
    const dateKey = format(date, 'yyyy-MM-dd');
    const weekKey = format(date, 'yyyy-ww');
    const monthKey = format(date, 'yyyy-MM');

    dailyData[dateKey] = (dailyData[dateKey] || 0) + (entry.weight || 0);
    weeklyData[weekKey] = (weeklyData[weekKey] || 0) + (entry.weight || 0);
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (entry.weight || 0);
  });

  const trendData = Object.entries(dailyData)
    .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const trendWeekly = Object.entries(weeklyData)
    .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const trendMonthly = Object.entries(monthlyData)
    .map(([date, waste]) => ({ date, waste: Math.round(waste * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Insights data
  const isClassSelected = selectedClass && selectedClass !== 'all';
  
  // Top performing class
  const totalAllClassesWaste = Object.values(classStats).reduce((sum, c) => sum + c.totalWaste, 0);
  const topClassData = classDistribution[0] || null;
  const topClassPercent = topClassData && totalAllClassesWaste > 0 
    ? Math.round((topClassData.totalWaste / totalAllClassesWaste) * 100) 
    : 0;

  // Waste by type for insights
  const wasteByType = {};
  entries.forEach(entry => {
    const typeName = entry.wasteTypeName || 'Unknown';
    wasteByType[typeName] = (wasteByType[typeName] || 0) + (entry.weight || 0);
  });
  const wasteTypeData = Object.entries(wasteByType)
    .map(([name, value]) => ({ 
      name, 
      value: Math.round(value * 100) / 100,
      percentage: totalWaste > 0 ? Math.round((value / totalWaste) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value);

  const topWasteType = wasteTypeData[0] || null;

  // Best student when class selected
  const bestStudent = isClassSelected && studentRanking.length > 0 ? studentRanking[0] : null;

  return {
    kpis: {
      totalWaste: { value: totalWaste, change: wasteChange },
      totalEarnings: { value: totalEarnings, change: earningsChange },
      activeClasses: { value: activeClasses, change: classesChange },
      activeStudents: { value: activeStudents, change: studentsChange },
      avgPerClass: { value: avgPerClass, change: avgChange },
      avgPerStudent: { value: avgPerStudent, change: avgChange }
    },
    charts: {
      classDistribution,
      studentRanking,
      trend: trendData,
      weeklyTrend: trendWeekly,
      monthlyTrend: trendMonthly,
      wasteByType: wasteTypeData
    },
    allClasses,
    selectedClass,
    isClassSelected,
    insights: {
      topClass: topClassData,
      topClassPercent,
      topWasteType,
      bestStudent,
      totalClasses: activeClasses,
      avgPerClass: avgPerClass,
      avgPerStudent: avgPerStudent
    }
  };
}

export async function getWasteAnalysisData(dateRange, comparisonRange) {
  const entriesQuery = query(
    wasteEntriesCollection,
    where('date', '>=', toTimestamp(dateRange.from)),
    where('date', '<=', toTimestamp(dateRange.to))
  );

  const prevQuery = query(
    wasteEntriesCollection,
    where('date', '>=', toTimestamp(comparisonRange.from)),
    where('date', '<=', toTimestamp(comparisonRange.to))
  );

  const [entriesSnapshot, prevSnapshot, wasteTypesSnapshot] = await Promise.all([
    getDocs(entriesQuery),
    getDocs(prevQuery),
    getDocs(wasteTypesCollection)
  ]);

  const entries = entriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const prevEntries = prevSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const wasteTypes = wasteTypesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const totalWaste = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalEntries = entries.length;

  const prevWaste = prevEntries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const prevEarnings = prevEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

  const wasteChange = prevWaste > 0 ? ((totalWaste - prevWaste) / prevWaste) * 100 : 0;
  const earningsChange = prevEarnings > 0 ? ((totalEarnings - prevEarnings) / prevEarnings) * 100 : 0;
  const entriesChange = totalEntries - prevEntries.length;

  const typeStats = {};
  const dailyByType = {};

  entries.forEach(entry => {
    const typeName = entry.wasteTypeName || 'Unknown';
    if (!typeStats[typeName]) {
      typeStats[typeName] = { weight: 0, earnings: 0 };
    }
    typeStats[typeName].weight += entry.weight || 0;
    typeStats[typeName].earnings += entry.amount || 0;

    const dateKey = entry.date ? format(fromTimestamp(entry.date), 'MMM d') : 'Unknown';
    if (!dailyByType[dateKey]) dailyByType[dateKey] = {};
    dailyByType[dateKey][typeName] = (dailyByType[dateKey][typeName] || 0) + (entry.weight || 0);
  });

  const summaryData = Object.entries(typeStats).map(([name, stats]) => {
    const weight = Math.round(stats.weight * 100) / 100;
    const percentage = totalWaste > 0 ? Math.round((stats.weight / totalWaste) * 1000) / 10 : 0;
    const earnings = Math.round(stats.earnings * 100) / 100;
    const avgRate = weight > 0 ? Math.round((stats.earnings / weight) * 100) / 100 : 0;
    return { name, weight, percentage, earnings, avgRate };
  }).sort((a, b) => b.weight - a.weight);

  const donutData = summaryData.map(s => ({ name: s.name, value: s.weight }));

  const typeNames = Object.keys(typeStats);
  const sortedDates = [...new Set(entries.map(e => e.date ? format(fromTimestamp(e.date), 'MMM d') : 'Unknown'))].sort((a, b) => new Date(a) - new Date(b));

  const multiLineData = sortedDates.map(date => {
    const row = { date };
    typeNames.forEach(type => {
      row[type] = dailyByType[date]?.[type] || 0;
    });
    return row;
  });

  const topType = summaryData[0]?.name || 'N/A';
  const secondType = summaryData[1]?.name || 'N/A';

  return {
    kpis: {
      totalWaste: { value: totalWaste, change: wasteChange },
      totalEarnings: { value: totalEarnings, change: earningsChange },
      totalEntries: { value: totalEntries, change: entriesChange },
      wasteTypes: { value: wasteTypes.length }
    },
    charts: {
      donut: donutData,
      multiLine: multiLineData
    },
    summary: summaryData,
    topType,
    secondType
  };
}

export async function getAllStudents() {
  const snapshot = await getDocs(query(studentsCollection, orderBy('name', 'asc')));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllClasses() {
  const snapshot = await getDocs(studentsCollection);
  const classes = [...new Set(snapshot.docs.map(d => d.data().class).filter(Boolean))];
  return classes.sort();
}

export async function getAllWasteTypes() {
  const snapshot = await getDocs(query(wasteTypesCollection, orderBy('name', 'asc')));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
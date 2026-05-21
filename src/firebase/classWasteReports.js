import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import { format, startOfDay, endOfDay, startOfWeek, startOfMonth } from 'date-fns';

const classWasteEntriesCollection = collection(db, COLLECTIONS.CLASS_WASTE_ENTRIES);
const classesCollection = collection(db, COLLECTIONS.CLASSES);

function toTimestamp(date) {
  if (!date) return null;
  if (date instanceof Timestamp) return date;
  if (date instanceof Date) return Timestamp.fromDate(date);
  return Timestamp.fromDate(new Date(date));
}

export async function getClassWasteReportData({ dateFrom, dateTo, classFilter = 'all' }) {
  let q = query(
    classWasteEntriesCollection,
    where('date', '>=', toTimestamp(startOfDay(dateFrom))),
    where('date', '<=', toTimestamp(endOfDay(dateTo))),
    orderBy('date', 'desc')
  );

  const [entriesSnapshot, classesSnapshot] = await Promise.all([
    getDocs(q),
    getDocs(query(classesCollection, orderBy('name', 'asc'))),
  ]);

  let entries = entriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const allClasses = classesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  if (classFilter && classFilter !== 'all') {
    entries = entries.filter(e => e.className === classFilter);
  }

  const totalWaste = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalEntries = entries.length;
  const avgPerEntry = totalEntries > 0 ? totalWaste / totalEntries : 0;

  const classStats = {};
  entries.forEach(e => {
    const cls = e.className || 'Unknown';
    if (!classStats[cls]) classStats[cls] = { totalWaste: 0, totalEarnings: 0, entryCount: 0 };
    classStats[cls].totalWaste += e.weight || 0;
    classStats[cls].totalEarnings += e.amount || 0;
    classStats[cls].entryCount++;
  });

  const ranking = Object.entries(classStats)
    .map(([className, stats]) => ({
      className,
      totalWaste: Math.round(stats.totalWaste * 100) / 100,
      totalEarnings: Math.round(stats.totalEarnings * 100) / 100,
      entryCount: stats.entryCount,
    }))
    .sort((a, b) => b.totalWaste - a.totalWaste);

  const maxWaste = ranking.length > 0 ? Math.max(...ranking.map(r => r.totalWaste)) : 1;

  const wasteByType = {};
  entries.forEach(e => {
    const type = e.wasteTypeName || 'Unknown';
    if (!wasteByType[type]) wasteByType[type] = { weight: 0, earnings: 0 };
    wasteByType[type].weight += e.weight || 0;
    wasteByType[type].earnings += e.amount || 0;
  });

  const wasteTypeBreakdown = Object.entries(wasteByType)
    .map(([name, data]) => ({
      name,
      weight: Math.round(data.weight * 100) / 100,
      earnings: Math.round(data.earnings * 100) / 100,
      percentage: totalWaste > 0 ? Math.round((data.weight / totalWaste) * 100) : 0,
    }))
    .sort((a, b) => b.weight - a.weight);

  const trendMap = {};
  entries.forEach(e => {
    if (!e.date) return;
    const d = e.date.toDate ? e.date.toDate() : new Date(e.date);
    const key = format(d, 'yyyy-MM-dd');
    trendMap[key] = (trendMap[key] || 0) + (e.weight || 0);
  });
  const trendData = Object.entries(trendMap)
    .map(([date, weight]) => ({ date, weight: Math.round(weight * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const activeClasses = Object.keys(classStats).length;
  const topClass = ranking[0] || null;
  const topClassPercent = topClass && totalWaste > 0
    ? Math.round((topClass.totalWaste / totalWaste) * 100) : 0;

  return {
    kpis: {
      totalWaste: Math.round(totalWaste * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalEntries,
      avgPerEntry: Math.round(avgPerEntry * 100) / 100,
      activeClasses,
    },
    ranking: ranking.map(r => ({ ...r, barPercent: maxWaste > 0 ? Math.round((r.totalWaste / maxWaste) * 100) : 0 })),
    wasteTypeBreakdown: wasteTypeBreakdown.map(w => ({
      ...w,
      barPercent: wasteTypeBreakdown.length > 0
        ? Math.round((w.weight / Math.max(...wasteTypeBreakdown.map(x => x.weight))) * 100) : 0,
    })),
    trendData,
    allClasses,
    selectedClass: classFilter,
    isClassSelected: classFilter !== 'all',
    topClass,
    topClassPercent,
  };
}

export function prepareClassWasteDataFromHook(hookData, filters) {
  const { kpis, wasteByClass, wasteTypeBreakdown, allClasses, classFilter, dateFrom, dateTo } = hookData;
  const totalWaste = kpis.totalWaste || 0;
  const maxWaste = wasteByClass.length > 0 ? Math.max(...wasteByClass.map(w => w.value)) : 1;
  const maxTypeWeight = wasteTypeBreakdown.length > 0
    ? Math.max(...wasteTypeBreakdown.map(w => w.weight)) : 1;

  return {
    kpis: {
      totalWaste,
      totalEarnings: kpis.totalEarnings || 0,
      totalEntries: kpis.totalEntries || 0,
      avgPerEntry: kpis.avgPerEntry || 0,
      activeClasses: wasteByClass.length,
    },
    ranking: wasteByClass.map(w => ({
      className: w.name,
      totalWaste: w.value,
      totalEarnings: w.earnings || 0,
      barPercent: Math.round((w.value / maxWaste) * 100),
    })),
    wasteTypeBreakdown: wasteTypeBreakdown.map(w => ({
      name: w.name,
      weight: w.weight,
      earnings: w.earnings,
      percentage: Math.round(w.percentage || 0),
      barPercent: Math.round((w.weight / maxTypeWeight) * 100),
    })),
    allClasses,
    selectedClass: classFilter || 'all',
    isClassSelected: classFilter && classFilter !== 'all',
    topClass: wasteByClass[0] || null,
    topClassPercent: totalWaste > 0 && wasteByClass[0]
      ? Math.round((wasteByClass[0].value / totalWaste) * 100) : 0,
    filters: {
      dateFrom,
      dateTo,
      selectedClass: classFilter || 'all',
    },
  };
}

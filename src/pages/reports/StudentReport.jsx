import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, DollarSign, FileText, BarChart3, Award, Calendar, User, TrendingUp, Target } from 'lucide-react';

import ExportPDFButton from '../../components/reports/ExportPDFButton';
import StudentSearchInput from '../../components/reports/StudentSearchInput';
import { formatDateShort } from '../../utils/dateHelpers';
import { formatNumber } from '../../utils/portalHelpers';
import EnhancedDateRangePicker from '../../components/reports/EnhancedDateRangePicker';
import { useReportFilters, formatComparisonPeriod } from '../../hooks/reports/useReportFilters';
import { getStudentReportData, getAllClasses, getAllWasteTypes } from '../../firebase/reports';
import StudentAvatar from '../../components/ui/StudentAvatar';
import { getClassGradient } from '../../utils/studentUtils';
import DateGroupRow from '../../components/studentDetail/DateGroupRow';

import WasteTrendChart from '../../components/dashboard/WasteTrendChart';
import WasteDistributionChart from '../../components/dashboard/WasteDistributionChart';

export default function StudentReport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});
  
  const { 
    dateRange, 
    comparisonRange,
    selectedClass, 
    selectedWasteType,
    updateDateRange, 
    updateClass, 
    updateWasteType,
  } = useReportFilters();

  const loadData = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const safeDateRange = dateRange || { from: null, to: null };
      const safeComparisonRange = comparisonRange || null;
      const studentData = await getStudentReportData(studentId, safeDateRange, safeComparisonRange);
      setData(studentData);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent?.id) {
      loadData(selectedStudent.id);
    }
  }, [dateRange, selectedStudent]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    if (student) {
      loadData(student.id);
    } else {
      setData(null);
    }
  };

  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const stats = data ? [
    { 
      icon: Trash2, 
      label: t('reports.totalWaste'), 
      value: data.kpis?.totalWaste?.value || 0, 
      change: data.kpis?.totalWaste?.change || 0,
      suffix: ' kg' 
    },
    { 
      icon: DollarSign, 
      label: t('reports.totalEarnings'), 
      value: data.kpis?.totalEarnings?.value || 0, 
      change: data.kpis?.totalEarnings?.change || 0,
      prefix: 'Rp',
      isCurrency: true
    },
    { 
      icon: FileText, 
      label: t('reports.totalEntries'), 
      value: data.kpis?.totalEntries?.value || 0, 
      change: data.kpis?.totalEntries?.change || 0 
    },
    { 
      icon: BarChart3, 
      label: t('reports.avgPerEntry'), 
      value: data.kpis?.avgPerEntry?.value || 0, 
      change: data.kpis?.avgPerEntry?.change || 0,
      suffix: ' kg' 
    },
  ] : [];

  // Flatten entries for PDF export
  const flattenEntriesForPDF = () => {
    if (!data?.entries) return [];
    const flatEntries = [];
    data.entries.forEach((entry) => {
      entry.items.forEach((item) => {
        const wName = (item.wasteTypeName || '').trim();
        if (!wName) return;
        flatEntries.push({
          date: entry.date,
          wasteTypeName: wName,
          weight: item.weight || 0,
          rate: item.rate || 0,
          amount: item.amount || 0,
        });
      });
    });
    return flatEntries;
  };

  // Prepare PDF data structure
  const pdfData = data ? {
    student: data.student,
    entries: flattenEntriesForPDF(),
    totalWaste: data.kpis?.totalWaste?.value || 0,
    totalEarnings: data.kpis?.totalEarnings?.value || 0,
    totalEntries: data.kpis?.totalEntries?.value || 0,
    avgPerEntry: data.kpis?.avgPerEntry?.value || 0,
  } : null;

  const filters = {
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  };

  const dateGroups = useMemo(() => {
    if (!data?.entries) return [];
    return (data.entries || []).map(entry => ({
      dateKey: entry.date,
      entries: (entry.items || []).filter(i => (i.wasteTypeName || '').trim()).map(item => ({
        id: `${entry.date}-${item.wasteTypeName}-${Math.random().toString(36).slice(2, 6)}`,
        wasteTypeName: item.wasteTypeName,
        weight: item.weight || 0,
        rate: item.rate || 0,
        amount: item.amount || 0,
        date: entry.date,
      })),
      totalWeight: entry.totalWeight || 0,
      totalEarnings: entry.totalAmount || 0,
      entryCount: (entry.items || []).length,
    }));
  }, [data]);

  const totals = useMemo(() => ({
    totalWeight: (data?.entries || []).reduce((s, e) => s + (e.totalWeight || 0), 0),
    totalEarnings: (data?.entries || []).reduce((s, e) => s + (e.totalAmount || 0), 0),
  }), [data]);

  return (
    <div className="space-y-6">
      {/* Student Search - Always Visible */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              {t('wasteEntry.selectStudent')}
            </label>
            <p className="text-xs text-gray-500">{t('reports.searchStudent')}</p>
          </div>
        </div>
        <StudentSearchInput 
          value={selectedStudent}
          onChange={handleStudentSelect}
        />
      </div>

      {/* Date Range Picker - Only visible after student selected */}
      {selectedStudent && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <EnhancedDateRangePicker
              dateRange={dateRange}
              onDateRangeChange={updateDateRange}
              onRefresh={() => selectedStudent?.id && loadData(selectedStudent.id)}
              reportType="student"
            />
          </div>
          {data && (
            <ExportPDFButton
              reportType="student"
              data={pdfData}
              filters={filters}
            />
          )}
        </div>
      )}

      {!selectedStudent ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">{t('reports.selectStudent')}</p>
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Student Profile Card */}
          <StudentProfileCard student={data.student} />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} loading={loading} comparisonRange={comparisonRange} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WasteTrendChart 
              dailyData={data.charts?.trend || []}
              isLoading={loading}
            />
            <WasteDistributionChart 
              data={data.charts?.typeDistribution || []}
              isLoading={loading}
            />
          </div>

          {/* Entries */}
          <div className="space-y-4">
            {dateGroups.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-xl p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-gray-500 text-sm">{t('reports.noData')}</p>
              </div>
            ) : (
              dateGroups.map((dg, index) => (
                <DateGroupRow
                  key={dg.dateKey}
                  dateGroup={dg}
                  colorIndex={index}
                  isExpanded={expandedDates[dg.dateKey]}
                  onToggle={() => toggleDate(dg.dateKey)}
                />
              ))
            )}
            {dateGroups.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-4 md:p-5 text-white shadow-xl shadow-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/80 text-xs md:text-sm font-medium">{t('common.total')}</p>
                      <p className="text-lg md:text-xl font-bold">{dateGroups.length} {dateGroups.length === 1 ? 'day' : 'days'} of entries</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs md:text-sm">{formatNumber(totals.totalWeight || 0)} kg total waste</p>
                    <p className="text-xl md:text-2xl font-bold">Rp {formatNumber(totals.totalEarnings || 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Highlights Panel */}
          <HighlightsPanel 
            rank={data.rank}
            totalStudents={data.totalStudents}
            comparisonToAvg={data.comparisonToAvg}
          />
        </>
      ) : null}
    </div>
  );
}

function StudentProfileCard({ student }) {
  const { t } = useTranslation();
  const classGradient = getClassGradient(student.class);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="relative rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <StudentAvatar name={student.name} cls={student.class} size="lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md border-2 border-white">
                <User className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{student.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${classGradient} text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                  {student.class}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-600 text-xs font-bold">ID</span>
                  </span>
                  {student.studentId}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {t('common.joinedOn', { date: student.createdAt ? formatDateShort(student.createdAt) : 'N/A' })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 lg:ml-auto">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl px-4 py-3 border border-amber-200/50 shadow-md shadow-amber-100/50 hover:shadow-lg hover:shadow-amber-100/70 hover:scale-105 transition-all duration-300 cursor-default min-w-[130px]">
              <div className="flex items-center gap-2 text-amber-600">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">{t('reports.totalWaste')}</span>
              </div>
              <p className="text-lg font-bold text-amber-700 mt-1">{student.totalWaste?.toFixed(1) || '0.0'} kg</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl px-4 py-3 border border-green-200/50 shadow-md shadow-green-100/50 hover:shadow-lg hover:shadow-green-100/70 hover:scale-105 transition-all duration-300 cursor-default min-w-[130px]">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">{t('reports.totalEarnings')}</span>
              </div>
              <p className="text-lg font-bold text-green-700 mt-1">Rp{student.totalEarnings?.toLocaleString('id-ID', { minimumFractionDigits: 2 }) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getKPIColor(label) {
  if (!label) return 'emerald';
  const lower = label.toLowerCase();
  if (/waste|berat|sampah|total berat/i.test(lower)) return 'orange';
  if (/earning|pendapatan|uang|total earnings|jumlah/i.test(lower)) return 'gold';
  if (/student|siswa|people|active/i.test(lower)) return 'teal';
  if (/entry|entri|count|jumlah entri/i.test(lower)) return 'rainbow';
  if (/avg|rata|average|per entry|rata-rata/i.test(lower)) return 'violet';
  if (/top|rank|peringkat|performer|class|peringkat/i.test(lower)) return 'rose';
  return 'emerald';
}

const gradientColors = {
  orange: 'from-orange-500 to-red-500',
  gold: 'from-yellow-500 to-amber-500',
  teal: 'from-teal-500 to-cyan-500',
  rainbow: 'from-pink-500 via-purple-500 to-indigo-500',
  violet: 'from-violet-500 to-purple-600',
  rose: 'from-rose-500 to-pink-500',
  emerald: 'from-emerald-500 to-teal-500',
};

function StatCard({ icon: Icon, label, value, change, suffix = '', prefix = '', isCurrency = false, loading, comparisonRange }) {
  const cardColor = getKPIColor(label);
  const gradient = gradientColors[cardColor];
  const isTotalEntries = /entry|entri|count|jumlah entri/i.test(label || '');
  
  if (loading) {
    return (
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-gray-200 mb-4" />
          <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const isPositive = change >= 0;
  const displayValue = isCurrency 
    ? typeof value === 'number' ? value.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '0.00'
    : typeof value === 'number' ? value.toFixed(2) : '0.00';

  return (
    <div className={`glass-card p-5 relative overflow-hidden group ${isTotalEntries ? 'hover:scale-110' : 'hover:scale-105'} transition-all duration-300`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} ${isTotalEntries ? 'opacity-[0.2]' : 'opacity-[0.12]'} ${isTotalEntries ? 'group-hover:opacity-[0.35]' : 'group-hover:opacity-[0.2]'} transition-opacity duration-300`} />
      <div className="relative flex items-center justify-between mb-4">
        {isTotalEntries ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-xl shadow-fuchsia-500/40 group-hover:shadow-2xl group-hover:shadow-fuchsia-500/60 transition-all duration-300 animate-pulse-subtle">
            <Icon className="w-8 h-8 text-white" />
          </div>
        ) : (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            <span>{isPositive ? '↑' : '↓'}</span>
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {prefix}{displayValue}{suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {comparisonRange && (
        <div className="text-xs text-gray-400 mt-1">
          {formatComparisonPeriod(comparisonRange.from, comparisonRange.to)}
        </div>
      )}
    </div>
  );
}

function HighlightsPanel({ rank, totalStudents, comparisonToAvg }) {
  const { t } = useTranslation();

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="relative rounded-2xl bg-gradient-to-br from-[#1A6B3C] to-[#2E8B57] p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-300/40">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">{t('reports.insights')}</h3>
        </div>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-white/90">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">{rank}</span>
            </div>
            <span>{t('reports.youAreInTop', { rank })}</span>
          </li>
          <li className="flex items-center gap-3 text-white/90">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span>{t('reports.youCollected', { percent: Math.abs(comparisonToAvg).toFixed(1) })}</span>
          </li>
          <li className="flex items-center gap-3 text-white/90">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span>{t('reports.keepItUp')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
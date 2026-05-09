import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, DollarSign, FileText, BarChart3, ChevronDown, ChevronRight, Award, Calendar, User, TrendingUp, Target } from 'lucide-react';

import ExportPDFButton from '../../components/reports/ExportPDFButton';
import StudentSearchInput from '../../components/reports/StudentSearchInput';
import { formatDateShort } from '../../utils/dateHelpers';
import EnhancedDateRangePicker from '../../components/reports/EnhancedDateRangePicker';
import { useReportFilters, formatComparisonPeriod } from '../../hooks/reports/useReportFilters';
import { getStudentReportData, getAllClasses, getAllWasteTypes } from '../../firebase/reports';
import StudentAvatar from '../../components/ui/StudentAvatar';
import { getClassGradient } from '../../utils/studentUtils';

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
      const studentData = await getStudentReportData(studentId, dateRange, comparisonRange);
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
        flatEntries.push({
          date: entry.date,
          wasteTypeName: item.wasteTypeName || 'Unknown',
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

  return (
    <div className="space-y-6">
      <EnhancedDateRangePicker
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        onRefresh={() => selectedStudent?.id && loadData(selectedStudent.id)}
        reportType="student"
        pdfData={pdfData}
        filters={filters}
      />

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
        <EnhancedDateRangePicker
          dateRange={dateRange}
          onDateRangeChange={updateDateRange}
          onRefresh={() => selectedStudent?.id && loadData(selectedStudent.id)}
          reportType="student"
          pdfData={pdfData}
          filters={filters}
        />
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

          {/* Entries Table with Expandable Rows */}
          <EntriesTable 
            entries={data.entries || []} 
            expandedDates={expandedDates}
            toggleDate={toggleDate}
          />

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

function getWasteTypeGradient(wasteTypeName) {
  if (!wasteTypeName) return 'from-emerald-500 to-teal-500';
  const lower = wasteTypeName.toLowerCase();
  if (/plastic/i.test(lower)) return 'from-blue-500 to-blue-700';
  if (/paper/i.test(lower)) return 'from-yellow-500 to-amber-500';
  if (/glass/i.test(lower)) return 'from-teal-500 to-cyan-500';
  if (/metal/i.test(lower)) return 'from-gray-500 to-gray-600';
  if (/organic/i.test(lower)) return 'from-emerald-500 to-green-500';
  if (/e.?waste|electronic/i.test(lower)) return 'from-violet-500 to-purple-600';
  return 'from-emerald-500 to-teal-500';
}

function EntriesTable({ entries, expandedDates, toggleDate }) {
  const { t } = useTranslation();

  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.totalEntries')}</h3>
        <p className="text-gray-400 text-center py-8">{t('reports.noData')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-md p-6 shadow-lg shadow-gray-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('reports.totalEntries')}</h3>
          <p className="text-xs text-gray-500">{entries.length} {t('reports.totalEntries').toLowerCase()}</p>
        </div>
      </div>
      <div className="space-y-3">
        {entries.map((entry, entryIndex) => {
          const gradient = getWasteTypeGradient(entry.items?.[0]?.wasteTypeName);
          return (
            <div 
              key={entry.date} 
              className="group border border-gray-200/50 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <button
                onClick={() => toggleDate(entry.date)}
                className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-fuchsia-50/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {expandedDates[entry.date] ? (
                    <ChevronDown className="w-5 h-5 text-violet-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-400 transition-colors" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}>
                      <span className="text-white text-xs font-bold">{entryIndex + 1}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                        {formatDateShort(entry.date)}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${gradient} text-white shadow-sm`}>
                          {entry.items.length} {t('reports.totalEntries').toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{entry.totalWeight.toFixed(2)} kg</div>
                    <div className="text-xs text-gray-500">weight</div>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      Rp{entry.totalAmount.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500">earnings</div>
                  </div>
                </div>
              </button>
              
              {expandedDates[entry.date] && (
                <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white/80 backdrop-blur-sm p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {entry.items.map((item, idx) => {
                      const itemGradient = getWasteTypeGradient(item.wasteTypeName);
                      return (
                        <div 
                          key={idx} 
                          className="rounded-xl border border-gray-100/50 bg-white/90 backdrop-blur-sm p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 group/item"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${itemGradient} text-white text-sm font-semibold shadow-md group-hover/item:shadow-lg transition-shadow duration-300`}>
                              {item.wasteTypeName || 'Unknown'}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                              <span className="text-violet-600 text-xs font-bold">{idx + 1}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 uppercase tracking-wide">{t('reports.weight')}</span>
                              <span className="font-bold text-gray-900">{item.weight?.toFixed(2)} kg</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${itemGradient} transition-all duration-500`}
                                style={{ width: `${Math.min((item.weight / entry.totalWeight) * 100, 100)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div>
                                <span className="text-xs text-gray-400">Rate</span>
                                <div className="font-medium text-gray-700">Rp{item.rate?.toFixed(2)}</div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-400">{t('reports.amount')}</span>
                                <div className="font-bold text-green-600">
                                  Rp{item.amount?.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
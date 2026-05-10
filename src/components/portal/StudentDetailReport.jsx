import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Package, Coins, FileText, TrendingUp, Trophy, Target, Award } from 'lucide-react';
import { getEntriesByStudentAndDateRange } from '../../firebase/wasteEntries';
import { groupEntriesByDate } from '../../hooks/studentDetail/useStudentDetail';
import { getStudents } from '../../firebase/students';
import EnhancedDateRangePicker from '../../components/reports/EnhancedDateRangePicker';
import { formatDateForInput } from '../../utils/dateHelpers';
import { formatNumber } from '../../utils/portalHelpers';
import StudentAvatar from '../ui/StudentAvatar';
import { getClassGradient } from '../../utils/studentUtils';
import WasteTrendChart from '../dashboard/WasteTrendChart';
import WasteDistributionChart from '../dashboard/WasteDistributionChart';
import { format } from 'date-fns';

function formatKg(kg) {
  if (kg === 0) return '0 kg';
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`;
  return `${kg.toFixed(1)} kg`;
}

function formatCurrency(amount) {
  if (amount === 0) return 'Rp 0';
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(1)}K`;
  }
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFullCurrency(amount) {
  if (amount === 0) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PortalEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('portal.noStudentsFound')}</h3>
      <p className="text-gray-500 text-sm">{t('reports.selectStudent')}</p>
    </div>
  );
}

function getKPIColor(label) {
  if (!label) return 'emerald';
  const lower = label.toLowerCase();
  if (/waste|berat|sampah|total berat/i.test(lower)) return 'orange';
  if (/earning|pendapatan|uang|total earnings|jumlah/i.test(lower)) return 'gold';
  if (/entry|entri|count|jumlah entri/i.test(lower)) return 'rainbow';
  if (/avg|rata|average|per entry|rata-rata/i.test(lower)) return 'violet';
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

function KPICard({ icon: Icon, label, value, subValue }) {
  const cardColor = getKPIColor(label);
  const gradient = gradientColors[cardColor];
  const isTotalEntries = /entry|entri|count|jumlah entri/i.test(label || '');
  
  return (
    <div className={`glass-card p-5 relative overflow-hidden group ${isTotalEntries ? 'hover:scale-110' : 'hover:scale-105'} transition-all duration-300`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} ${isTotalEntries ? 'opacity-[0.2]' : 'opacity-[0.12]'} ${isTotalEntries ? 'group-hover:opacity-[0.35]' : 'group-hover:opacity-[0.2]'} transition-opacity duration-300`} />
      <div className="relative flex items-center justify-between mb-4">
        {isTotalEntries ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-xl shadow-fuchsia-500/40 group-hover:shadow-2xl group-hover:shadow-fuchsia-500/60 transition-all duration-300">
            <Icon className="w-8 h-8 text-white" />
          </div>
        ) : (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
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
          <h3 className="text-lg font-semibold">{t('portal.insights')}</h3>
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
            <span>{t('reports.youCollected', { percent: Math.abs(comparisonToAvg || 0).toFixed(1) })}</span>
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

export default function StudentDetailReport({ student }) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: firstDayOfMonth, to: today };
  });
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    if (!student) return;
    
    const fetchData = async () => {
      setLoading(true);
      setExpandedDates({});
      try {
        const fromDate = formatDateForInput(dateRange.from);
        const toDate = formatDateForInput(dateRange.to);
        const data = await getEntriesByStudentAndDateRange(student.id, fromDate, toDate);
        setEntries(data);
      } catch (error) {
        // Silent fail
      }
      setLoading(false);
    };
    
    fetchData();
  }, [dateRange.from, dateRange.to, student]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const result = await getStudents(100);
        setStudents(result.students || []);
      } catch (error) {
        // Silent fail
      }
    };
    fetchStudents();
  }, []);

  const handleDateRangeChange = (from, to) => {
    setDateRange({ from, to });
  };

  const dateGroups = useMemo(() => groupEntriesByDate(entries), [entries]);
  const summary = useMemo(() => {
    const typeMap = {
      'Plastic Bottles': 'Plastic',
      'Plastic': 'Plastic',
      'Paper Waste': 'Paper',
      'Paper': 'Paper',
      'Glass': 'Glass',
      'Cans': 'Metal',
      'Metal': 'Metal',
      'E-Waste': 'E-Waste'
    };
    
    const uniqueTypes = {};
    const summaries = {};
    
    entries.forEach((entry) => {
      const rawType = entry.wasteTypeName || entry.wasteType || 'Other';
      const type = typeMap[rawType] || rawType;
      
      uniqueTypes[type] = true;
      if (!summaries[type]) {
        summaries[type] = { quantity: 0, earned: 0 };
      }
      summaries[type].quantity += entry.weight || 0;
      summaries[type].earned += entry.amount || 0;
    });
    
    return { types: Object.keys(uniqueTypes), summaries };
  }, [entries]);
  
  const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const avgPerEntry = entries.length > 0 ? totalWeight / entries.length : 0;
  
  const chartData = useMemo(() => {
    return entries.map(entry => ({
      date: entry.date?.toDate ? format(entry.date.toDate(), 'MMM d') : format(new Date(entry.date), 'MMM d'),
      waste: entry.weight || 0
    }));
  }, [entries]);
  
  const typeDistribution = useMemo(() => {
    return Object.entries(summary.summaries).map(([type, data]) => ({
      name: type,
      value: data.quantity
    }));
  }, [summary]);

  const rank = useMemo(() => {
    if (!student || students.length === 0) return 50;
    const rankedStudents = [...students].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
    const rankIndex = rankedStudents.findIndex(s => s.id === student.id);
    return rankIndex >= 0 ? rankIndex + 1 : 50;
  }, [student, students]);

  const comparisonToAvg = useMemo(() => {
    if (!students.length || !totalWeight) return 0;
    const avgWeight = students.reduce((sum, s) => sum + (s.totalWaste || 0), 0) / students.length;
    if (avgWeight === 0) return 0;
    return ((totalWeight - avgWeight) / avgWeight) * 100;
  }, [students, totalWeight]);

  if (!student) {
    return <PortalEmptyState />;
  }

  const toggleDateExpansion = (dateKey) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const isDateExpanded = (dateKey) => !!expandedDates[dateKey];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>

      {/* Student Header */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
        <div className="relative flex items-center gap-5 animate-fade-in p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg">
          <StudentAvatar name={student.name} cls={student.class} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-1 truncate">{student.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getClassGradient(student.class)} text-white shadow-sm`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                {student.class}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                ID: {student.studentId}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {entries.length} {t('portal.collections')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('portal.dateRange')}</h3>
        <EnhancedDateRangePicker
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          reportType="portal"
          pdfData={{
            student: {
              ...student,
              totalWaste: student?.totalWaste || 0,
              totalEarnings: student?.totalEarnings || 0,
              totalEntries: entries.length,
              avgPerEntry: entries.length > 0 ? (student?.totalWaste || 0) / entries.length : 0
            },
            entries
          }}
          filters={{ dateFrom: dateRange.from.toISOString(), dateTo: dateRange.to.toISOString() }}
        />
      </div>

      {/* KPI Stats Section - Match StudentReport design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Package}
          label={t('portal.totalWaste')}
          value={formatKg(totalWeight)}
          subValue={t('portal.collected')}
        />
        <KPICard
          icon={Coins}
          label={t('portal.earnings')}
          value={formatCurrency(totalEarnings)}
          subValue={t('portal.totalEarned')}
        />
        <KPICard
          icon={FileText}
          label={t('portal.entries')}
          value={entries.length}
          subValue={t('portal.totalCollections')}
        />
        <KPICard
          icon={TrendingUp}
          label={t('portal.avgPerEntry')}
          value={formatKg(avgPerEntry)}
          subValue={t('portal.averageWeight')}
        />
      </div>

      {/* Charts Section */}
      {!loading && entries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WasteTrendChart dailyData={chartData} isLoading={loading} />
          <WasteDistributionChart data={typeDistribution} isLoading={loading} />
        </div>
      )}

      {/* Card-based Collection Summary with Progress Bars */}
      {!loading && entries.length > 0 && summary.types.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('portal.collectionSummary')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.types.map((type) => {
              const data = summary.summaries[type] || { quantity: 0, earned: 0 };
              const percentage = totalWeight > 0 ? ((data.quantity / totalWeight) * 100).toFixed(0) : 0;
              const typeColors = {
                'Plastic': { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', bar: 'bg-blue-500', card: 'from-blue-50 to-blue-100/50' },
                'Paper': { bg: 'from-yellow-500 to-amber-500', text: 'text-yellow-600', bar: 'bg-yellow-500', card: 'from-yellow-50 to-amber-100/50' },
                'Metal': { bg: 'from-slate-500 to-gray-600', text: 'text-slate-600', bar: 'bg-slate-500', card: 'from-slate-50 to-gray-100/50' },
                'E-Waste': { bg: 'from-emerald-500 to-green-600', text: 'text-emerald-600', bar: 'bg-emerald-500', card: 'from-emerald-50 to-green-100/50' },
                'Glass': { bg: 'from-cyan-500 to-teal-600', text: 'text-cyan-600', bar: 'bg-cyan-500', card: 'from-cyan-50 to-teal-100/50' },
                'Other': { bg: 'from-violet-500 to-purple-600', text: 'text-violet-600', bar: 'bg-violet-500', card: 'from-violet-50 to-purple-100/50' }
              };
              const colors = typeColors[type] || typeColors['Other'];
              return (
                <div
                  key={type}
                  className={`relative group bg-gradient-to-br ${colors.card} backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100/50 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03] transition-all duration-300`}
                >
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${colors.bg} text-white shadow-md`}>
                        {type}
                      </span>
                      <span className={`text-xs font-medium ${colors.text}`}>{percentage}%</span>
                    </div>
                    
                    <div className="mb-3">
                      <p className={`text-2xl font-bold ${colors.text}`}>
                        {formatKg(data.quantity)}
                      </p>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div 
                        className={`h-full ${colors.bar} rounded-full transition-all duration-500`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <p className="text-sm text-green-600 font-medium">
                      {formatFullCurrency(data.earned)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card-based Detailed Report - Expandable by Date */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-white to-green-50/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{t('portal.detailedReport')}</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">{t('portal.noData')}</h4>
            <p className="text-gray-400 text-sm">{t('portal.noCollectionsFound')}</p>
          </div>
        ) : (
          <>
            {/* Card-based Date Groups */}
            <div className="divide-y divide-gray-100">
              {dateGroups.map((dateGroup, index) => {
                const dateWeight = dateGroup.entries.reduce((sum, e) => sum + (e.weight || 0), 0);
                const dateEarnings = dateGroup.entries.reduce((sum, e) => sum + (e.amount || 0), 0);
                const firstType = dateGroup.entries[0]?.wasteTypeName || dateGroup.entries[0]?.wasteType || 'Other';
                const typeColors = {
                  'Plastic': 'from-blue-500 to-blue-600',
                  'Paper': 'from-yellow-500 to-amber-500',
                  'Metal': 'from-slate-500 to-gray-600',
                  'E-Waste': 'from-emerald-500 to-green-600',
                  'Glass': 'from-cyan-500 to-teal-600',
                  'Other': 'from-violet-500 to-purple-600'
                };
                const badgeColor = typeColors[firstType] || typeColors['Other'];
                
                return (
                  <div key={dateGroup.dateKey}>
                    <div 
                      className={`flex items-center gap-4 p-5 cursor-pointer hover:bg-green-50/80 transition-all duration-300 group/date ${isDateExpanded(dateGroup.dateKey) ? 'bg-green-50/50' : ''}`}
                      onClick={() => toggleDateExpansion(dateGroup.dateKey)}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badgeColor} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover/date:scale-110 transition-transform duration-300`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-800">
                          {format(new Date(dateGroup.dateKey), 'MMMM d, yyyy')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${badgeColor} text-white`}>
                            {dateGroup.entries.length} {t('portal.entries')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">{formatKg(dateWeight)}</p>
                        <p className="text-sm text-green-600 font-medium">{formatCurrency(dateEarnings)}</p>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isDateExpanded(dateGroup.dateKey) ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {isDateExpanded(dateGroup.dateKey) && (
                      <div className="px-5 pb-5 bg-gray-50/50 animate-slide-down">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 pl-14">
                          {dateGroup.entries.map((entry, entryIndex) => {
                            const entryPercentage = dateWeight > 0 ? ((entry.weight / dateWeight) * 100).toFixed(0) : 0;
                            const entryTypeColors = typeColors[entry.wasteTypeName || entry.wasteType] || typeColors['Other'];
                            return (
                              <div 
                                key={entryIndex}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${entryTypeColors} text-white`}>
                                    {entry.wasteTypeName || entry.wasteType || 'Other'}
                                  </span>
                                  <span className="text-xs text-gray-400">{entryPercentage}%</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">{t('portal.weight')}</span>
                                    <span className="text-sm font-bold text-gray-800">{formatKg(entry.weight)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">{t('portal.rate')}</span>
                                    <span className="text-sm font-medium text-gray-600">Rp {entry.rate}/kg</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className={`h-full bg-gradient-to-r ${entryTypeColors} rounded-full`} style={{ width: `${entryPercentage}%` }} />
                                  </div>
                                  <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">{t('portal.amount')}</span>
                                    <span className="text-sm font-bold text-green-600">{formatFullCurrency(entry.amount)}</span>
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

            {/* Grand Total */}
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 border-t border-green-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-bold text-gray-800">{t('portal.total')}</span>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-800">{formatNumber(totalWeight)} kg</span>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <span className="text-lg font-bold text-green-600">{formatFullCurrency(totalEarnings)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Highlights Panel - Match StudentReport design (at the end) */}
      {!loading && entries.length > 0 && (
        <HighlightsPanel 
          rank={rank}
          totalStudents={students.length}
          comparisonToAvg={comparisonToAvg}
        />
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, DollarSign, Users, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

import EnhancedDateRangePicker from '../../components/reports/EnhancedDateRangePicker';
import { useReportFilters, formatComparisonPeriod } from '../../hooks/reports/useReportFilters';
import { getOverviewData, getAllClasses, getAllWasteTypes } from '../../firebase/reports';

import WasteTrendChart from '../../components/dashboard/WasteTrendChart';
import WasteDistributionChart from '../../components/dashboard/WasteDistributionChart';

export default function OverviewReport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  
  const { 
    dateRange, 
    comparisonRange,
    selectedClass, 
    selectedWasteType,
    updateDateRange, 
    updateClass, 
    updateWasteType,
    resetFilters 
  } = useReportFilters();

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, classData, typeData] = await Promise.all([
        getOverviewData(dateRange, comparisonRange, selectedClass, selectedWasteType),
        getAllClasses(),
        getAllWasteTypes()
      ]);
      setData(overviewData);
      setClasses(classData);
      setWasteTypes(typeData);
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, selectedClass, selectedWasteType]);

  const stats = [
    { 
      icon: Trash2, 
      label: t('reports.totalWaste'), 
      value: data?.kpis?.totalWaste?.value || 0, 
      change: data?.kpis?.totalWaste?.change || 0,
      suffix: ' kg' 
    },
    { 
      icon: DollarSign, 
      label: t('reports.totalEarnings'), 
      value: data?.kpis?.totalEarnings?.value || 0, 
      change: data?.kpis?.totalEarnings?.change || 0,
      prefix: 'Rp',
      isCurrency: true
    },
    { 
      icon: Users, 
      label: t('reports.activeStudents'), 
      value: data?.kpis?.activeStudents?.value || 0, 
      change: data?.kpis?.activeStudents?.change || 0 
    },
    { 
      icon: BarChart3, 
      label: t('reports.avgWaste'), 
      value: data?.kpis?.avgPerStudent?.value || 0, 
      change: data?.kpis?.avgPerStudent?.change || 0,
      suffix: ' kg' 
    },
  ];

  return (
    <div className="space-y-6">
      <EnhancedDateRangePicker
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        onRefresh={loadData}
        showClassFilter
        showWasteTypeFilter
        classes={classes}
        wasteTypes={wasteTypes}
        selectedClass={selectedClass}
        selectedWasteType={selectedWasteType}
        onClassChange={updateClass}
        onWasteTypeChange={updateWasteType}
        reportType="overview"
        pdfData={data}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} comparisonRange={comparisonRange} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WasteTrendChart 
          dailyData={data?.charts?.trend || []}
          isLoading={loading}
        />
        <WasteDistributionChart 
          data={data?.charts?.typeDistribution || []}
          isLoading={loading}
        />
      </div>

      {/* Top Students + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopStudentsTable students={data?.topStudents || []} loading={loading} />
        </div>
        <InsightsPanel data={data} loading={loading} />
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
    <div className="glass-card p-5 relative overflow-hidden group hover:scale-105 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.12] group-hover:opacity-[0.2] transition-opacity duration-300`} />
      <div className="relative flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
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

function TopStudentsTable({ students, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.topStudents')}</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const maxWaste = Math.max(...students.map(s => s.totalWaste), 1);

  const getRankBadge = (rank) => {
    const badges = {
      0: { gradient: 'from-yellow-400 to-amber-500', shadow: 'shadow-yellow-400/40', text: '🥇' },
      1: { gradient: 'from-gray-300 to-gray-400', shadow: 'shadow-gray-400/40', text: '🥈' },
      2: { gradient: 'from-orange-400 to-orange-500', shadow: 'shadow-orange-400/40', text: '🥉' },
    };
    return badges[rank] || { gradient: 'from-gray-200 to-gray-300', shadow: '', text: null };
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.topStudents')}</h3>
      <div className="space-y-3">
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {t('reports.noData')}
          </div>
        ) : students.map((student, index) => {
          const badge = getRankBadge(index);
          const barWidth = (student.totalWaste / maxWaste) * 100;
          const isTop3 = index < 3;
          
          return (
            <div 
              key={student.studentId} 
              className="relative overflow-hidden rounded-xl p-4 group hover:scale-[1.02] transition-all duration-300 cursor-default"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${badge.gradient} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-300`} />
              
              <div className="relative flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${badge.gradient} ${badge.shadow} shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center min-w-[48px]`}>
                  <span className="text-sm font-bold text-white">
                    {isTop3 ? badge.text : index + 1}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                      <span className="text-xs font-bold text-white">
                        {student.studentName?.[0]?.toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{student.studentName}</p>
                      <p className="text-xs text-gray-500">{student.studentClass}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${badge.gradient} rounded-full transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{student.totalWaste.toFixed(2)} kg</p>
                  <p className="text-xs font-semibold text-emerald-600">Rp{student.totalEarnings.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightsPanel({ data, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="h-6 w-20 bg-gray-100 rounded mb-4" />
          <div className="h-4 bg-gray-100 rounded mb-2" />
          <div className="h-4 bg-gray-100 rounded mb-2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  const insights = [];
  
  if (data?.kpis?.totalWaste?.change) {
    const change = data.kpis.totalWaste.change.toFixed(1);
    insights.push(t('reports.wasteIncrease', { percent: Math.abs(change) }));
  }
  
  if (data?.topClass) {
    const totalWaste = data.kpis?.totalWaste?.value || 1;
    const classWaste = 0;
    const percent = ((classWaste / totalWaste) * 100).toFixed(1);
    insights.push(t('reports.classLeading', { class: data.topClass, percent: '34.8' }));
  }
  
  if (data?.topWasteType) {
    insights.push(t('reports.plasticLeading', { percent: '45.2' }));
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1A6B3C] to-[#2E8B57] p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💡</span>
        <h3 className="text-lg font-semibold">{t('reports.insights')}</h3>
      </div>
      <ul className="space-y-3">
        {insights.length > 0 ? insights.map((insight, index) => (
          <li key={index} className="text-sm text-white/90 leading-relaxed">
            • {insight}
          </li>
        )) : (
          <li className="text-sm text-white/70">{t('reports.noData')}</li>
        )}
      </ul>
    </div>
  );
}
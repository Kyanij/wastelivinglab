import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Trash2, 
  Users, 
  TrendingUp,
  Wallet
} from 'lucide-react';

import EnhancedDateRangePicker from '../../components/reports/EnhancedDateRangePicker';
import { useReportFilters } from '../../hooks/reports/useReportFilters';
import { getClassReportData } from '../../firebase/reports';
import { formatNumber } from '../../utils/portalHelpers';
import StudentAvatar from '../../components/ui/StudentAvatar';
import StatCard from '../../components/dashboard/StatCard';
import WasteTrendChart from '../../components/dashboard/WasteTrendChart';

export default function ClassReport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedClass, setSelectedClass] = useState('all');
  
  const { 
    dateRange, 
    comparisonRange,
    updateDateRange,
    resetFilters 
  } = useReportFilters();

  const loadData = async () => {
    setLoading(true);
    try {
      const reportData = await getClassReportData(dateRange, comparisonRange, selectedClass);
      setData(reportData);
    } catch (error) {
      console.error('Error loading class data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, selectedClass]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleReset = () => {
    setSelectedClass('all');
    resetFilters();
  };

  const hasActiveFilters = selectedClass !== 'all';

  const stats = data ? [
    { 
      icon: Trash2, 
      label: t('reports.totalWaste'), 
      value: data.kpis?.totalWaste?.value || 0, 
      trend: data.kpis?.totalWaste?.change,
      suffix: ' kg' 
    },
    { 
      icon: Wallet, 
      label: t('reports.totalEarnings'), 
      value: data.kpis?.totalEarnings?.value || 0, 
      trend: data.kpis?.totalEarnings?.change,
      prefix: 'Rp ',
      isCurrency: true
    },
    { 
      icon: Users, 
      label: data?.isClassSelected ? t('reports.activeStudents') : t('reports.totalStudents'), 
      value: data.kpis?.activeStudents?.value || 0,
      trend: data.kpis?.activeStudents?.change
    },
    { 
      icon: TrendingUp, 
      label: data?.isClassSelected ? t('reports.avgPerStudent') : t('reports.avgPerClass'), 
      value: data?.isClassSelected ? data.kpis?.avgPerStudent?.value || 0 : data.kpis?.avgPerClass?.value || 0, 
      trend: data?.isClassSelected ? data.kpis?.avgPerStudent?.change : data.kpis?.avgPerClass?.change,
      suffix: ' kg' 
    },
  ] : [];

  // Prepare trend data for WasteTrendChart
  const trendData = useMemo(() => {
    if (!data?.charts) return { daily: [], weekly: [], monthly: [] };
    return {
      daily: data.charts.trend || [],
      weekly: data.charts.weeklyTrend || [],
      monthly: data.charts.monthlyTrend || []
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <EnhancedDateRangePicker
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        onRefresh={loadData}
        reportType="class"
        pdfData={data}
        classDropdown={data?.allClasses}
        classValue={selectedClass}
        classOnChange={handleClassChange}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard 
            key={index} 
            icon={stat.icon} 
            label={stat.label} 
            value={stat.value} 
            trend={stat.trend}
            suffix={stat.suffix}
            prefix={stat.prefix}
            isLoading={loading}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart 
          data={data?.isClassSelected ? data.charts.studentRanking : data?.charts.classDistribution} 
          isClassSelected={data?.isClassSelected}
          selectedClass={selectedClass}
          loading={loading}
        />
        <WasteTrendChart 
          dailyData={trendData.daily}
          weeklyData={trendData.weekly}
          monthlyData={trendData.monthly}
          isLoading={loading}
        />
      </div>

      {/* Insights Panel */}
      <InsightsPanel data={data} isClassSelected={data?.isClassSelected} loading={loading} />
    </div>
  );
}

function HorizontalBarChart({ data, isClassSelected, selectedClass, loading }) {
  const { t } = useTranslation();

  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(d => d.totalWaste || d.waste || 0), 1);
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="animate-pulse h-6 w-48 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {isClassSelected 
            ? t('reports.studentsInClass', { class: selectedClass })
            : t('reports.wasteByClass')
          }
        </h3>
        <div className="text-center py-12 text-gray-400">
          {t('common.noData')}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-50/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <h3 className="text-lg font-semibold text-gray-900 mb-6 relative z-10">
        {isClassSelected 
          ? t('reports.studentsInClass', { class: selectedClass })
          : t('reports.wasteByClass')
        }
      </h3>
      
      <div className="space-y-3 relative z-10">
        {data.map((item, index) => {
          const value = item.totalWaste || item.waste || 0;
          const percentage = (value / maxValue) * 100;
          
          return (
            <div
              key={isClassSelected ? item.studentId : item.class}
              className="group relative p-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-gray-50"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-500`}>
                  {index + 1}
                </div>

                {/* Avatar or Class Icon */}
                {isClassSelected ? (
                  <StudentAvatar name={item.studentName} size="sm" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    {item.class?.charAt(0)}
                  </div>
                )}

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {isClassSelected ? item.studentName : item.class}
                  </p>
                  {isClassSelected && (
                    <p className="text-xs text-gray-500">
                      Rp {formatNumber(item.totalEarnings || 0)}
                    </p>
                  )}
                </div>

                {/* Value */}
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">
                    {formatNumber(value)} kg
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-green-400 to-emerald-400 group-hover:shadow-sm"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightsPanel({ data, isClassSelected, loading }) {
  const { t } = useTranslation();

  const getTranslatedWasteType = (name) => {
    const translated = t(`wasteTypesList.${name}`);
    return translated === `wasteTypesList.${name}` ? name : translated;
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#1A6B3C] to-[#2E8B57] p-6">
        <div className="animate-pulse">
          <div className="h-6 w-24 bg-white/20 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded" />
            <div className="h-4 bg-white/20 rounded w-3/4" />
            <div className="h-4 bg-white/20 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const insights = [];

  if (!isClassSelected) {
    // Insights for All Classes view
    if (data?.insights?.topClass) {
      insights.push(t('reports.classLeads', { 
        class: data.insights.topClass.class, 
        percent: data.insights.topClassPercent 
      }));
    }
    
    if (data?.insights?.totalClasses) {
      insights.push(t('reports.classesActive', { count: data.insights.totalClasses }));
    }
    
    if (data?.insights?.avgPerClass) {
      insights.push(t('reports.avgClassWaste', { value: data.insights.avgPerClass.toFixed(1) }));
    }
  } else {
    // Insights for selected class view
    if (data?.insights?.bestStudent) {
      insights.push(t('reports.bestStudent', { 
        name: data.insights.bestStudent.studentName, 
        waste: data.insights.bestStudent.totalWaste.toFixed(1) 
      }));
    }
    
    if (data?.kpis?.activeStudents?.value !== undefined) {
      insights.push(t('reports.studentsInClassCount', { count: data.kpis.activeStudents.value }));
    }
    
    if (data?.insights?.avgPerStudent) {
      insights.push(t('reports.avgStudentWaste', { value: data.insights.avgPerStudent.toFixed(1) }));
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1A6B3C] to-[#2E8B57] p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💡</span>
        <h3 className="text-lg font-semibold">{t('reports.insights')}</h3>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="text-sm text-white/90 leading-relaxed">
            • {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}
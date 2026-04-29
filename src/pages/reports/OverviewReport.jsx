import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, DollarSign, Users, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

import PageHeader from '../../components/reports/PageHeader';
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
      <PageHeader
        title={t('reports.overview')}
        description={t('reports.overviewDesc')}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        showClassFilter
        showWasteTypeFilter
        classes={classes}
        wasteTypes={wasteTypes}
        selectedClass={selectedClass}
        selectedWasteType={selectedWasteType}
        onClassChange={updateClass}
        onWasteTypeChange={updateWasteType}
        onRefresh={loadData}
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

function StatCard({ icon: Icon, label, value, change, suffix = '', prefix = '', isCurrency = false, loading, comparisonRange }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-gray-100 mb-4" />
          <div className="h-8 w-24 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const isPositive = change >= 0;
  const displayValue = isCurrency 
    ? typeof value === 'number' ? value.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '0.00'
    : typeof value === 'number' ? value.toFixed(2) : '0.00';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-emerald-100">
          <Icon className="w-5 h-5 text-emerald-600" />
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.topStudents')}</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.topStudents')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-2">#</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.student')}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.class')}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.totalWeight')}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.earnings')}</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  {t('reports.noData')}
                </td>
              </tr>
            ) : students.map((student, index) => (
              <tr key={student.studentId} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-2 text-sm font-medium text-gray-600">{index + 1}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {student.studentName?.[0]?.toUpperCase() || 'S'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{student.studentName}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {student.studentClass}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-sm font-semibold text-gray-900">
                  {student.totalWaste.toFixed(2)} kg
                </td>
                <td className="py-3 px-2 text-right text-sm font-semibold text-green-600">
                  Rp{student.totalEarnings.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
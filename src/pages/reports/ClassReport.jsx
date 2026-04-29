import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Building2, Users, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

import PageHeader from '../../components/reports/PageHeader';
import { useReportFilters, formatComparisonPeriod } from '../../hooks/reports/useReportFilters';
import { getClassReportData } from '../../firebase/reports';

export default function ClassReport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  const { 
    dateRange, 
    comparisonRange,
    updateDateRange,
    resetFilters 
  } = useReportFilters();

  const loadData = async () => {
    setLoading(true);
    try {
      const reportData = await getClassReportData(dateRange, comparisonRange);
      setData(reportData);
    } catch (error) {
      console.error('Error loading class data:', error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const stats = data ? [
    { 
      icon: Trash2, 
      label: t('reports.totalWasteAllClasses'), 
      value: data.kpis?.totalWaste?.value || 0, 
      suffix: ' kg' 
    },
    { 
      icon: Building2, 
      label: t('reports.activeClasses'), 
      value: data.kpis?.activeClasses?.value || 0 
    },
    { 
      icon: Users, 
      label: t('reports.totalStudents'), 
      value: data.kpis?.totalStudents?.value || 0 
    },
    { 
      icon: BarChart3, 
      label: t('reports.avgPerClass'), 
      value: data.kpis?.avgPerClass?.value || 0, 
      suffix: ' kg' 
    },
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports.class')}
        description={t('reports.classDesc')}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        onRefresh={loadData}
        onExport={() => {}}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassBarChart data={data?.charts?.classDistribution || []} loading={loading} />
        <ClassRankingTable data={data?.ranking || []} loading={loading} />
      </div>

      {/* Footer Callout */}
      {data?.leadingClass && !loading && (
        <div className="rounded-2xl bg-gradient-to-br from-[#1A6B3C] to-[#2E8B57] p-6 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <p className="text-lg font-semibold">
              {t('reports.classLeadingMsg', { class: data.leadingClass })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix = '', loading }) {
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

  const displayValue = typeof value === 'number' ? value.toFixed(2) : '0.00';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-emerald-100">
          <Icon className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {displayValue}{suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function ClassBarChart({ data, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.wasteByType')}</h3>
        <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.waste), 1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('reports.wasteByType')}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.class} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">{item.class}</span>
              <span className="text-gray-600">{item.waste.toFixed(2)} kg</span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#1A6B3C] to-[#2E8B57] rounded-lg transition-all duration-500"
                style={{ width: `${(item.waste / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassRankingTable({ data, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.class')}</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const getMedal = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return rank + 1;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.class')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.rank')}</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.class')}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.totalWeight')}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.avgPerStudent')}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  {t('reports.noData')}
                </td>
              </tr>
            ) : data.map((item, index) => (
              <tr key={item.class} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-2">
                  <span className="text-lg">{getMedal(index)}</span>
                  {index > 2 && <span className="ml-2 text-sm font-medium text-gray-600">{index + 1}</span>}
                </td>
                <td className="py-3 px-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {item.class}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-sm font-semibold text-gray-900">
                  {item.totalWaste.toFixed(2)} kg
                </td>
                <td className="py-3 px-2 text-right text-sm text-gray-600">
                  {item.avgPerStudent.toFixed(2)} kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
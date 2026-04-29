import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, DollarSign, FileText, Recycle } from 'lucide-react';

import PageHeader from '../../components/reports/PageHeader';
import { useReportFilters } from '../../hooks/reports/useReportFilters';
import { getWasteAnalysisData } from '../../firebase/reports';

import WasteDistributionChart from '../../components/dashboard/WasteDistributionChart';

export default function WasteAnalysisReport() {
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
      const reportData = await getWasteAnalysisData(dateRange, comparisonRange);
      setData(reportData);
    } catch (error) {
      console.error('Error loading waste analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

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
      icon: Recycle, 
      label: t('reports.wasteAnalysis'), 
      value: data.kpis?.wasteTypes?.value || 0 
    },
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports.wasteAnalysis')}
        description={t('reports.wasteAnalysisDesc')}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        onRefresh={loadData}
        reportType="waste"
        pdfData={data}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WasteDistributionChart 
          data={data?.charts?.donut || []}
          isLoading={loading}
        />
        <MultiLineChart 
          data={data?.charts?.multiLine || []}
          loading={loading}
        />
      </div>

      {/* Summary Table */}
      <WasteTypeSummaryTable data={data?.summary || []} loading={loading} />

      {/* Insights Panel */}
      {data && !loading && (
        <InsightsPanel data={data} />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, suffix = '', prefix = '', isCurrency = false, loading }) {
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
    </div>
  );
}

function MultiLineChart({ data, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.wasteByType')}</h3>
        <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.wasteByType')}</h3>
        <p className="text-gray-400 text-center py-8">{t('reports.noData')}</p>
      </div>
    );
  }

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const types = Object.keys(data[0] || {}).filter(k => k !== 'date');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.wasteByType')}</h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {types.map((type, idx) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
            <span className="text-sm text-gray-600">{type}</span>
          </div>
        ))}
      </div>

      {/* Simple bar visualization for each type */}
      <div className="space-y-4">
        {types.map((type, typeIdx) => {
          const values = data.map(d => d[type] || 0);
          const total = values.reduce((a, b) => a + b, 0);
          const maxValue = Math.max(...values, 1);
          
          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{type}</span>
                <span className="text-gray-600">{total.toFixed(2)} kg</span>
              </div>
              <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full rounded-lg transition-all duration-500"
                  style={{ 
                    width: `${(total / data.reduce((sum, d) => {
                      return Math.max(...Object.values(d).filter(v => typeof v === 'number'), sum);
                    }, 0)) * 100}%`,
                    backgroundColor: colors[typeIdx % colors.length]
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WasteTypeSummaryTable({ data, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.wasteTypeSummary')}</h3>
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.wasteTypeSummary')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.wasteTypeCol')}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.weightCol')}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.percentageCol')}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.earningsCol')}</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-2">{t('reports.avgRateCol')}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  {t('reports.noData')}
                </td>
              </tr>
            ) : data.map((item, index) => (
              <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right text-sm font-semibold text-gray-900">
                  {item.weight.toFixed(2)} kg
                </td>
                <td className="py-3 px-2 text-right text-sm text-gray-600">
                  {item.percentage.toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-right text-sm font-semibold text-green-600">
                  Rp{item.earnings.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-2 text-right text-sm text-gray-600">
                  Rp{item.avgRate.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InsightsPanel({ data }) {
  const { t } = useTranslation();

  const insights = [];
  
  if (data?.topType) {
    const plasticPercent = data.summary?.find(s => s.name === 'Plastic')?.percentage || 0;
    insights.push(t('reports.plasticMost', { percent: plasticPercent.toFixed(1) }));
  }
  
  if (data?.secondType) {
    const paperPercent = data.summary?.find(s => s.name === 'Paper')?.percentage || 0;
    insights.push(t('reports.paperSecond', { percent: paperPercent.toFixed(1) }));
  }
  
  insights.push(t('reports.focusReducing'));

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
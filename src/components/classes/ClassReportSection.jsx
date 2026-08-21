import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { BarChart3, TrendingUp, Package, Wallet, FileText, RotateCcw, Download, ChevronDown, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend,
} from 'recharts';
import { useClassReport } from '../../hooks/classes/useClassReport';
import WasteTrendChart from '../dashboard/WasteTrendChart';
import { formatNumber } from '../../utils/portalHelpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import ExportPDFButton from '../reports/ExportPDFButton';
import { prepareClassWasteDataFromHook } from '../../firebase/classWasteReports';

const WASTE_TYPE_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const CLASS_COLORS = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-orange-500 to-red-500',
  'from-teal-500 to-cyan-500',
];

const WASTE_TYPE_GRADIENTS = {
  'Plastic': 'from-blue-500 to-blue-700',
  'Paper': 'from-amber-500 to-yellow-600',
  'Glass': 'from-cyan-500 to-teal-500',
  'Metal': 'from-slate-500 to-gray-600',
  'Organic': 'from-green-500 to-emerald-600',
  'EWaste': 'from-purple-500 to-violet-600',
};

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-emerald-600">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};


// Skeleton loader component for smooth UX
function ChartSkeleton({ height = 280 }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
      <div className={`bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl`}
           style={{ height: height + 'px' }} />
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
      <div className="h-6 bg-gray-200 rounded w-24" />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, gradient, prefix = '', suffix = '' }) {
  return (
    <div className="glass-card p-4 relative overflow-hidden group hover:scale-105 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity`} />
      <div className="relative flex items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{prefix}{formatNumber(value)}{suffix}</p>
        </div>
      </div>
    </div>
  );
}

function WasteTypeTable({ data }) {
  const { t } = useTranslation();
  const maxWeight = Math.max(...data.map(d => d.weight), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-50">
            <FileText className="w-4 h-4 text-violet-600" />
          </div>
          <CardTitle className="text-base">{t('classReport.wasteTypeBreakdown')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, idx) => {
            const gradient = WASTE_TYPE_GRADIENTS[item.name] || CLASS_COLORS[idx % CLASS_COLORS.length];
            const barWidth = (item.weight / maxWeight) * 100;
            return (
              <div key={item.name} className="relative overflow-hidden rounded-xl p-3 group hover:scale-[1.01] transition-all">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`} />
                <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} opacity-[0.15]`} style={{ width: `${barWidth}%` }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <span className="text-xs font-bold text-white">{item.name[0]}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-700 w-20 text-right">{item.weight.toFixed(1)} kg</span>
                    <span className="text-xs font-medium text-gray-500 w-14 text-right">{item.percentage.toFixed(1)}%</span>
                    <span className="text-sm font-semibold text-emerald-600 w-28 text-right">Rp {formatNumber(item.earnings)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const DATE_COLORS = [
  { bg: 'from-emerald-50 to-green-100', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  { bg: 'from-green-50 to-emerald-100', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-500' },
  { bg: 'from-teal-50 to-green-100', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-500' },
];

function DateGroupedTable({ data, expandedDates, toggleDate }) {
  const { t } = useTranslation();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50">
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-base">{t('classReport.entriesByDate')}</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">{t('classReport.entriesByDateDesc')}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((dateGroup, idx) => {
            const colors = DATE_COLORS[idx % DATE_COLORS.length];
            const isExpanded = expandedDates.has(dateGroup.dateKey);

            return (
              <div key={dateGroup.dateKey} className={`bg-gradient-to-r ${colors.bg} rounded-xl border ${colors.border} overflow-hidden transition-all duration-200`}>
                {/* Date header row */}
                <div
                  className="flex items-center justify-between p-3 md:p-4 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => toggleDate(dateGroup.dateKey)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/60 shadow-sm transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                      {isExpanded ? (
                        <ChevronDown className={`w-4 h-4 ${colors.text}`} />
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${colors.text}`} />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${colors.text}`}>{formatDate(dateGroup.dateKey)}</h4>
                      <p className="text-xs text-gray-500">{dateGroup.entryCount} {t('classReport.entries')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{t('classReport.weight')}</p>
                      <p className={`font-bold text-sm ${colors.text}`}>{formatNumber(dateGroup.totalWeight)} kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{t('classReport.earnings')}</p>
                      <p className={`font-bold text-sm ${colors.text}`}>Rp {formatNumber(dateGroup.totalEarnings)}</p>
                    </div>
                  </div>
                </div>

                {/* Expanded entries table */}
                {isExpanded && (
                  <div className="bg-white/70 border-t border-white/50">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-50/80 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                          <th className="px-4 py-2.5 text-left">{t('classReport.wasteType')}</th>
                          <th className="px-4 py-2.5 text-right">{t('classReport.weight')}</th>
                          <th className="px-4 py-2.5 text-right">{t('classReport.pricePerKg')}</th>
                          <th className="px-4 py-2.5 text-right">{t('classReport.amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dateGroup.entries.map((entry, eIdx) => (
                          <tr
                            key={entry.id || eIdx}
                            className="border-t border-emerald-100/50 hover:bg-emerald-50/50 transition-colors"
                          >
                            <td className="px-4 py-2.5 text-gray-900 font-medium text-sm">{entry.wasteTypeName}</td>
                            <td className="px-4 py-2.5 text-right text-gray-700 text-sm">{formatNumber(entry.weight)} kg</td>
                            <td className="px-4 py-2.5 text-right text-gray-700 text-sm">Rp {formatNumber(entry.price)}</td>
                            <td className={`px-4 py-2.5 text-right font-semibold text-sm ${colors.text}`}>Rp {formatNumber(entry.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClassReportSection() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const [classFilter, setClassFilter] = useState('all');
  const [expandedDates, setExpandedDates] = useState(new Set());

  const {
    loading,
    kpis,
    wasteByClass,
    wasteTrendData,
    weeklyTrendData,
    monthlyTrendData,
    wasteTypeBreakdown,
    dateGroupedData,
    participationTrendData,
    allClasses,
  } = useClassReport({ dateFrom, dateTo, classFilter });

  const toggleDate = useCallback((dateKey) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  }, []);

  const hasFilters = classFilter !== 'all' || dateFrom !== null || dateTo !== null;

  const formatDateInput = (d) => format(d, 'yyyy-MM-dd');

  const pdfData = useMemo(() => {
    return prepareClassWasteDataFromHook({
      kpis, wasteByClass, wasteTypeBreakdown, dateGroupedData, allClasses, classFilter, dateFrom, dateTo,
    }, { dateFrom, dateTo, classFilter });
  }, [kpis, wasteByClass, wasteTypeBreakdown, dateGroupedData, allClasses, classFilter, dateFrom, dateTo]);

  const pdfFilters = useMemo(() => ({
    dateFrom,
    dateTo,
    selectedClass: classFilter,
  }), [dateFrom, dateTo, classFilter]);

  const handleDateFromChange = (e) => {
    const val = e.target.value;
    if (val) setDateFrom(new Date(val));
  };

  const handleDateToChange = (e) => {
    const val = e.target.value;
    if (val) setDateTo(new Date(val));
  };

  const resetFilters = () => {
    setDateFrom(null);
    setDateTo(null);
    setClassFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{t('classReport.title')}</h2>
        </div>
        <ExportPDFButton
          reportType="classWaste"
          data={pdfData}
          filters={pdfFilters}
        />
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap">{t('classReport.class')}</label>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[150px] h-10">
                <SelectValue placeholder={t('classReport.allClasses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('classReport.allClasses')}</SelectItem>
                {allClasses.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">{t('classReport.from')}</label>
            <input
              type="date"
              value={dateFrom ? formatDateInput(dateFrom) : ''}
              onChange={handleDateFromChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <label className="text-sm text-gray-500">{t('classReport.to')}</label>
            <input
              type="date"
              value={dateTo ? formatDateInput(dateTo) : ''}
              onChange={handleDateToChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-green-600 hover:text-green-700 hover:bg-green-50">
              <RotateCcw className="w-4 h-4 mr-1" />
              {t('common.reset')}
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {loading ? (
          <>
            <div className="glass-card p-4"><KpiSkeleton /></div>
            <div className="glass-card p-4"><KpiSkeleton /></div>
            <div className="glass-card p-4"><KpiSkeleton /></div>
            <div className="glass-card p-4"><KpiSkeleton /></div>
          </>
        ) : (
          <>
            <KpiCard icon={Package} label={t('classReport.totalWaste')} value={kpis.totalWaste} gradient="from-emerald-500 to-teal-500" suffix={t('classReport.kg')} />
            <KpiCard icon={Wallet} label={t('classReport.totalEarnings')} value={kpis.totalEarnings} gradient="from-amber-500 to-orange-500" prefix="Rp " />
            <KpiCard icon={FileText} label={t('classReport.totalEntries')} value={kpis.totalEntries} gradient="from-blue-500 to-blue-700" />
            <KpiCard icon={TrendingUp} label={t('classReport.avgPerEntry')} value={kpis.avgPerEntry} gradient="from-violet-500 to-purple-600" suffix={t('classReport.kg')} />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Waste by Class bar chart */}
        <Card className="h-[380px] shadow-sm border-gray-100 bg-gray-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-900">
                {t('classReport.wasteByClass')}
              </CardTitle>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-emerald-500 rounded-md">
                {t('classReport.kg')}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse h-[280px] bg-gray-100 rounded-xl" />
            ) : wasteByClass.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                {t('common.noData')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={wasteByClass}
                  margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
                  layout="vertical"
                >
                  <defs>
                    <linearGradient id="classBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="value" fill="url(#classBarGradient)" radius={[0, 8, 8, 0]} maxBarSize={32}>
                    <LabelList dataKey="value" position="right" offset={8}
                      style={{ fill: '#059669', fontSize: '11px', fontWeight: 600 }}
                      formatter={(val) => formatNumber(val)}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <WasteTrendChart
          dailyData={wasteTrendData}
          weeklyData={weeklyTrendData}
          monthlyData={monthlyTrendData}
          isLoading={loading}
        />
      </div>

      {/* Participation Trend Chart */}
      <Card className="shadow-sm border-gray-100 bg-gray-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">{t('classReport.participationTitle')}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton height={280} />
          ) : participationTrendData.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
              {t('common.noData')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={participationTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value, name) => [value, name === 'classes' ? t('classReport.participatingClasses') : t('classReport.individualStudents')]}
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                  }}
                />
                <Legend
                  formatter={(value) => value === 'classes' ? t('classReport.participatingClasses') : t('classReport.individualStudents')}
                />
                <Line
                  type="monotone"
                  dataKey="classes"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Waste Type Breakdown Table */}
      {hasFilters && wasteTypeBreakdown.length > 0 && (
        <WasteTypeTable data={wasteTypeBreakdown} />
      )}

      {/* Date-Grouped Entries Table (only when class is selected) */}
      {dateGroupedData.length > 0 && (
        <DateGroupedTable
          data={dateGroupedData}
          expandedDates={expandedDates}
          toggleDate={toggleDate}
        />
      )}
    </div>
  );
}
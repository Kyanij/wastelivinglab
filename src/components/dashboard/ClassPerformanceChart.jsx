import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

const defaultData = [
  { name: '6A', value: 85.4 },
  { name: '6B', value: 63.2 },
  { name: '6C', value: 48.6 },
  { name: '7A', value: 28.7 },
  { name: '7B', value: 19.3 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-gray-500 mb-1">Class {label}</p>
        <p className="text-sm font-semibold text-emerald-600">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export default function ClassPerformanceChart({ data, isLoading }) {
  const { t } = useTranslation();
  const chartData = data && data.length > 0 ? data : defaultData;

  if (isLoading) {
    return (
      <Card className="h-[380px] shadow-sm border-gray-100">
        <CardHeader className="pb-2">
          <div className="animate-pulse h-5 w-40 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-[280px] bg-gray-100 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[380px] shadow-sm border-gray-100 bg-gray-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-base font-semibold text-gray-900">{t('dashboard.classPerformance')}</CardTitle>
            <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-emerald-500 rounded-md">
              {t('dashboard.totalWasteKg')}
            </span>
          </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
            {t('dashboard.noDataAvailable')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="emeraldBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                axis={{ fill: '#6b7280', fontSize: 12 }}
                dy={8}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
              <Bar
                dataKey="value"
                fill="url(#emeraldBarGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={8}
                  style={{
                    fill: '#059669',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                  }}
                  formatter={(value) => value.toFixed(2)}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
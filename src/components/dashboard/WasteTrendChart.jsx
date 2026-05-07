import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-green-600">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export default function WasteTrendChart({ dailyData = [], weeklyData = [], monthlyData = [], isLoading }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('daily');

  const getTranslatedWasteType = (name) => {
    const translated = t(`wasteTypesList.${name}`);
    return translated === `wasteTypesList.${name}` ? name : translated;
  };

  const hasWeeklyData = weeklyData && weeklyData.length > 0;
  const hasMonthlyData = monthlyData && monthlyData.length > 0;

  const getDataForPeriod = (p) => {
    if (p === 'daily') return Array.isArray(dailyData) ? dailyData : [];
    if (p === 'weekly') return Array.isArray(weeklyData) ? weeklyData : [];
    if (p === 'monthly') return Array.isArray(monthlyData) ? monthlyData : [];
    return [];
  };

  const data = getDataForPeriod(period);

  if (isLoading) {
    return (
      <Card className="h-[340px]">
        <CardHeader className="pb-2">
          <div className="animate-pulse h-5 w-40 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-[240px] bg-gray-100 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[340px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-50">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <CardTitle className="text-base">{t('dashboard.wasteCollectionTrend')}</CardTitle>
          </div>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="h-8 bg-gray-100">
              <TabsTrigger
                value="daily"
                className="text-xs px-3 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {t('dashboard.daily')}
              </TabsTrigger>
              { (
                <TabsTrigger
                  value="weekly"
                  className="text-xs px-3 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {t('dashboard.weekly')}
                </TabsTrigger>
              )}
              { (
                <TabsTrigger
                  value="monthly"
                  className="text-xs px-3 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {t('dashboard.monthly')}
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">
            {t('dashboard.noDataAvailable')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                dy={10}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="waste"
                stroke="url(#lineGradient)"
                strokeWidth={2.5}
                dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
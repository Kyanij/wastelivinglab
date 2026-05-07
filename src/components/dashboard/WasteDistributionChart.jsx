import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChartIcon } from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
        <p className="text-xs text-gray-500">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export default function WasteDistributionChart({ data, isLoading }) {
  const { t } = useTranslation();
  
  const getTranslatedWasteType = (name) => {
    const translated = t(`wasteTypesList.${name}`);
    return translated === `wasteTypesList.${name}` ? name : translated;
  };

  const translatedData = data.map(item => ({
    ...item,
    name: getTranslatedWasteType(item.name)
  }));

  if (isLoading) {
    return (
      <Card className="h-[340px]">
        <CardHeader className="pb-2">
          <div className="animate-pulse h-5 w-32 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-[240px] bg-gray-100 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="h-[340px]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-green-50">
            <PieChartIcon className="w-4 h-4 text-green-600" />
          </div>
          <CardTitle className="text-base">{t('dashboard.wasteByType')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">
            {t('dashboard.noDataAvailable')}
          </div>
        ) : (
          <div className="flex flex-col h-[240px]">
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={translatedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {translatedData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{total.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">{t('dashboard.kgTotal')}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
              {translatedData.map((entry, index) => {
                const percent = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-gray-600 truncate">{entry.name}</span>
                    <span className="text-xs font-semibold text-gray-800">{percent}%</span>
                    <span className="text-xs text-gray-400">{entry.value.toFixed(1)}kg</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
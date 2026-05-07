import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lightbulb, TrendingUp, Users, Recycle } from 'lucide-react';

function InsightCard({ icon: Icon, title, value, color }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function Insights({ 
  wasteTrend = 0, 
  topClass = '', 
  topClassPercent = 0, 
  topWasteType = '', 
  topWasteTypePercent = 0,
  isLoading 
}) {
  const { t } = useTranslation();

  const getTranslatedWasteType = (name) => {
    const translated = t(`wasteTypesList.${name}`);
    return translated === `wasteTypesList.${name}` ? name : translated;
  };

  if (isLoading) {
    return (
      <Card className="h-[140px]">
        <CardHeader className="pb-2">
          <div className="animate-pulse h-5 w-20 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendStatus = wasteTrend >= 0 ? t('dashboard.increased') : t('dashboard.decreased');
  const trendValue = t('dashboard.wasteIncreased', { status: trendStatus, percent: Math.abs(wasteTrend).toFixed(1) });
  const trendColor = wasteTrend >= 0 ? 'bg-green-500' : 'bg-red-500';

  const classValue = topClass 
    ? t('dashboard.classLeads', { class: topClass, percent: topClassPercent.toFixed(1) })
    : t('dashboard.noDataAvailable');

  const wasteTypeValue = topWasteType 
    ? `${getTranslatedWasteType(topWasteType)} (${topWasteTypePercent.toFixed(0)}%)`
    : t('dashboard.noDataAvailable');

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-yellow-50">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
          </div>
          <CardTitle className="text-base">{t('dashboard.insights')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <InsightCard 
            icon={TrendingUp}
            title={t('dashboard.wasteTrend')}
            value={trendValue}
            color={trendColor}
          />
          <InsightCard 
            icon={Users}
            title={t('dashboard.topClass')}
            value={classValue}
            color="bg-blue-500"
          />
          <InsightCard 
            icon={Recycle}
            title={t('dashboard.topWasteType')}
            value={wasteTypeValue}
            color="bg-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}
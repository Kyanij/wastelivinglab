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

  const trendValue = wasteTrend > 0 ? `+${wasteTrend.toFixed(1)}%` : `${wasteTrend.toFixed(1)}%`;
  const trendColor = wasteTrend >= 0 
    ? 'bg-green-500' 
    : 'bg-red-500';

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-yellow-50">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
          </div>
          <CardTitle className="text-base">Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <InsightCard 
            icon={TrendingUp}
            title="Waste Trend"
            value={`Waste ${wasteTrend >= 0 ? 'increased' : 'decreased'} by ${Math.abs(wasteTrend).toFixed(1)}%`}
            color={trendColor}
          />
          <InsightCard 
            icon={Users}
            title="Top Class"
            value={topClass ? `Class ${topClass} leads with ${topClassPercent.toFixed(1)}%` : 'No data'}
            color="bg-blue-500"
          />
          <InsightCard 
            icon={Recycle}
            title="Top Waste Type"
            value={topWasteType ? `${topWasteType} (${topWasteTypePercent.toFixed(0)}%)` : 'No data'}
            color="bg-green-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}
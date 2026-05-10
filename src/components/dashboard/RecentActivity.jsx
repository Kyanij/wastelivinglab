import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../utils/dateHelpers';
import { formatNumber } from '../../utils/portalHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Recycle } from 'lucide-react';

export default function RecentActivity({ activities, isLoading }) {
  const { t } = useTranslation();

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    return formatDateTime(timestamp);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="animate-pulse h-5 w-36 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100" />
                <div className="flex-1 h-8 bg-gray-100 rounded" />
                <div className="w-16 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50">
            <Recycle className="w-4 h-4 text-blue-600" />
          </div>
          <CardTitle className="text-base">{t('dashboard.recentActivity')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            {t('common.noData')}
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-50 flex-shrink-0">
                  <Recycle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.studentName}</span>
                    <span className="text-gray-500"> {t('portal.collected')} </span>
                    <span className="text-green-600 font-medium">{activity.weight}kg</span>
                    <span className="text-gray-500"> {activity.wasteType}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {getTimeAgo(activity.createdAt)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-700">Rp {formatNumber(activity.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
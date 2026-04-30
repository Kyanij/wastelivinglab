import { useTranslation } from 'react-i18next';
import { formatKg, formatCurrency } from '../../utils/portalHelpers';

export default function PortalSummaryBar({ totalWeight, totalEarnings }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-green-600 text-white rounded-xl">
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-100">{t('portal.totalCollected')}</span>
        <span className="text-xl font-bold">{formatKg(totalWeight)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-100">{t('portal.totalEarningsLabel')}</span>
        <span className="text-xl font-bold">{formatCurrency(totalEarnings)}</span>
      </div>
    </div>
  );
}
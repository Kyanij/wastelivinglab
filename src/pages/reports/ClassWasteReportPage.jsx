import { useTranslation } from 'react-i18next';
import { Recycle } from 'lucide-react';
import ClassReportSection from '../../components/classes/ClassReportSection';

export default function ClassWasteReportPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-emerald-50">
          <Recycle className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('reports.classWaste')}</h1>
          <p className="text-sm text-gray-500">{t('reports.classWasteDesc')}</p>
        </div>
      </div>

      <ClassReportSection />
    </div>
  );
}

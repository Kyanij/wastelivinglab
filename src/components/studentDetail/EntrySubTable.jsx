import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { formatNumber } from '../../utils/portalHelpers';
import { formatCurrency } from '../../utils/formatCurrency';

const wasteTypeKeyMap = {
  'Plastic': 'Plastic',
  'Paper': 'Paper',
  'Glass': 'Glass',
  'Plastic Bottles': 'Plastic Bottles',
  'Paper Waste': 'Paper Waste',
  'Metal': 'Metal',
  'Mixed': 'Mixed',
  'Other': 'Other'
};

export default function EntrySubTable({
  entries,
  onEditItem,
  onDeleteItem,
  dateGroup,
}) {
  const { t } = useTranslation();

  const getTranslatedWasteType = (name) => {
    const key = `wasteTypes.names.${name}`;
    const translated = t(key);
    return translated === key ? name : translated;
  };

  const formatWeight = (weight) => {
    return formatNumber(weight || 0);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50/80 to-sky-50/30 border-l-4 border-l-sky-400 ml-4 md:ml-4 mr-4 rounded-r-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="bg-gradient-to-r from-sky-100 via-sky-50 to-cyan-100 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <th className="px-3 md:px-4 py-2.5 text-left w-[25%]">{t('wasteEntry.wasteType')}</th>
              <th className="px-3 md:px-4 py-2.5 text-right w-[20%]">{t('wasteEntry.weight')}</th>
              <th className="px-3 md:px-4 py-2.5 text-right w-[20%]">{t('wasteEntry.price')}</th>
              <th className="px-3 md:px-4 py-2.5 text-right w-[20%]">{t('wasteEntry.amount')}</th>
              <th className="px-3 md:px-4 py-2.5 text-center w-[15%]"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                className="group border-t border-gray-100/50 bg-white/60 hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-cyan-50/80 transition-all duration-300 hover:shadow-md hover:shadow-sky-100/30"
              >
                <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 font-semibold text-sm group-hover:text-sky-700 transition-colors">
                  {getTranslatedWasteType(entry.wasteTypeName)}
                </td>
                <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-gray-700 font-medium text-sm group-hover:text-sky-700 transition-colors">
                  {formatWeight(entry.weight)} kg
                </td>
                <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-gray-700 font-medium text-sm group-hover:text-sky-600 transition-colors">
                  Rp{formatCurrency(entry.rate)}
                </td>
                <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-sky-600 font-bold text-sm group-hover:text-sky-700 transition-colors">
                  Rp{formatCurrency(entry.amount)}
                </td>
                <td className="px-3 md:px-4 py-2.5 md:py-3">
                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    <button
                      onClick={() => onEditItem(entry, dateGroup)}
                      className="p-1.5 md:p-2 text-sky-600 hover:bg-sky-100 rounded-lg hover:shadow-md hover:shadow-sky-100 transition-all duration-200 hover:scale-110 active:scale-95"
                      title={t('common.edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(entry, dateGroup)}
                      className="p-1.5 md:p-2 text-red-500 hover:bg-red-100 rounded-lg hover:shadow-md hover:shadow-red-100 transition-all duration-200 hover:scale-110 active:scale-95"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
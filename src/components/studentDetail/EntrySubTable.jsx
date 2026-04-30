import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';

export default function EntrySubTable({
  entries,
  onEditItem,
  onDeleteItem,
  dateGroup,
}) {
  const { t } = useTranslation();

  const formatWeight = (weight) => {
    return (weight || 0).toFixed(2);
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-gray-50 border-l-4 border-green-500 ml-4 md:ml-4 mr-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="text-xs font-medium text-gray-500 bg-gray-100">
              <th className="px-3 md:px-4 py-2 text-left w-[25%]">
                {t('wasteEntry.wasteType')}
              </th>
              <th className="px-3 md:px-4 py-2 text-right w-[20%]">
                {t('wasteEntry.weight')}
              </th>
              <th className="px-3 md:px-4 py-2 text-right w-[20%]">
                {t('wasteEntry.rate')}
              </th>
              <th className="px-3 md:px-4 py-2 text-right w-[20%]">
                {t('wasteEntry.amount')}
              </th>
              <th className="px-3 md:px-4 py-2 text-center w-[15%]"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                className={`border-t border-gray-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-gray-100 transition-colors`}
              >
                <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 font-medium text-sm">
                  {entry.wasteTypeName}
                </td>
                <td className="px-3 md:px-4 py-2 md:py-3 text-right text-gray-700 text-sm">
                  {formatWeight(entry.weight)} kg
                </td>
                <td className="px-3 md:px-4 py-2 md:py-3 text-right text-gray-700 text-sm">
                  Rp{formatCurrency(entry.rate)}
                </td>
                <td className="px-3 md:px-4 py-2 md:py-3 text-right text-green-600 font-medium text-sm">
                  Rp{formatCurrency(entry.amount)}
                </td>
                <td className="px-3 md:px-4 py-2 md:py-3">
                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    <button
                      onClick={() => onEditItem(entry, dateGroup)}
                      className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title={t('common.edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(entry, dateGroup)}
                      className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2 } from 'lucide-react';
import { useWasteTypes } from '../../hooks/useWasteTypes';
import { format } from 'date-fns';

export default function EditDateModal({ dateGroup, isOpen, onClose, onSave, loading }) {
  const { t } = useTranslation();
  const { wasteTypes } = useWasteTypes();

  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (dateGroup) {
      const initialRows = dateGroup.entries.map((entry) => ({
        id: entry.id,
        wasteTypeId: entry.wasteTypeId,
        wasteTypeName: entry.wasteTypeName,
        weight: entry.weight?.toString() || '',
        rate: entry.rate?.toString() || '',
        amount: entry.amount || 0,
        isNew: false,
        markedForDeletion: false,
      }));
      setRows(initialRows);
    }
  }, [dateGroup]);

  if (!isOpen) return null;

  const getAmount = (weight, rate) => {
    return (parseFloat(weight || 0) * parseFloat(rate || 0));
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const newRows = [...prev];
      const row = { ...newRows[index] };

      if (field === 'wasteTypeId') {
        const selectedType = wasteTypes.find((wt) => wt.id === value);
        row.wasteTypeId = value;
        row.wasteTypeName = selectedType?.name || '';
        row.rate = selectedType?.defaultRate?.toString() || row.rate;
      } else {
        row[field] = value;
      }

      row.amount = getAmount(row.weight, row.rate);
      newRows[index] = row;
      return newRows;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        wasteTypeId: '',
        wasteTypeName: '',
        weight: '',
        rate: '',
        amount: 0,
        isNew: true,
        markedForDeletion: false,
      },
    ]);
  };

  const removeRow = (index) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      const newRows = [...prev];
      newRows[index].markedForDeletion = true;
      return newRows;
    });
  };

  const validate = () => {
    const newErrors = [];
    let hasValidRow = false;

    rows.forEach((row, index) => {
      if (row.markedForDeletion) {
        newErrors[index] = null;
        return;
      }

      const rowErrors = {};

      if (!row.wasteTypeId) {
        rowErrors.wasteTypeId = t('studentDetail.wasteTypeRequired');
      }

      if (!row.weight || parseFloat(row.weight) <= 0) {
        rowErrors.weight = t('studentDetail.weightPositive');
      } else if (parseFloat(row.weight) > 999) {
        rowErrors.weight = t('studentDetail.weightMax');
      }

      if (row.rate === '' || parseFloat(row.rate) < 0) {
        rowErrors.rate = t('studentDetail.rateNonNegative');
      }

      newErrors[index] = rowErrors;

      if (Object.keys(rowErrors).length === 0) {
        hasValidRow = true;
      }
    });

    setErrors(newErrors);

    if (!hasValidRow) {
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const originalEntries = dateGroup.entries;
      const activeRows = rows.filter((r) => !r.markedForDeletion);

      const updatedRows = activeRows.filter((r) => !r.isNew).map((r) => ({
        id: r.id,
        wasteTypeId: r.wasteTypeId,
        wasteTypeName: r.wasteTypeName,
        weight: parseFloat(r.weight),
        rate: parseFloat(r.rate),
        amount: r.amount,
      }));

      const removedRows = rows
        .filter((r) => r.markedForDeletion && !r.isNew)
        .map((r) => originalEntries.find((e) => e.id === r.id))
        .filter(Boolean);

      const addedRows = activeRows.filter((r) => r.isNew).map((r) => ({
        wasteTypeId: r.wasteTypeId,
        wasteTypeName: r.wasteTypeName,
        weight: parseFloat(r.weight),
        rate: parseFloat(r.rate),
        amount: r.amount,
      }));

      onSave(originalEntries, updatedRows, removedRows, addedRows);
    }
  };

  const formattedDate = dateGroup
    ? format(new Date(dateGroup.dateKey), 'MMMM dd, yyyy')
    : '';

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const visibleRows = rows.filter((r) => !r.markedForDeletion);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('studentDetail.editDateTitle')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('studentDetail.editingDateSubtitle', { date: formattedDate })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-medium text-gray-500 bg-gray-50">
                  <th className="px-2 py-2 text-left">
                    {t('wasteEntry.wasteType')}
                  </th>
                  <th className="px-2 py-2 text-right">{t('wasteEntry.weight')}</th>
                  <th className="px-2 py-2 text-right">{t('wasteEntry.rate')}</th>
                  <th className="px-2 py-2 text-right">
                    {t('wasteEntry.amount')}
                  </th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  if (row.markedForDeletion) return null;

                  const rowErrors = errors[index] || {};

                  return (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="px-2 py-2">
                        <select
                          value={row.wasteTypeId}
                          onChange={(e) =>
                            updateRow(index, 'wasteTypeId', e.target.value)
                          }
                          className={`w-full px-2 py-1 border rounded text-sm ${
                            rowErrors.wasteTypeId
                              ? 'border-red-500'
                              : 'border-gray-200'
                          }`}
                        >
                          <option value="">{t('wasteEntry.wasteType')}</option>
                          {wasteTypes.map((wt) => (
                            <option key={wt.id} value={wt.id}>
                              {wt.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="999"
                          value={row.weight}
                          onChange={(e) =>
                            updateRow(index, 'weight', e.target.value)
                          }
                          className={`w-full px-2 py-1 border rounded text-sm text-right ${
                            rowErrors.weight
                              ? 'border-red-500'
                              : 'border-gray-200'
                          }`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.rate}
                          onChange={(e) =>
                            updateRow(index, 'rate', e.target.value)
                          }
                          className={`w-full px-2 py-1 border rounded text-sm text-right ${
                            rowErrors.rate
                              ? 'border-red-500'
                              : 'border-gray-200'
                          }`}
                        />
                      </td>
                      <td className="px-2 py-2 text-right text-green-600 font-medium">
                        Rp{formatCurrency(row.amount)}
                      </td>
                      <td className="px-2 py-2">
                        {visibleRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
          >
            <Plus className="w-4 h-4" />
            {t('wasteEntry.addAnotherType')}
          </button>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('modals.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('modals.updateEntry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
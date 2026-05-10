import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { getAllWasteTypes } from '../../firebase/wasteTypes';
import toast from 'react-hot-toast';

const WASTE_TYPE_ICONS = {
  'Plastic': '🧴',
  'Paper': '📄',
  'Glass': '🫙',
  'Metal': '🥫',
  'Plastic Bottles': '🧴',
  'Paper Waste': '📄',
  'Mixed': '♻️',
  'Other': '📦',
};

export default function EditClassDateModal({ dateGroup, isOpen, onClose, onSave, loading }) {
  const { t } = useTranslation();
  const [wasteTypes, setWasteTypes] = useState([]);
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      getAllWasteTypes().then(setWasteTypes);
    }
  }, [isOpen]);

  useEffect(() => {
    if (dateGroup && isOpen) {
      setRows(dateGroup.entries.map(e => ({
        id: e.id,
        wasteTypeId: e.wasteTypeId,
        wasteTypeName: e.wasteTypeName,
        weight: e.weight?.toString() || '',
        price: e.price?.toString() || '',
        isNew: false,
      })));
      setErrors([]);
    }
  }, [dateGroup, isOpen]);

  const handleChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    
    if (field === 'wasteTypeId') {
      const selected = wasteTypes.find(wt => wt.id === value);
      newRows[index].wasteTypeName = selected?.name || '';
    }
    
    setRows(newRows);
    if (errors[index]) {
      const newErrors = [...errors];
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const addRow = () => {
    setRows([...rows, {
      id: `new-${Date.now()}`,
      wasteTypeId: '',
      wasteTypeName: '',
      weight: '',
      price: '',
      isNew: true,
    }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    let hasValidRow = false;
    
    rows.forEach((row, index) => {
      const weight = parseFloat(row.weight);
      const isValid = row.wasteTypeId && weight > 0;
      
      if (isValid) hasValidRow = true;
      
      if (!row.wasteTypeId && row.weight) newErrors[index] = t('classDetail.wasteTypeRequired');
      if (!row.weight && row.wasteTypeId) newErrors[index] = t('classDetail.weightRequired');
      if (weight > 999) newErrors[index] = t('classDetail.weightMax');
    });
    
    if (!hasValidRow) {
      toast.error(t('classDetail.atLeastOneRow'));
    }
    
    setErrors(newErrors);
    return hasValidRow && Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const originalEntries = dateGroup.entries;
    const originalIds = new Set(originalEntries.map(e => e.id));
    
    const updatedRows = rows.filter(r => !r.isNew && originalIds.has(r.id)).map(r => ({
      id: r.id,
      wasteTypeId: r.wasteTypeId,
      wasteTypeName: wasteTypes.find(wt => wt.id === r.wasteTypeId)?.name || r.wasteTypeName,
      weight: parseFloat(r.weight),
      price: parseFloat(r.price) || 0,
    }));
    
    const removedRows = originalEntries.filter(e => !rows.some(r => r.id === e.id));
    
    const addedRows = rows.filter(r => r.isNew && r.wasteTypeId && parseFloat(r.weight) > 0).map(r => ({
      wasteTypeId: r.wasteTypeId,
      wasteTypeName: wasteTypes.find(wt => wt.id === r.wasteTypeId)?.name || r.wasteTypeName,
      weight: parseFloat(r.weight),
      price: parseFloat(r.price) || 0,
    }));

    const success = await onSave(originalEntries, updatedRows, removedRows, addedRows);
    if (success) {
      toast.success(t('classDetail.dateEntryUpdated'));
    }
  };

  const getTotals = () => {
    return rows.reduce((acc, row) => {
      const weight = parseFloat(row.weight) || 0;
      const price = parseFloat(row.price) || 0;
      return {
        weight: acc.weight + weight,
        amount: acc.amount + (weight * price),
      };
    }, { weight: 0, amount: 0 });
  };

  const totals = getTotals();

  if (!isOpen || !dateGroup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('classDetail.editDateTitle')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('classDetail.editingDateSubtitle', { date: new Date(dateGroup.dateKey).toLocaleDateString() })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2">{t('classEntry.wasteType')}</th>
                <th className="pb-2 w-24">{t('classEntry.weight')}</th>
                <th className="pb-2 w-24">{t('classEntry.price')}</th>
                <th className="pb-2 w-24">{t('classEntry.amount')}</th>
                <th className="pb-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-t border-gray-100">
                  <td className="py-2 pr-2">
                    <select
                      value={row.wasteTypeId}
                      onChange={(e) => handleChange(index, 'wasteTypeId', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        errors[index] ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    >
                      <option value="">Select</option>
                      {wasteTypes.map(wt => (
                        <option key={wt.id} value={wt.id}>
                          {WASTE_TYPE_ICONS[wt.name] || '📦'} {wt.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="999"
                      value={row.weight}
                      onChange={(e) => handleChange(index, 'weight', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        errors[index] ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.price}
                      onChange={(e) => handleChange(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                      Rp {((parseFloat(row.weight) || 0) * (parseFloat(row.price) || 0)).toFixed(2)}
                    </div>
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addRow}
            className="mt-3 text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {t('wasteEntry.addAnotherType')}
          </button>

          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">{t('classEntry.totalWeight')}: </span>
                <span className="font-medium text-gray-900">{totals.weight.toFixed(2)} kg</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('classEntry.totalEarnings')}: </span>
                <span className="font-bold text-green-600">Rp {totals.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('modals.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {t('modals.updateEntry')}
          </button>
        </div>
      </div>
    </div>
  );
}
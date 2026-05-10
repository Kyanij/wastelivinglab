import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2 } from 'lucide-react';
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

export default function EditClassItemModal({ entry, isOpen, onClose, onSave, loading }) {
  const { t } = useTranslation();
  const [wasteTypes, setWasteTypes] = useState([]);
  const [formData, setFormData] = useState({
    wasteTypeId: '',
    wasteTypeName: '',
    weight: '',
    price: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      getAllWasteTypes().then(setWasteTypes);
    }
  }, [isOpen]);

  useEffect(() => {
    if (entry && isOpen) {
      setFormData({
        wasteTypeId: entry.wasteTypeId || '',
        wasteTypeName: entry.wasteTypeName || '',
        weight: entry.weight?.toString() || '',
        price: entry.price?.toString() || '',
      });
      setErrors({});
    }
  }, [entry, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.wasteTypeId) newErrors.wasteTypeId = t('classDetail.wasteTypeRequired');
    if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = t('classDetail.weightPositive');
    if (parseFloat(formData.weight) > 999) newErrors.weight = t('classDetail.weightMax');
    if (formData.price === '' || parseFloat(formData.price) < 0) newErrors.price = t('classDetail.priceNonNegative');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedType = wasteTypes.find(wt => wt.id === formData.wasteTypeId);
    const updates = {
      wasteTypeId: formData.wasteTypeId,
      wasteTypeName: selectedType?.name || formData.wasteTypeName,
      weight: parseFloat(formData.weight),
      price: parseFloat(formData.price) || 0,
    };

    const success = await onSave(updates);
    if (success) {
      toast.success(t('classDetail.entryUpdated'));
    }
  };

  const amount = (parseFloat(formData.weight) || 0) * (parseFloat(formData.price) || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('classDetail.editItemTitle')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('classDetail.editingItemSubtitle', { type: entry?.wasteTypeName, date: entry?.date?.toDate?.()?.toLocaleDateString() })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('classEntry.wasteType')} *</label>
            <select
              value={formData.wasteTypeId}
              onChange={(e) => {
                const selected = wasteTypes.find(wt => wt.id === e.target.value);
                handleChange('wasteTypeId', e.target.value);
                handleChange('wasteTypeName', selected?.name || '');
              }}
              className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                errors.wasteTypeId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
              }`}
            >
              <option value="">Select waste type</option>
              {wasteTypes.map(wt => (
                <option key={wt.id} value={wt.id}>
                  {WASTE_TYPE_ICONS[wt.name] || '📦'} {wt.name}
                </option>
              ))}
            </select>
            {errors.wasteTypeId && <p className="mt-1 text-sm text-red-500">{errors.wasteTypeId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('classEntry.weight')} *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="999"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.weight ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.weight && <p className="mt-1 text-sm text-red-500">{errors.weight}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('classEntry.price')} *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('classEntry.amount')}</span>
              <span className="text-xl font-bold text-green-600">Rp {amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('modals.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {t('modals.updateItem')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
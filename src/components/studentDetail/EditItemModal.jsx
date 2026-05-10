import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useWasteTypes } from '../../hooks/useWasteTypes';
import { formatDateLong } from '../../utils/dateHelpers';
import { formatNumber } from '../../utils/portalHelpers';

export default function EditItemModal({ entry, isOpen, onClose, onSave, loading }) {
  const { t } = useTranslation();
  const { wasteTypes } = useWasteTypes();

  const getTranslatedWasteType = (name) => {
    const translated = t(`wasteTypesList.${name}`);
    return translated === `wasteTypesList.${name}` ? name : translated;
  };

  const [formData, setFormData] = useState({
    wasteTypeId: '',
    wasteTypeName: '',
    weight: '',
    rate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (entry) {
      const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date();
      setFormData({
        wasteTypeId: entry.wasteTypeId || '',
        wasteTypeName: entry.wasteTypeName || '',
        weight: entry.weight?.toString() || '',
        rate: entry.rate?.toString() || '',
      });
    }
  }, [entry]);

  if (!isOpen) return null;

  const amount = formatNumber((parseFloat(formData.weight || 0) * parseFloat(formData.rate || 0)));

  const handleWasteTypeChange = (e) => {
    const selectedType = wasteTypes.find((wt) => wt.id === e.target.value);
    setFormData((prev) => ({
      ...prev,
      wasteTypeId: e.target.value,
      wasteTypeName: selectedType?.name || '',
      rate: selectedType?.defaultRate?.toString() || prev.rate,
    }));
  };

  const handleWeightChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      weight: e.target.value,
    }));
  };

  const handleRateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      rate: e.target.value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.wasteTypeId) {
      newErrors.wasteTypeId = t('studentDetail.wasteTypeRequired');
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = t('studentDetail.weightPositive');
    } else if (parseFloat(formData.weight) > 999) {
      newErrors.weight = t('studentDetail.weightMax');
    }

    if (formData.rate === '' || parseFloat(formData.rate) < 0) {
      newErrors.rate = t('studentDetail.priceNonNegative');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const formattedDate = formatDateLong(entry?.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('studentDetail.editItemTitle')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('studentDetail.editingItemSubtitle', {
                type: getTranslatedWasteType(entry?.wasteTypeName),
                date: formattedDate,
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('wasteEntry.wasteType')}
            </label>
            <select
              value={formData.wasteTypeId}
              onChange={handleWasteTypeChange}
              className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.wasteTypeId ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">{t('wasteEntry.wasteType')}</option>
              {wasteTypes.map((wt) => (
                <option key={wt.id} value={wt.id}>
                  {getTranslatedWasteType(wt.name)}
                </option>
              ))}
            </select>
            {errors.wasteTypeId && (
              <p className="text-red-500 text-xs mt-1">{errors.wasteTypeId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('wasteEntry.weight')} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="999"
                value={formData.weight}
                onChange={handleWeightChange}
                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.weight ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('wasteEntry.amount')}
              </label>
              <input
                type="text"
                value={`Rp${amount}`}
                disabled
                className="w-full px-3 py-2.5 border rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('wasteEntry.price')} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.rate}
              onChange={handleRateChange}
              className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.rate ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.rate && (
              <p className="text-red-500 text-xs mt-1">{errors.rate}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('modals.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('modals.updateItem')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
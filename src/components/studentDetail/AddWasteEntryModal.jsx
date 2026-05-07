import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2 } from 'lucide-react';
import { useWasteTypes } from '../../hooks/useWasteTypes';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/collections';
import { toLocalDateString } from '../../utils/portalHelpers';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function AddWasteEntryModal({
  isOpen,
  onClose,
  student,
  refetch,
  onSuccess,
}) {
  const { t } = useTranslation();
  const { wasteTypes } = useWasteTypes();

  const getTranslatedWasteType = (name) => {
    const translated = t(`wasteTypesList.${name}`);
    return translated === `wasteTypesList.${name}` ? name : translated;
  };

  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    toLocalDateString(new Date())
  );

  const [items, setItems] = useState([
    {
      id: `item-${Date.now()}`,
      wasteTypeId: '',
      wasteTypeName: '',
      weight: '',
      rate: '',
      amount: 0,
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(toLocalDateString(new Date()));
      setItems([
        {
          id: `item-${Date.now()}`,
          wasteTypeId: '',
          wasteTypeName: '',
          weight: '',
          rate: '',
          amount: 0,
        },
      ]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getAmount = (weight, rate) => {
    return (parseFloat(weight || 0) * parseFloat(rate || 0));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      const item = { ...newItems[index] };

      if (field === 'wasteTypeId') {
        const selectedType = wasteTypes.find((wt) => wt.id === value);
        item.wasteTypeId = value;
        item.wasteTypeName = selectedType?.name || '';
        item.rate = selectedType?.defaultRate?.toString() || '';
      } else {
        item[field] = value;
      }

      item.amount = getAmount(item.weight, item.rate);
      newItems[index] = item;
      return newItems;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        wasteTypeId: '',
        wasteTypeName: '',
        weight: '',
        rate: '',
        amount: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.wasteTypeId) return false;
      if (!item.weight || parseFloat(item.weight) <= 0) return false;
      if (item.rate === '' || parseFloat(item.rate) < 0) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error(t('common.error'));
      return;
    }

    setLoading(true);
    try {
      const batch = [];
      let totalWeight = 0;
      let totalAmount = 0;

      const entryDate = new Date(selectedDate);
      entryDate.setHours(12, 0, 0, 0);

      for (const item of items) {
        if (!item.wasteTypeId || !item.weight) continue;

        const entryData = {
          studentId: student.id,
          studentName: student.name,
          studentClass: student.class,
          date: entryDate,
          wasteTypeId: item.wasteTypeId,
          wasteTypeName: item.wasteTypeName,
          weight: parseFloat(item.weight),
          rate: parseFloat(item.rate),
          amount: item.amount,
          createdAt: serverTimestamp(),
        };

        batch.push(addDoc(collection(db, COLLECTIONS.WASTE_ENTRIES), entryData));
        totalWeight += parseFloat(item.weight);
        totalAmount += item.amount;
      }

      await Promise.all(batch);

      if (refetch) refetch();

      const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);
      await updateDoc(studentRef, {
        totalWaste: increment(totalWeight),
        totalEarnings: increment(totalAmount),
        lastEntryDate: entryDate,
      });

      toast.success(t('wasteEntry.successTitle'));
      const entryDateStr = selectedDate;
      if (refetch) await refetch();
      onClose();
      if (onSuccess) onSuccess(entryDateStr);
    } catch (error) {
      toast.error(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const activeItems = items.filter((item) => item.wasteTypeId && item.weight);
  const totalWeight = activeItems.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
  const totalAmount = activeItems.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('wasteEntry.addTitle')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{student.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              {t('wasteEntry.selectDate')}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 md:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-gray-500 text-xs mt-1">{t('wasteEntry.pastDateNote')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
              {t('wasteEntry.wasteType')}
            </label>
            <div className="space-y-2 md:space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-[120px]">
                    <select
                      value={item.wasteTypeId}
                      onChange={(e) => updateItem(index, 'wasteTypeId', e.target.value)}
                      className="w-full px-3 py-2.5 md:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">{t('wasteEntry.wasteType')}</option>
                      {wasteTypes.map((wt) => (
                        <option key={wt.id} value={wt.id}>
                          {getTranslatedWasteType(wt.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20 md:w-24">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder={t('wasteEntry.weight')}
                      value={item.weight}
                      onChange={(e) => updateItem(index, 'weight', e.target.value)}
                      className="w-full px-2 md:px-3 py-2.5 md:py-2 border border-gray-200 rounded-lg text-right text-sm md:text-base"
                    />
                  </div>
                  <div className="w-20 md:w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t('wasteEntry.price')}
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                      className="w-full px-2 md:px-3 py-2.5 md:py-2 border border-gray-200 rounded-lg text-right text-sm md:text-base"
                    />
                  </div>
                  <div className="w-24 md:w-28 text-right">
                    <span className="text-green-600 font-medium text-sm md:text-base">
                      Rp{formatCurrency(item.amount)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="flex items-center gap-2 mt-3 text-sm text-green-600 hover:text-green-700"
            >
              <Plus className="w-4 h-4" />
              {t('wasteEntry.addAnotherType')}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('wasteEntry.totalWeight')}</span>
              <span className="font-medium">{totalWeight.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {t('wasteEntry.totalEarnings')}
              </span>
              <span className="font-medium text-green-600">
                Rp{formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-3 md:py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || totalWeight <= 0}
              className="w-full sm:flex-1 px-4 py-3 md:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('wasteEntry.saveEntry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
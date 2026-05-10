import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, AlertCircle, ChevronRight, ChevronLeft, Plus, Trash2, Calendar, Check } from 'lucide-react';
import { addClassWasteEntry, validateClassName, getAllClasses } from '../../firebase/classes';
import { getAllWasteTypes } from '../../firebase/wasteTypes';
import { formatNumber } from '../../utils/portalHelpers';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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

export default function AddClassWasteEntryModal({ isOpen, onClose, onSuccess, preSelectedClass = null }) {
  const { t } = useTranslation();
  const getInitialStep = () => preSelectedClass ? 2 : 1;
  const [step, setStep] = useState(getInitialStep);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [className, setClassName] = useState(preSelectedClass || '');
  const [classInputValue, setClassInputValue] = useState(preSelectedClass || '');
  const [existingClasses, setExistingClasses] = useState([]);
  const [classError, setClassError] = useState('');
  
  const [date, setDate] = useState(new Date());
  
  const [wasteTypes, setWasteTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [itemsError, setItemsError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([getAllClasses(), getAllWasteTypes()])
        .then(([classesData, typesData]) => {
          setExistingClasses(classesData);
          setWasteTypes(typesData);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(preSelectedClass ? 2 : 1);
    setClassName(preSelectedClass || '');
    setClassInputValue(preSelectedClass || '');
    setClassError('');
    setDate(new Date());
    setSelectedTypes([]);
    setItems([]);
    setItemsError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleClassSelect = (selectedClass) => {
    setClassName(selectedClass.name);
    setClassInputValue(selectedClass.name);
    setClassError('');
  };

  const handleClassInputChange = (value) => {
    setClassInputValue(value);
    setClassName(value);
    if (classError) setClassError('');
  };

  const handleClassBlur = () => {
    if (className) {
      const validation = validateClassName(className);
      if (!validation.valid) {
        setClassError(t(validation.error));
      }
    }
  };

  const handleTypeToggle = (type) => {
    const isSelected = selectedTypes.some(t => t.id === type.id);
    if (isSelected) {
      setSelectedTypes(selectedTypes.filter(t => t.id !== type.id));
      setItems(items.filter(i => i.wasteTypeId !== type.id));
    } else {
      setSelectedTypes([...selectedTypes, type]);
      setItems([...items, {
        wasteTypeId: type.id,
        wasteTypeName: type.name,
        weight: '',
        price: type.defaultRate || 0,
        amount: 0,
      }]);
    }
    setItemsError('');
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'weight' || field === 'price') {
      const weight = parseFloat(newItems[index].weight) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].amount = weight * price;
    }
    
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const item = items[index];
    setItems(items.filter((_, i) => i !== index));
    setSelectedTypes(selectedTypes.filter(t => t.id !== item.wasteTypeId));
  };

  const validateStep1 = () => {
    if (!className.trim()) {
      setClassError(t('class.errors.required'));
      return false;
    }
    const validation = validateClassName(className);
    if (!validation.valid) {
      setClassError(t(validation.error));
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const validItems = items.filter(item => {
      const weight = parseFloat(item.weight);
      return item.wasteTypeId && weight > 0;
    });
    
    if (validItems.length === 0) {
      setItemsError(t('classDetail.atLeastOneRow'));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (validateStep3()) setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const validItems = items
        .filter(item => {
          const weight = parseFloat(item.weight);
          return item.wasteTypeId && weight > 0;
        })
        .map(item => ({
          wasteTypeId: item.wasteTypeId,
          wasteTypeName: item.wasteTypeName,
          weight: parseFloat(item.weight),
          price: parseFloat(item.price) || 0,
        }));

      const dateTimestamp = new Date(date);
      dateTimestamp.setHours(12, 0, 0, 0);

      await addClassWasteEntry({
        className,
        date: dateTimestamp,
        items: validItems,
      });

      toast.success(t('classEntry.successTitle'));
      handleClose();
      onSuccess();
    } catch (err) {
      console.error('Error adding class waste entry:', err);
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      const weight = parseFloat(item.weight) || 0;
      const amount = parseFloat(item.amount) || 0;
      return {
        weight: acc.weight + weight,
        amount: acc.amount + amount,
      };
    }, { weight: 0, amount: 0 });
  }, [items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('classEntry.addTitle')}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 h-0.5 mx-1 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            {preSelectedClass ? (
              <>
                <span className={step >= 2 ? 'text-green-600 font-medium' : ''}>{t('classEntry.selectDate')}</span>
                <span className={step >= 3 ? 'text-green-600 font-medium' : ''}>{t('classEntry.addItems')}</span>
                <span className={step >= 4 ? 'text-green-600 font-medium' : ''}>{t('classEntry.reviewConfirm')}</span>
              </>
            ) : (
              <>
                <span>{t('classEntry.selectClass')}</span>
                <span>{t('classEntry.selectDate')}</span>
                <span>{t('classEntry.addItems')}</span>
                <span>{t('classEntry.reviewConfirm')}</span>
              </>
            )}
          </div>
        </div>

        {preSelectedClass && (
          <div className="px-6 pb-2">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Class</span>
                <span className="ml-2 font-semibold text-gray-900">{preSelectedClass}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('classEntry.selectClass')}
                </label>
                <input
                  type="text"
                  value={classInputValue}
                  onChange={(e) => handleClassInputChange(e.target.value)}
                  onBlur={handleClassBlur}
                  placeholder={t('classEntry.searchClass')}
                  className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    classError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                />
                {classError && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {classError}
                  </p>
                )}
              </div>

              {existingClasses.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">{t('classEntry.existingClasses')}</p>
                  <div className="flex flex-wrap gap-2">
                    {existingClasses.map((cls) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => handleClassSelect(cls)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                          ${className === cls.name 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {classInputValue && !existingClasses.some(c => c.name === className) && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  {t('classEntry.newClassWillBeCreated')}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('classEntry.selectDate')}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={format(date, 'yyyy-MM-dd')}
                    onChange={(e) => setDate(new Date(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <p className="mt-2 text-sm text-gray-500">{t('classEntry.pastDateNote')}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('classEntry.selectWasteTypes')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {wasteTypes.map((type) => {
                    const isSelected = selectedTypes.some(t => t.id === type.id);
                    const icon = WASTE_TYPE_ICONS[type.name] || '📦';
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleTypeToggle(type)}
                        className={`p-3 rounded-xl border-2 transition-all text-center
                          ${isSelected 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="text-sm font-medium text-gray-900">{type.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {items.length > 0 && (
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const icon = WASTE_TYPE_ICONS[item.wasteTypeName] || '📦';
                    return (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{icon}</span>
                            <span className="font-medium text-gray-900">{item.wasteTypeName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('classEntry.weight')}</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.weight}
                              onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('classEntry.price')}</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('classEntry.amount')}</label>
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">
                              Rp {formatNumber(item.amount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600">{t('classEntry.totalWeight')}: </span>
                        <span className="font-bold text-gray-900">{formatNumber(totals.weight)} kg</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">{t('classEntry.totalEarnings')}: </span>
                        <span className="font-bold text-green-600">Rp {formatNumber(totals.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {itemsError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {itemsError}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium text-gray-900">{className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">{format(date, 'dd MMMM yyyy')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Waste Items:</h4>
                {items.filter(item => parseFloat(item.weight) > 0).map((item, index) => {
                  const icon = WASTE_TYPE_ICONS[item.wasteTypeName] || '📦';
                  return (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span className="font-medium text-gray-900">{item.wasteTypeName}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{item.weight} kg × Rp {item.price}</div>
                        <div className="font-medium text-green-600">Rp {formatNumber(item.amount)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-medium text-gray-900">{t('common.total')}</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">Rp {formatNumber(totals.amount)}</div>
                    <div className="text-sm text-gray-500">{formatNumber(totals.weight)} kg</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between">
          {step > (preSelectedClass ? 2 : 1) ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('classEntry.back')}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              {t('classEntry.next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {t('classEntry.saveEntry')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
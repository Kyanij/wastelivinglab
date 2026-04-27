import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Recycle, Loader2, AlertCircle } from 'lucide-react';
import { useWasteTypes } from '../hooks/useWasteTypes';
import { addWasteType, deleteWasteType } from '../firebase/wasteTypes';
import toast from 'react-hot-toast';

export default function WasteTypesPage() {
  const { t } = useTranslation();
  const { wasteTypes, loading } = useWasteTypes();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [defaultRate, setDefaultRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({ name: '', defaultRate: '' });

  const validateForm = () => {
    const newErrors = { name: '', defaultRate: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = t('wasteTypes.errors.nameRequired');
      isValid = false;
    }

    const rate = parseFloat(defaultRate);
    if (!defaultRate || isNaN(rate) || rate <= 0) {
      newErrors.defaultRate = t('wasteTypes.errors.rateRequired');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await addWasteType({
        name: name.trim(),
        defaultRate: parseFloat(defaultRate),
      });
      toast.success(t('wasteTypes.successAdded'));
      setName('');
      setDefaultRate('');
      setShowAddForm(false);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteWasteType(deleteId);
      toast.success(t('wasteTypes.successDeleted'));
      setDeleteId(null);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('wasteTypes.title')}</h1>
          <p className="text-gray-400 mt-1">Manage waste categories and default rates</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('wasteTypes.addWasteType')}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">{t('wasteTypes.addWasteType')}</h3>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder={t('wasteTypes.name')}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : 'border-white/10 focus:ring-primary/50'
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>
            <div className="w-48">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={defaultRate}
                  onChange={(e) => {
                    setDefaultRate(e.target.value);
                    if (errors.defaultRate) setErrors({ ...errors, defaultRate: '' });
                  }}
                  placeholder={t('wasteTypes.defaultRate')}
                  className={`w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.defaultRate
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : 'border-white/10 focus:ring-primary/50'
                  }`}
                />
              </div>
              {errors.defaultRate && (
                <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.defaultRate}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {t('common.save')}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : wasteTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Recycle className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">{t('wasteTypes.name')}</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">{t('wasteTypes.defaultRate')}</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-4">{t('students.tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {wasteTypes.map((type) => (
                <tr key={type.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Recycle className="w-5 h-5 text-primary-light" />
                      </div>
                      <span className="font-medium text-white">{type.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-semibold">Rp{type.defaultRate?.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteId(type.id)}
                      className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[#1a2e1f] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">{t('modals.deleteConfirm')}</h3>
            <p className="text-gray-400 mb-6">{t('wasteTypes.deleteWarning')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                {t('modals.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('modals.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
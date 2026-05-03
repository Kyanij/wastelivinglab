import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Recycle, Loader2, AlertCircle, 
  Trash2, Package, Droplet, Leaf, FileText, 
  Cpu, Sparkles, X, Scale, Pencil
} from 'lucide-react';
import { useWasteTypes } from '../hooks/useWasteTypes';
import { addWasteType, deleteWasteType, updateWasteType } from '../firebase/wasteTypes';
import toast from 'react-hot-toast';

const wasteTypeIcons = {
  'Plastic': Package,
  'Paper': FileText,
  'Glass': Droplet,
  'Metal': Scale,
  'Organic': Leaf,
  'EWaste': Cpu,
};

const getIconForType = (name) => {
  const key = Object.keys(wasteTypeIcons).find(k => 
    name?.toLowerCase().includes(k.toLowerCase())
  );
  return wasteTypeIcons[key] || Recycle;
};

const wasteTypeColors = {
  'Plastic': 'bg-blue-50 text-blue-600',
  'Paper': 'bg-amber-50 text-amber-600',
  'Glass': 'bg-cyan-50 text-cyan-600',
  'Metal': 'bg-slate-50 text-slate-600',
  'Organic': 'bg-green-50 text-green-600',
  'EWaste': 'bg-purple-50 text-purple-600',
};

const getColorForType = (name) => {
  const key = Object.keys(wasteTypeColors).find(k => 
    name?.toLowerCase().includes(k.toLowerCase())
  );
  return wasteTypeColors[key] || wasteTypeColors['Plastic'];
};

export default function WasteTypesPage() {
  const { t } = useTranslation();
  const { wasteTypes, loading } = useWasteTypes();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [defaultRate, setDefaultRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState('');
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({ name: '', defaultRate: '' });
  const mountKey = useRef(0);

  useEffect(() => {
    setShowAddPanel(false);
    mountKey.current += 1;
  }, []);

  const openEditModal = (type) => {
    setEditingType(type);
    setEditName(type.name);
    setEditRate(type.defaultRate?.toString() || '');
    setShowEditModal(true);
    setErrors({ name: '', defaultRate: '' });
  };

  const validateForm = (nameVal, rateVal) => {
    const newErrors = { name: '', defaultRate: '' };
    let isValid = true;

    if (!nameVal.trim()) {
      newErrors.name = t('wasteTypes.errors.nameRequired');
      isValid = false;
    }

    const rate = parseFloat(rateVal);
    if (!rateVal || isNaN(rate) || rate <= 0) {
      newErrors.defaultRate = t('wasteTypes.errors.rateRequired');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(name, defaultRate)) return;

    setSaving(true);
    try {
      await addWasteType({
        name: name.trim(),
        defaultRate: parseFloat(defaultRate),
      });
      toast.success(t('wasteTypes.successAdded'));
      setName('');
      setDefaultRate('');
      setShowAddPanel(false);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(editName, editRate)) return;
    if (!editingType) return;

    setUpdating(true);
    try {
      await updateWasteType(editingType.id, {
        name: editName.trim(),
        defaultRate: parseFloat(editRate),
      });
      toast.success(t('wasteTypes.successUpdated'));
      setShowEditModal(false);
      setEditingType(null);
      setEditName('');
      setEditRate('');
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteWasteType(deleteId);
      toast.success(t('wasteTypes.successDeleted'));
      setDeleteId(null);
      setDeleteData(null);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('wasteTypes.title')}</h1>
          <p className="text-gray-500 mt-1 hidden sm:block">{t('wasteTypes.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddPanel(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('wasteTypes.addWasteType')}
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100" />
                <div className="flex-1">
                  <div className="h-5 w-20 bg-gray-100 rounded mb-2" />
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : wasteTypes.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-gray-200 bg-white">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
              <Recycle className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('wasteTypes.emptyTitle')}</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">{t('wasteTypes.emptySubtitle')}</p>
          <button
            onClick={() => setShowAddPanel(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('wasteTypes.addFirstType')}
          </button>
        </div>
      ) : (
        /* Cards Grid - Minimal */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wasteTypes.map((type) => {
            const Icon = getIconForType(type.name);
            const colorClass = getColorForType(type.name);
            
            return (
              <div
                key={type.id}
                className="group relative rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all duration-300"
              >
                {/* Icon & Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${colorClass.split(' ')[0]} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colorClass.split(' ')[1]}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-500">Rp{type.defaultRate?.toFixed(2)}/kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(type)}
                      className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(type.id);
                        setDeleteData({ name: type.name });
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddPanel && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowAddPanel(false)} />
          
          {/* Modal - Centered popup */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">{t('wasteTypes.addNewType')}</h2>
                <button
                  onClick={() => setShowAddPanel(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('wasteTypes.name')} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder={t('wasteTypes.namePlaceholder')}
                      className={`w-full px-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-300 focus:ring-red-500 bg-red-50'
                          : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Rate Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('wasteTypes.defaultRate')} *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={defaultRate}
                        onChange={(e) => {
                          setDefaultRate(e.target.value);
                          if (errors.defaultRate) setErrors({ ...errors, defaultRate: '' });
                        }}
                        placeholder="0.00"
                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.defaultRate
                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                            : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                        }`}
                      />
                    </div>
                    {errors.defaultRate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.defaultRate}
                      </p>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPanel(false)}
                      className="flex-1 px-5 py-3 text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      {t('modals.cancel')}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex-1 px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      {t('common.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white border border-gray-200 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{t('wasteTypes.editType')}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-4 md:p-6 space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('wasteTypes.name')} *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full px-4 py-3.5 rounded-xl border text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Rate Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('wasteTypes.defaultRate')} *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editRate}
                    onChange={(e) => {
                      setEditRate(e.target.value);
                      if (errors.defaultRate) setErrors({ ...errors, defaultRate: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.defaultRate
                        ? 'border-red-300 focus:ring-red-500 bg-red-50'
                        : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                    }`}
                  />
                </div>
                {errors.defaultRate && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.defaultRate}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:flex-1 px-5 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                >
                  {t('modals.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full sm:flex-1 px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Pencil className="w-5 h-5" />
                  )}
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white border border-gray-200 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl shadow-xl overflow-y-auto">
            <div className="flex items-center gap-4 mb-4 p-4 md:p-6">
              <div className="p-3 rounded-xl bg-red-50">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('modals.deleteConfirm')}</h3>
                <p className="text-sm text-gray-500">{deleteData?.name}</p>
              </div>
            </div>
            
            <p className="text-gray-500 px-4 md:px-6 pb-4 md:pb-6">{t('wasteTypes.deleteConfirmMessage')}</p>
            
            <div className="flex gap-3 justify-end p-4 md:p-6 pt-0">
              <button
                onClick={() => setDeleteId(null)}
                className="w-full sm:flex-1 px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {t('modals.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full sm:flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { addStudent, checkDuplicateRollNo } from '../../firebase/students';
import toast from 'react-hot-toast';

export default function AddStudentModal({ onClose, onSuccess }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [classValue, setClassValue] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [gender, setGender] = useState('Male');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({ name: '', class: '', rollNo: '' });

  const validateForm = async () => {
    const newErrors = { name: '', class: '', rollNo: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = t('modals.errors.fullNameRequired');
      isValid = false;
    }
    if (!classValue.trim()) {
      newErrors.class = t('modals.errors.classRequired');
      isValid = false;
    }
    if (!rollNo.trim()) {
      newErrors.rollNo = t('modals.errors.rollNoRequired');
      isValid = false;
    }

    if (isValid && classValue.trim() && rollNo.trim()) {
      const isDuplicate = await checkDuplicateRollNo(classValue.trim(), rollNo.trim());
      if (isDuplicate) {
        newErrors.rollNo = t('modals.errors.rollNoDuplicate');
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) return;

    setSaving(true);
    try {
      await addStudent({
        name: name.trim(),
        class: classValue.trim(),
        rollNo: rollNo.trim(),
        gender,
      });
      toast.success(t('students.successAdded'));
      onSuccess();
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('students.addStudent')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('modals.fullName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('modals.class')}</label>
              <input
                type="text"
                value={classValue}
                onChange={(e) => {
                  setClassValue(e.target.value);
                  if (errors.class) setErrors({ ...errors, class: '' });
                }}
                className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.class
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.class && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.class}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('modals.rollNo')}</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => {
                  setRollNo(e.target.value);
                  if (errors.rollNo) setErrors({ ...errors, rollNo: '' });
                }}
                className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.rollNo
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.rollNo && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.rollNo}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('modals.gender')}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Male">{t('modals.genderOptions.male')}</option>
              <option value="Female">{t('modals.genderOptions.female')}</option>
              <option value="Other">{t('modals.genderOptions.other')}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('modals.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
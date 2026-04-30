import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { updateStudent } from '../../firebase/students';
import toast from 'react-hot-toast';

export default function EditStudentModal({ student, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [name, setName] = useState(student.name || '');
  const [classValue, setClassValue] = useState(student.class || '');
  const [studentId, setStudentId] = useState(student.studentId || '');
  const [gender, setGender] = useState(student.gender || 'Male');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({ name: '', class: '', studentId: '' });

  const validateForm = () => {
    const newErrors = { name: '', class: '', studentId: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = t('modals.errors.fullNameRequired');
      isValid = false;
    }
    if (!classValue.trim()) {
      newErrors.class = t('modals.errors.classRequired');
      isValid = false;
    }
    if (!studentId.trim()) {
      newErrors.studentId = t('modals.errors.studentIdRequired');
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
      await updateStudent(student.id, {
        name: name.trim(),
        class: classValue.trim(),
        studentId: studentId.trim(),
        gender,
      });
      toast.success(t('students.successUpdated'));
      onSuccess();
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{t('modals.editStudent')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('modals.studentId')}</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (errors.studentId) setErrors({ ...errors, studentId: '' });
                }}
                className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.studentId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.studentId && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.studentId}
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('modals.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {t('modals.updateStudent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
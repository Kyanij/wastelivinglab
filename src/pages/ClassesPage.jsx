import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, GraduationCap, Package, Wallet, Pencil, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useClasses, useClassesStats } from '../hooks/useClasses';
import { formatNumber } from '../utils/portalHelpers';
import AddClassWasteEntryModal from '../components/classes/AddClassWasteEntryModal';

const CLASS_COLORS = [
  'from-blue-100 to-blue-200',
  'from-emerald-100 to-emerald-200',
  'from-amber-100 to-amber-200',
  'from-violet-100 to-violet-200',
  'from-rose-100 to-rose-200',
  'from-cyan-100 to-cyan-200',
  'from-orange-100 to-orange-200',
  'from-teal-100 to-teal-200',
];

function getClassGradient(className) {
  if (!className) return CLASS_COLORS[0];
  let hash = 0;
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CLASS_COLORS[Math.abs(hash) % CLASS_COLORS.length];
}

function ClassRow({ classData, index, onEdit }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const gradient = getClassGradient(classData.name);
  const lastEntry = classData.lastEntryDate?.toDate ? classData.lastEntryDate.toDate() : classData.lastEntryDate;
  
  const formattedDate = lastEntry 
    ? new Date(lastEntry).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  return (
    <tr 
      onClick={() => navigate(`/classes/${classData.id}`)}
      className="cursor-pointer group border-b border-gray-100/30 last:border-0 transition-all duration-300 hover:bg-gradient-to-r hover:from-green-100/90 hover:to-emerald-100/90 hover:shadow-lg hover:shadow-green-200/50 hover:-translate-y-0.5"
    >
      <td className="px-6 py-4 w-16 text-gray-400 font-medium group-hover:text-gray-600 transition-colors">{index}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
            <span className="text-sm font-bold text-gray-700">{classData.name?.charAt(0) || 'C'}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-green-800 transition-colors">{classData.name}</p>
            <p className="text-sm text-gray-500">Class</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-900 font-semibold group-hover:text-green-800 transition-colors">{formatNumber(classData.totalWaste || 0)} kg</td>
      <td className="px-6 py-4">
        <span className="text-green-600 font-bold group-hover:text-green-800 transition-colors">Rp {formatNumber(classData.totalEarnings || 0)}</span>
      </td>
      <td className="px-6 py-4 text-gray-500 group-hover:text-gray-700 transition-colors">{formattedDate}</td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="pointer-events-auto relative z-10 w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-sm font-medium text-green-600 bg-green-50/50 border border-green-200/50 rounded-lg hover:bg-green-100 hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Pencil className="w-4 h-4" />
            <span className="sm:hidden">Edit</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/classes/${classData.id}`); }}
            className="pointer-events-auto relative z-10 w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50/50 border border-emerald-200/50 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <ChevronRightIcon className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
        </div>
      </td>
    </tr>
  );
}

export default function ClassesPage() {
  const { t } = useTranslation();
  const { classes, loading, error, refetch } = useClasses();
  const { stats, loading: statsLoading } = useClassesStats();
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      const gradeA = parseInt(a.name.split('.')[0]) || 0;
      const gradeB = parseInt(b.name.split('.')[0]) || 0;
      if (gradeA !== gradeB) return gradeA - gradeB;
      const numA = parseInt(a.name.split('.')[1]) || 0;
      const numB = parseInt(b.name.split('.')[1]) || 0;
      return numA - numB;
    });
  }, [classes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{t('common.error')}: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('classes.title')}</h1>
          <p className="text-gray-500 mt-1">{t('classes.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddEntryModal(true)}
            className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-600/25"
          >
            <Plus className="w-4 h-4" />
            {t('classes.addClassWasteEntry')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm hover:bg-blue-200 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('classes.totalClasses')}</p>
              <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : stats.totalClasses}</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-100 rounded-2xl p-5 border border-amber-200 shadow-sm hover:bg-amber-200 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('classes.totalWasteAll')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : formatNumber(stats.totalWaste)} <span className="text-sm font-normal text-gray-500">kg</span>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-100 rounded-2xl p-5 border border-emerald-200 shadow-sm hover:bg-emerald-200 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('classes.totalEarningsAll')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : `Rp ${formatNumber(stats.totalEarnings)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('classes.noClasses')}</h3>
          <p className="text-gray-500 mb-6">{t('classes.noClassesHint')}</p>
          <button
            onClick={() => setShowAddEntryModal(true)}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('classes.addClassWasteEntry')}
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white">
                  <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4 w-16">#</th>
                  <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">Class</th>
                  <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">{t('classes.totalWaste')}</th>
                  <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">{t('classes.totalEarnings')}</th>
                  <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">{t('classes.lastEntry')}</th>
                  <th className="text-right text-sm font-bold uppercase tracking-wider px-6 py-4 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClasses.map((classData, index) => (
                  <ClassRow
                    key={classData.id}
                    classData={classData}
                    index={index + 1}
                    onEdit={() => {}}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddClassWasteEntryModal
        isOpen={showAddEntryModal}
        onClose={() => setShowAddEntryModal(false)}
        onSuccess={() => {
          setShowAddEntryModal(false);
          refetch();
        }}
      />
    </div>
  );
}
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Loader2, GraduationCap, Package, Wallet, Calendar } from 'lucide-react';
import { useClasses, useClassesStats } from '../hooks/useClasses';
import { formatNumber } from '../utils/portalHelpers';
import AddClassWasteEntryModal from '../components/classes/AddClassWasteEntryModal';

const CLASS_COLORS = [
  { from: 'from-indigo-100', to: 'to-purple-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  { from: 'from-amber-100', to: 'to-orange-100', text: 'text-amber-700', border: 'border-amber-200' },
  { from: 'from-emerald-100', to: 'to-teal-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { from: 'from-rose-100', to: 'to-pink-100', text: 'text-rose-700', border: 'border-rose-200' },
  { from: 'from-cyan-100', to: 'to-blue-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { from: 'from-violet-100', to: 'to-fuchsia-100', text: 'text-violet-700', border: 'border-violet-200' },
  { from: 'from-sky-100', to: 'to-indigo-100', text: 'text-sky-700', border: 'border-sky-200' },
  { from: 'from-lime-100', to: 'to-green-100', text: 'text-lime-700', border: 'border-lime-200' },
];

function getClassColor(className) {
  if (!className) return CLASS_COLORS[0];
  let hash = 0;
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CLASS_COLORS[Math.abs(hash) % CLASS_COLORS.length];
}

function ClassCard({ classData, index }) {
  const { t } = useTranslation();
  const color = getClassColor(classData.name);
  const lastEntry = classData.lastEntryDate?.toDate ? classData.lastEntryDate.toDate() : classData.lastEntryDate;
  
  const formattedDate = lastEntry 
    ? new Date(lastEntry).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  return (
    <Link
      to={`/classes/${classData.id}`}
      className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color.from} ${color.to} border ${color.border}
        hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-2xl`}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-white/60 backdrop-blur flex items-center justify-center shadow-sm`}>
              <GraduationCap className={`w-6 h-6 ${color.text}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${color.text}`}>{classData.name}</h3>
              <p className="text-gray-500 text-sm">Class</p>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
            <span className={`${color.text} text-sm`}>→</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/40 backdrop-blur rounded-xl p-3 border border-white/50">
            <div className="flex items-center gap-2 mb-1">
              <Package className={`w-4 h-4 ${color.text}`} />
              <span className="text-gray-500 text-xs">{t('classes.totalWaste')}</span>
            </div>
            <p className={`${color.text} font-bold text-lg`}>{formatNumber(classData.totalWaste || 0)} <span className="text-sm font-normal">kg</span></p>
          </div>
          <div className="bg-white/40 backdrop-blur rounded-xl p-3 border border-white/50">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className={`w-4 h-4 ${color.text}`} />
              <span className="text-gray-500 text-xs">{t('classes.totalEarnings')}</span>
            </div>
            <p className={`${color.text} font-bold text-lg`}>Rp {formatNumber(classData.totalEarnings || 0)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{t('classes.lastEntry')}: {formattedDate}</span>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
    </Link>
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
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">{t('classes.totalClasses')}</p>
              <p className="text-2xl font-bold">{statsLoading ? '...' : stats.totalClasses}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">{t('classes.totalWasteAll')}</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : formatNumber(stats.totalWaste)} <span className="text-sm font-normal text-white/80">kg</span>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">{t('classes.totalEarningsAll')}</p>
              <p className="text-2xl font-bold">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedClasses.map((classData, index) => (
            <ClassCard key={classData.id} classData={classData} index={index} />
          ))}
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
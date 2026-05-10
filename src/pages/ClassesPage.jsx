import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Loader2, GraduationCap, Package, Wallet, Calendar } from 'lucide-react';
import { useClasses, useClassesStats } from '../hooks/useClasses';
import { formatNumber } from '../utils/portalHelpers';
import AddClassModal from '../components/classes/AddClassModal';
import AddClassWasteEntryModal from '../components/classes/AddClassWasteEntryModal';

const CLASS_COLORS = [
  { from: 'from-indigo-500', to: 'to-purple-500' },
  { from: 'from-amber-500', to: 'to-orange-500' },
  { from: 'from-emerald-500', to: 'to-teal-500' },
  { from: 'from-rose-500', to: 'to-pink-500' },
  { from: 'from-cyan-500', to: 'to-blue-500' },
  { from: 'from-violet-500', to: 'to-fuchsia-500' },
  { from: 'from-sky-500', to: 'to-indigo-500' },
  { from: 'from-lime-500', to: 'to-green-500' },
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
    ? new Date(lastEntry).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  return (
    <Link
      to={`/classes/${classData.id}`}
      className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color.from} ${color.to} 
        hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl`}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{classData.name}</h3>
              <p className="text-white/70 text-sm">Class</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm">→</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-white/80" />
              <span className="text-white/70 text-xs">{t('classes.totalWaste')}</span>
            </div>
            <p className="text-white font-bold text-lg">{formatNumber(classData.totalWaste || 0)} <span className="text-sm font-normal">kg</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-white/80" />
              <span className="text-white/70 text-xs">{t('classes.totalEarnings')}</span>
            </div>
            <p className="text-white font-bold text-lg">Rp {formatNumber(classData.totalEarnings || 0)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/70 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{t('classes.lastEntry')}: {formattedDate}</span>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
    </Link>
  );
}

export default function ClassesPage() {
  const { t } = useTranslation();
  const { classes, loading, error, refetch } = useClasses();
  const { stats, loading: statsLoading } = useClassesStats();
  const [showAddClassModal, setShowAddClassModal] = useState(false);
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
            onClick={() => setShowAddClassModal(true)}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('classes.addClass')}
          </button>
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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('classes.totalClasses')}</p>
              <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : stats.totalClasses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('classes.totalWasteAll')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : formatNumber(stats.totalWaste)} <span className="text-sm font-normal text-gray-500">kg</span>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedClasses.map((classData, index) => (
            <ClassCard key={classData.id} classData={classData} index={index} />
          ))}
        </div>
      )}

      <AddClassModal
        isOpen={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        onSuccess={() => {
          setShowAddClassModal(false);
          refetch();
        }}
      />

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
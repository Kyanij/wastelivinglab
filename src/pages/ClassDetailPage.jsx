import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Package, Wallet, Calendar, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

import { useClassDetail, useFilters, filterEntries, groupEntriesByDate, useExpandedDates } from '../hooks/classDetail';
import { useClassMutations } from '../hooks/useClasses';
import { formatNumber, toLocalDateString as toLocalDate } from '../utils/portalHelpers';
import EnhancedDateRangePicker from '../components/reports/EnhancedDateRangePicker';

import AddClassWasteEntryModal from '../components/classes/AddClassWasteEntryModal';
import EditClassItemModal from '../components/classes/EditClassItemModal';
import EditClassDateModal from '../components/classes/EditClassDateModal';
import DeleteClassItemModal from '../components/classes/DeleteClassItemModal';
import DeleteClassDateModal from '../components/classes/DeleteClassDateModal';

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

const DATE_COLORS = [
  { bg: 'from-rose-100 to-pink-100', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-500' },
  { bg: 'from-blue-100 to-cyan-100', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-500' },
  { bg: 'from-amber-100 to-orange-100', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500' },
  { bg: 'from-violet-100 to-purple-100', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-500' },
  { bg: 'from-emerald-100 to-teal-100', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  { bg: 'from-indigo-100 to-blue-100', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-500' },
  { bg: 'from-cyan-100 to-sky-100', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-500' },
];

function ClassHeader({ classData, onAddEntry }) {
  const { t } = useTranslation();
  const totalEntries = classData.totalWaste > 0 ? Math.ceil(classData.totalWaste / 5) : 0;
  const avgPerEntry = totalEntries > 0 ? classData.totalWaste / totalEntries : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400/30 via-teal-400/20 to-cyan-400/30 p-6 text-gray-800">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-teal-400/20 rounded-full blur-xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{classData.name?.charAt(0) || 'C'}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
              <p className="text-gray-500 mt-1">{t('classDetail.pageSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onAddEntry}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <Plus className="w-5 h-5" />
            {t('classDetail.addWasteEntry')}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-500/10 backdrop-blur rounded-xl p-4 border border-blue-200/50 hover:bg-blue-500/20 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              {t('classDetail.totalWaste')}
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(classData.totalWaste || 0)} <span className="text-sm font-normal">kg</span></p>
          </div>
          <div className="bg-green-500/10 backdrop-blur rounded-xl p-4 border border-green-200/50 hover:bg-green-500/20 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              {t('classDetail.totalEarnings')}
            </div>
            <p className="text-2xl font-bold text-gray-900">Rp {formatNumber(classData.totalEarnings || 0)}</p>
          </div>
          <div className="bg-purple-500/10 backdrop-blur rounded-xl p-4 border border-purple-200/50 hover:bg-purple-500/20 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-purple-600 text-sm mb-1">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              {t('classDetail.totalEntries')}
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalEntries || 0}</p>
          </div>
          <div className="bg-orange-500/10 backdrop-blur rounded-xl p-4 border border-orange-200/50 hover:bg-orange-500/20 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              {t('classDetail.averagePerEntry')}
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(avgPerEntry)} <span className="text-sm font-normal">kg</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateGroupRow({ dateGroup, isExpanded, onToggle, onEditDate, onDeleteDate, onEditItem, onDeleteItem, filteredTotalWeight, filteredTotalEarnings, hasActiveFilters, colorIndex = 0 }) {
  const { t, i18n } = useTranslation();
  const icon = WASTE_TYPE_ICONS[dateGroup.entries[0]?.wasteTypeName] || '📦';
  const colors = DATE_COLORS[colorIndex % DATE_COLORS.length];
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className={`group bg-gradient-to-r ${colors.bg} rounded-2xl border ${colors.border} shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01] hover:${colors.border.replace('border-', 'shadow-')}/30`}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer transition-all duration-300"
        onClick={() => onToggle(dateGroup.dateKey)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/60 shadow-sm transition-all duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            {isExpanded ? <ChevronDown className={`w-5 h-5 ${colors.text}`} /> : <ChevronRight className={`w-5 h-5 text-gray-400 ${colors.text} transition-colors`} />}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${colors.text} tracking-tight`}>
              {formatDate(dateGroup.dateKey)}
            </h3>
            <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">{dateGroup.entryCount} {t('classDetail.entries')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">{t('classDetail.totalWeightHeader')}</p>
            <p className="font-bold text-gray-800">{formatNumber(dateGroup.totalWeight)} kg</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{t('classDetail.totalEarningsHeader')}</p>
            <p className={`font-bold ${colors.text.replace('700', '600')}`}>Rp {formatNumber(dateGroup.totalEarnings)}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEditDate(dateGroup); }}
              className="pointer-events-auto relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50/50 border border-indigo-200/50 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteDate(dateGroup); }}
              className="pointer-events-auto relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50/50 border border-red-200/50 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-lg hover:shadow-red-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-white/40 p-4 bg-white/50">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2">{t('portal.wasteType')}</th>
                <th className="pb-2">{t('portal.weight')}</th>
                <th className="pb-2">{t('wasteEntry.price')}</th>
                <th className="pb-2">{t('portal.amount')}</th>
                <th className="pb-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {dateGroup.entries.map((entry, idx) => (
                <tr key={entry.id} className="border-t border-gray-100/50 hover:bg-white/60 transition-all duration-200">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{WASTE_TYPE_ICONS[entry.wasteTypeName] || '📦'}</span>
                      <span className="font-semibold text-gray-800">{entry.wasteTypeName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600 font-medium">{entry.weight} kg</td>
                  <td className="py-3 text-gray-600 font-medium">Rp {entry.price}</td>
                  <td className={`py-3 font-bold ${colors.text.replace('700', '600')}`}>Rp {formatNumber(entry.amount)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditItem(entry, dateGroup)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(entry, dateGroup)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ClassDetailPage() {
  const { t } = useTranslation();
  const { id: classId } = useParams();

  const { classData, entries, loading, error, refetch } = useClassDetail(classId);
  const { filters, setFilters, hasActiveFilters, resetFilters, defaultDateFrom, defaultDateTo } = useFilters();
  const { expandedDates, toggleDate, isExpanded, expandAll } = useExpandedDates();
  const { loading: mutationLoading, updateEntry, updateDateEntries, deleteEntry, deleteEntriesByDate } = useClassMutations(classId, refetch);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateRange, setDateRange] = useState({ from: firstDayOfMonth, to: today });

  const [editItemModal, setEditItemModal] = useState(null);
  const [editDateModal, setEditDateModal] = useState(null);
  const [deleteItemModal, setDeleteItemModal] = useState(null);
  const [deleteDateModal, setDeleteDateModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastAddedDate, setLastAddedDate] = useState(null);

  const handleDateRangeChange = (from, to) => {
    setDateRange({ from, to });
    setFilters((prev) => ({
      ...prev,
      dateFrom: toLocalDate(from),
      dateTo: toLocalDate(to),
    }));
  };
  const handleAddSuccess = (addedDate) => setLastAddedDate(addedDate);

  const filteredEntries = useMemo(() => filterEntries(entries, filters), [entries, filters]);
  const dateGroups = useMemo(() => groupEntriesByDate(filteredEntries), [filteredEntries]);
  const filteredTotals = useMemo(() => ({
    totalWeight: filteredEntries.reduce((s, e) => s + (e.weight || 0), 0),
    totalEarnings: filteredEntries.reduce((s, e) => s + (e.amount || 0), 0),
  }), [filteredEntries]);

  const handleEditItem = async (updates) => {
    if (!editItemModal) return;
    const success = await updateEntry(editItemModal.entry.id, editItemModal.entry, updates);
    if (success) setEditItemModal(null);
  };

  const handleEditDate = async (originalEntries, updatedRows, removedRows, addedRows) => {
    if (!editDateModal) return;
    const date = new Date(editDateModal.dateGroup.dateKey);
    date.setHours(12, 0, 0, 0);
    const success = await updateDateEntries(originalEntries, updatedRows, removedRows, addedRows, date);
    if (success) setEditDateModal(null);
  };

  const handleDeleteItem = async () => {
    if (!deleteItemModal) return;
    const success = await deleteEntry(deleteItemModal.entry);
    if (success) setDeleteItemModal(null);
  };

  const handleDeleteDate = async () => {
    if (!deleteDateModal) return;
    const success = await deleteEntriesByDate(deleteDateModal.dateGroup.entries);
    if (success) setDeleteDateModal(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
    </div>
  );

  if (error || !classData) return (
    <div className="text-center py-12">
      <p className="text-gray-500">{t('common.error')}: {error}</p>
      <Link to="/classes" className="text-green-600 hover:underline mt-2 inline-block">{t('classDetail.backToClasses')}</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/classes" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          {t('classDetail.backToClasses')}
        </Link>
      </div>

      <ClassHeader classData={classData} onAddEntry={() => setShowAddModal(true)} />

      <EnhancedDateRangePicker
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={() => refetch()}
      />

      {dateGroups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('classDetail.emptyState')}</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">{t('classDetail.emptyStateHint')}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all inline-flex items-center gap-2 shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50"
          >
            <Plus className="w-5 h-5" />
            {t('classDetail.addWasteEntry')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dateGroups.map((dateGroup, index) => (
            <DateGroupRow
              key={dateGroup.dateKey}
              dateGroup={dateGroup}
              colorIndex={index}
              isExpanded={isExpanded(dateGroup.dateKey)}
              onToggle={toggleDate}
              onEditDate={(dg) => setEditDateModal({ dateGroup: dg, entries: dg.entries })}
              onDeleteDate={(dg) => setDeleteDateModal({ dateGroup: dg })}
              onEditItem={(entry, dg) => setEditItemModal({ entry, dateGroup: dg })}
              onDeleteItem={(entry, dg) => setDeleteItemModal({ entry, dateGroup: dg })}
              filteredTotalWeight={filteredTotals.totalWeight}
              filteredTotalEarnings={filteredTotals.totalEarnings}
              hasActiveFilters={hasActiveFilters}
            />
          ))}
          {dateGroups.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-5 text-white shadow-xl shadow-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">Total Summary</p>
                    <p className="text-2xl font-bold">{dateGroups.length} {dateGroups.length === 1 ? 'day' : 'days'} of entries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">{formatNumber(filteredTotals.totalWeight)} kg total waste</p>
                  <p className="text-3xl font-bold">Rp {formatNumber(filteredTotals.totalEarnings)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <AddClassWasteEntryModal
        isOpen={showAddModal}
        preSelectedClass={classData?.name}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          refetch();
        }}
      />

      <EditClassItemModal 
        entry={editItemModal?.entry} 
        isOpen={!!editItemModal} 
        onClose={() => setEditItemModal(null)} 
        onSave={handleEditItem} 
        loading={mutationLoading} 
      />

      <EditClassDateModal 
        dateGroup={editDateModal?.dateGroup} 
        isOpen={!!editDateModal} 
        onClose={() => setEditDateModal(null)} 
        onSave={handleEditDate} 
        loading={mutationLoading} 
      />

      <DeleteClassItemModal 
        entry={deleteItemModal?.entry} 
        isOpen={!!deleteItemModal} 
        onClose={() => setDeleteItemModal(null)} 
        onConfirm={handleDeleteItem} 
        loading={mutationLoading} 
      />

      <DeleteClassDateModal 
        dateGroup={deleteDateModal?.dateGroup} 
        isOpen={!!deleteDateModal} 
        onClose={() => setDeleteDateModal(null)} 
        onConfirm={handleDeleteDate} 
        loading={mutationLoading} 
      />
    </div>
  );
}
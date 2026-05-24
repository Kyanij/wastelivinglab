import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Package, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';


import { useClassDetail, useFilters, filterEntries, groupEntriesByDate, useExpandedDates } from '../hooks/classDetail';
import { useClassMutations } from '../hooks/useClasses';
import { formatNumber, toLocalDateString as toLocalDate } from '../utils/portalHelpers';
import { formatCurrency } from '../utils/formatCurrency';
import EnhancedDateRangePicker from '../components/reports/EnhancedDateRangePicker';

import AddClassWasteEntryModal from '../components/classes/AddClassWasteEntryModal';
import EditClassItemModal from '../components/classes/EditClassItemModal';
import EditClassDateModal from '../components/classes/EditClassDateModal';
import DeleteClassItemModal from '../components/classes/DeleteClassItemModal';
import DeleteClassDateModal from '../components/classes/DeleteClassDateModal';


const DATE_COLORS = [
  { bg: 'from-emerald-50 to-green-100', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  { bg: 'from-green-50 to-emerald-100', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-500' },
  { bg: 'from-teal-50 to-green-100', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-500' },
  { bg: 'from-emerald-50 to-teal-100', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-500' },
  { bg: 'from-green-50 to-lime-100', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-500' },
  { bg: 'from-teal-50 to-emerald-100', border: 'border-teal-200', text: 'text-teal-600', badge: 'bg-teal-500' },
  { bg: 'from-emerald-50 to-green-100', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
];

function ClassHeader({ classData, onAddEntry }) {
  const { t } = useTranslation();
  const totalEntries = classData.totalWaste > 0 ? Math.ceil(classData.totalWaste / 5) : 0;
  const avgPerEntry = totalEntries > 0 ? classData.totalWaste / totalEntries : 0;

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-green-600/60 p-4 md:p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 pointer-events-none" />
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
                <span className="text-2xl font-bold text-white">{classData.name?.charAt(0) || 'C'}</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">{classData.name}</h1>
                
                </div>
                <p className="text-sm text-gray-500 mt-1">{t('classDetail.pageSubtitle')}</p>
              </div>
            </div>
            <button
              onClick={onAddEntry}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-medium transition-all duration-300 text-sm md:text-base shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-200/60 hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              {t('classDetail.addWasteEntry')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl px-3 md:px-4 py-2 md:py-3 border border-blue-200/50 shadow-md shadow-blue-100/50 hover:shadow-lg hover:shadow-blue-100/70 hover:scale-105 transition-all duration-300 cursor-default">
              <p className="text-blue-600 text-xs md:text-sm font-medium">{t('classDetail.totalWaste')}</p>
              <p className="text-lg md:text-xl font-bold text-blue-700">{formatNumber(classData.totalWaste || 0)} kg</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl px-3 md:px-4 py-2 md:py-3 border border-green-200/50 shadow-md shadow-green-100/50 hover:shadow-lg hover:shadow-green-100/70 hover:scale-105 transition-all duration-300 cursor-default">
              <p className="text-green-600 text-xs md:text-sm font-medium">{t('classDetail.totalEarnings')}</p>
              <p className="text-lg md:text-xl font-bold text-green-700">Rp {formatNumber(classData.totalEarnings || 0)}</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl px-3 md:px-4 py-2 md:py-3 border border-teal-200/50 shadow-md shadow-teal-100/50 hover:shadow-lg hover:shadow-teal-100/70 hover:scale-105 transition-all duration-300 cursor-default">
              <p className="text-teal-600 text-xs md:text-sm font-medium">{t('classDetail.totalEntries')}</p>
              <p className="text-lg md:text-xl font-bold text-teal-700">{totalEntries || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl px-3 md:px-4 py-2 md:py-3 border border-emerald-200/50 shadow-md shadow-emerald-100/50 hover:shadow-lg hover:shadow-emerald-100/70 hover:scale-105 transition-all duration-300 cursor-default">
              <p className="text-emerald-600 text-xs md:text-sm font-medium">{t('classDetail.averagePerEntry')}</p>
              <p className="text-lg md:text-xl font-bold text-emerald-700">{formatNumber(avgPerEntry)} kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateGroupRow({ dateGroup, isExpanded, onToggle, onEditDate, onDeleteDate, onEditItem, onDeleteItem, filteredTotalWeight, filteredTotalEarnings, hasActiveFilters, colorIndex = 0 }) {
  const { t } = useTranslation();
  const colors = DATE_COLORS[colorIndex % DATE_COLORS.length];
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className={`group bg-gradient-to-r ${colors.bg} rounded-2xl border ${colors.border} shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}>
      <div
        className="flex items-center justify-between p-3 md:p-4 cursor-pointer transition-all duration-300"
        onClick={() => onToggle(dateGroup.dateKey)}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/60 shadow-sm transition-all duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            {isExpanded ? <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 ${colors.text}`} /> : <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 ${colors.text} transition-colors`} />}
          </div>
          <div>
            <h3 className={`font-bold text-sm md:text-base ${colors.text} tracking-tight`}>
              {formatDate(dateGroup.dateKey)}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-600 transition-colors">{dateGroup.entryCount} {t('classDetail.entries')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">{t('classDetail.totalWeightHeader')}</p>
            <p className="font-bold text-gray-800 text-sm md:text-base">{formatNumber(dateGroup.totalWeight)} kg</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{t('classDetail.totalEarningsHeader')}</p>
            <p className={`font-bold text-sm md:text-base ${colors.text.replace('700', '600')}`}>Rp {formatNumber(dateGroup.totalEarnings)}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEditDate(dateGroup); }}
              className="pointer-events-auto relative z-10 flex items-center justify-center gap-1.5 p-2 text-sm font-medium text-indigo-600 bg-indigo-50/50 border border-indigo-200/50 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteDate(dateGroup); }}
              className="pointer-events-auto relative z-10 flex items-center justify-center gap-1.5 p-2 text-sm font-medium text-red-600 bg-red-50/50 border border-red-200/50 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-lg hover:shadow-red-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gradient-to-br from-gray-50/80 to-emerald-50/30 border-l-4 border-l-emerald-400 ml-0 rounded-r-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-100 via-green-50 to-teal-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <th className="px-3 md:px-4 py-2.5 text-left w-[25%]">{t('wasteEntry.wasteType')}</th>
                  <th className="px-3 md:px-4 py-2.5 text-right w-[20%]">{t('wasteEntry.weight')}</th>
                  <th className="px-3 md:px-4 py-2.5 text-right w-[20%]">{t('wasteEntry.price')}</th>
                  <th className="px-3 md:px-4 py-2.5 text-right w-[20%]">{t('wasteEntry.amount')}</th>
                  <th className="px-3 md:px-4 py-2.5 text-center w-[15%]"></th>
                </tr>
              </thead>
              <tbody>
                {dateGroup.entries.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className="group border-t border-gray-100/50 bg-white/60 hover:bg-gradient-to-r hover:from-emerald-50/80 hover:to-teal-50/80 transition-all duration-300 hover:shadow-md hover:shadow-emerald-100/30"
                  >
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 font-semibold text-sm group-hover:text-emerald-700 transition-colors">
                      {entry.wasteTypeName}
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-gray-700 font-medium text-sm group-hover:text-emerald-700 transition-colors">
                      {formatNumber(entry.weight)} kg
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-gray-700 font-medium text-sm group-hover:text-teal-600 transition-colors">
                      Rp{formatCurrency(entry.price)}
                    </td>
                    <td className={`px-3 md:px-4 py-2.5 md:py-3 text-right text-sm font-bold ${colors.text.replace('700', '600')} group-hover:text-emerald-700 transition-colors`}>
                      Rp{formatCurrency(entry.amount)}
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3">
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <button
                          onClick={() => onEditItem(entry, dateGroup)}
                          className="p-1.5 md:p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg hover:shadow-md hover:shadow-emerald-100 transition-all duration-200 hover:scale-110 active:scale-95"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(entry, dateGroup)}
                          className="p-1.5 md:p-2 text-red-500 hover:bg-red-100 rounded-lg hover:shadow-md hover:shadow-red-100 transition-all duration-200 hover:scale-110 active:scale-95"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-4 md:p-5 text-white shadow-xl shadow-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-xs md:text-sm font-medium">{t('common.total')}</p>
                    <p className="text-lg md:text-xl font-bold">{dateGroups.length} {dateGroups.length === 1 ? 'day' : 'days'} of entries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs md:text-sm">{formatNumber(filteredTotals.totalWeight || 0)} kg total waste</p>
                  <p className="text-xl md:text-2xl font-bold">Rp {formatNumber(filteredTotals.totalEarnings || 0)}</p>
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
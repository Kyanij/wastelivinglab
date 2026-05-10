import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Package, Wallet, Calendar, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { startOfMonth } from 'date-fns';

import { useClassDetail, useFilters, filterEntries, groupEntriesByDate, useExpandedDates } from '../hooks/classDetail';
import { useClassMutations } from '../hooks/useClasses';
import { formatNumber, toLocalDateString as toLocalDate } from '../utils/portalHelpers';

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

function ClassHeader({ classData, onAddEntry }) {
  const { t } = useTranslation();
  const totalEntries = classData.totalWaste > 0 ? Math.ceil(classData.totalWaste / 5) : 0;
  const avgPerEntry = totalEntries > 0 ? classData.totalWaste / totalEntries : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{classData.name}</h1>
            <p className="text-white/80 mt-1">{t('classDetail.pageSubtitle')}</p>
          </div>
          <button
            onClick={onAddEntry}
            className="px-5 py-2.5 bg-white text-indigo-600 font-medium rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            {t('classDetail.addWasteEntry')}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <Package className="w-4 h-4" />
              {t('classDetail.totalWaste')}
            </div>
            <p className="text-2xl font-bold">{formatNumber(classData.totalWaste || 0)} <span className="text-sm font-normal">kg</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <Wallet className="w-4 h-4" />
              {t('classDetail.totalEarnings')}
            </div>
            <p className="text-2xl font-bold">Rp {formatNumber(classData.totalEarnings || 0)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <Calendar className="w-4 h-4" />
              {t('classDetail.totalEntries')}
            </div>
            <p className="text-2xl font-bold">{totalEntries || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              {t('classDetail.averagePerEntry')}
            </div>
            <p className="text-2xl font-bold">{formatNumber(avgPerEntry)} <span className="text-sm font-normal">kg</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ filters, setFilters, hasActiveFilters, resetFilters, dateRange, onDateRangeChange }) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('classDetail.from')}:</span>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange(e.target.value, dateRange.to)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('classDetail.to')}:</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange(dateRange.from, e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            {t('classDetail.resetFilters')}
          </button>
        )}
      </div>
    </div>
  );
}

function DateGroupRow({ dateGroup, isExpanded, onToggle, onEditDate, onDeleteDate, onEditItem, onDeleteItem, filteredTotalWeight, filteredTotalEarnings, hasActiveFilters }) {
  const { t } = useTranslation();
  const icon = WASTE_TYPE_ICONS[dateGroup.entries[0]?.wasteTypeName] || '📦';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onToggle(dateGroup.dateKey)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {new Date(dateGroup.dateKey).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-sm text-gray-500">{dateGroup.entryCount} {t('classDetail.entries')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('classDetail.totalWeightHeader')}</p>
            <p className="font-medium text-gray-900">{formatNumber(dateGroup.totalWeight)} kg</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('classDetail.totalEarningsHeader')}</p>
            <p className="font-medium text-green-600">Rp {formatNumber(dateGroup.totalEarnings)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEditDate(dateGroup); }}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteDate(dateGroup); }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2">{t('portal.wasteType')}</th>
                <th className="pb-2">{t('portal.weight')}</th>
                <th className="pb-2">{t('wasteEntry.price')}</th>
                <th className="pb-2">{t('portal.amount')}</th>
                <th className="pb-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {dateGroup.entries.map((entry) => (
                <tr key={entry.id} className="border-t border-gray-100">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{WASTE_TYPE_ICONS[entry.wasteTypeName] || '📦'}</span>
                      <span className="font-medium text-gray-900">{entry.wasteTypeName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">{entry.weight} kg</td>
                  <td className="py-3 text-gray-600">Rp {entry.price}</td>
                  <td className="py-3 font-medium text-green-600">Rp {formatNumber(entry.amount)}</td>
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

  const handleDateRangeChange = (from, to) => setDateRange({ from: new Date(from), to: new Date(to) });
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

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      {dateGroups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('classDetail.emptyState')}</h3>
          <p className="text-gray-500 mb-6">{t('classDetail.emptyStateHint')}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('classDetail.addWasteEntry')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {hasActiveFilters && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">{t('studentDetail.filteredSummary')}: </span>
                  <span className="font-medium text-gray-900">{formatNumber(filteredTotals.totalWeight)} kg</span>
                  <span className="text-gray-500 mx-2">|</span>
                  <span className="font-medium text-green-600">Rp {formatNumber(filteredTotals.totalEarnings)}</span>
                </div>
                <button onClick={resetFilters} className="text-sm text-red-600 hover:underline">
                  {t('classDetail.resetFilters')}
                </button>
              </div>
            </div>
          )}
          {dateGroups.map((dateGroup) => (
            <DateGroupRow
              key={dateGroup.dateKey}
              dateGroup={dateGroup}
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
        </div>
      )}

      <AddClassWasteEntryModal
        isOpen={showAddModal}
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
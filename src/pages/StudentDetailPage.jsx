import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { startOfMonth } from 'date-fns';

import { useStudentDetail, useFilters, filterEntries, groupEntriesByDate, useExpandedDates } from '../hooks/studentDetail/useStudentDetail';
import { useEntryMutations } from '../hooks/studentDetail/useEntryMutations';
import { toLocalDateString as toLocalDate } from '../utils/portalHelpers';

import StudentHeader from '../components/studentDetail/StudentHeader';
import FilterBar from '../components/studentDetail/FilterBar';
import HistoryTable from '../components/studentDetail/HistoryTable';
import EditItemModal from '../components/studentDetail/EditItemModal';
import EditDateModal from '../components/studentDetail/EditDateModal';
import DeleteItemModal from '../components/studentDetail/DeleteItemModal';
import DeleteDateModal from '../components/studentDetail/DeleteDateModal';
import AddWasteEntryModal from '../components/studentDetail/AddWasteEntryModal';

export default function StudentDetailPage() {
  const { t } = useTranslation();
  const { id: studentId } = useParams();

  const { student, entries, loading, error, getInitials, refetch } = useStudentDetail(studentId);
  const { filters, setFilters, hasActiveFilters, resetFilters, defaultDateFrom, defaultDateTo } = useFilters();
  const { expandedDates, toggleDate, isExpanded, expandAll } = useExpandedDates();
  const { loading: mutationLoading, updateItem, updateDateEntries, deleteItem, deleteDateEntries } = useEntryMutations(studentId, refetch);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateRange, setDateRange] = useState({ from: firstDayOfMonth, to: today });

  const [editItemModal, setEditItemModal] = useState(null);
  const [editDateModal, setEditDateModal] = useState(null);
  const [deleteItemModal, setDeleteItemModal] = useState(null);
  const [deleteDateModal, setDeleteDateModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastAddedDate, setLastAddedDate] = useState(null);

  const handleDateRangeChange = (from, to) => setDateRange({ from, to });
  const handleAddSuccess = (addedDate) => setLastAddedDate(addedDate);

  useEffect(() => {
    if (lastAddedDate && !loading && entries.length > 0) {
      const dateExists = entries.some((entry) => {
        const d = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date);
        return toLocalDate(d) === lastAddedDate;
      });
      if (dateExists) { expandAll([lastAddedDate]); setLastAddedDate(null); }
    }
  }, [entries, lastAddedDate, loading, expandAll]);

  const filteredEntries = useMemo(() => filterEntries(entries, filters), [entries, filters]);
  const dateGroups = useMemo(() => groupEntriesByDate(filteredEntries), [filteredEntries]);
  const filteredTotals = useMemo(() => ({
    totalWeight: filteredEntries.reduce((s, e) => s + (e.weight || 0), 0),
    totalEarnings: filteredEntries.reduce((s, e) => s + (e.amount || 0), 0),
  }), [filteredEntries]);

  const handleEditItem = async (updates) => {
    if (!editItemModal) return;
    const success = await updateItem(editItemModal.entry, updates);
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
    const success = await deleteItem(deleteItemModal.entry);
    if (success) setDeleteItemModal(null);
  };
  const handleDeleteDate = async () => {
    if (!deleteDateModal) return;
    const success = await deleteDateEntries(deleteDateModal.dateGroup.entries);
    if (success) setDeleteDateModal(null);
  };

  const pdfData = useMemo(() => ({ student, entries: filteredEntries }), [student, filteredEntries]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
    </div>
  );

  if (error || !student) return (
    <div className="text-center py-12">
      <p className="text-gray-500">{t('common.error')}: {error}</p>
      <Link to="/students" className="text-green-600 hover:underline mt-2 inline-block">{t('studentDetail.backToStudents')}</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/students" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          {t('studentDetail.backToStudents')}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Waste History</h1>
        <p className="text-gray-500 mt-1">Detailed view of student waste collection and earnings</p>
      </div>

      <StudentHeader student={student} getInitials={getInitials} onAddEntry={() => setShowAddModal(true)} />

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        pdfData={pdfData}
        defaultDateFrom={defaultDateFrom}
        defaultDateTo={defaultDateTo}
      />

      <HistoryTable
        dateGroups={dateGroups}
        isExpanded={isExpanded}
        onToggle={toggleDate}
        onEditDate={(dg) => setEditDateModal({ dateGroup: dg, entries: dg.entries })}
        onDeleteDate={(dg) => setDeleteDateModal({ dateGroup: dg })}
        onEditItem={(entry, dg) => setEditItemModal({ entry, dateGroup: dg })}
        onDeleteItem={(entry, dg) => setDeleteItemModal({ entry, dateGroup: dg })}
        filteredTotalWeight={filteredTotals.totalWeight}
        filteredTotalEarnings={filteredTotals.totalEarnings}
        hasActiveFilters={hasActiveFilters}
      />

      <EditItemModal entry={editItemModal?.entry} isOpen={!!editItemModal} onClose={() => setEditItemModal(null)} onSave={handleEditItem} loading={mutationLoading} />
      <EditDateModal dateGroup={editDateModal?.dateGroup} isOpen={!!editDateModal} onClose={() => setEditDateModal(null)} onSave={handleEditDate} loading={mutationLoading} />
      <DeleteItemModal entry={deleteItemModal?.entry} isOpen={!!deleteItemModal} onClose={() => setDeleteItemModal(null)} onConfirm={handleDeleteItem} loading={mutationLoading} />
      <DeleteDateModal dateGroup={deleteDateModal?.dateGroup} isOpen={!!deleteDateModal} onClose={() => setDeleteDateModal(null)} onConfirm={handleDeleteDate} loading={mutationLoading} />
      <AddWasteEntryModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} student={student} refetch={refetch} onSuccess={handleAddSuccess} />
    </div>
  );
}
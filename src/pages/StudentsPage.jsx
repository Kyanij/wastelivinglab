import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, Users, Pencil, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStudents, getUniqueClasses } from '../firebase/students';
import { format } from 'date-fns';
import AddStudentModal from '../components/students/AddStudentModal';
import EditStudentModal from '../components/students/EditStudentModal';

const getClassBadgeColor = (cls) => {
  const badgeColors = {
    '6A': 'bg-green-100 text-green-700',
    '6B': 'bg-blue-100 text-blue-700',
    '6C': 'bg-purple-100 text-purple-700',
    '7A': 'bg-green-100 text-green-700',
    '7B': 'bg-blue-100 text-blue-700',
    '7C': 'bg-purple-100 text-purple-700',
    '8A': 'bg-green-100 text-green-700',
    '8B': 'bg-blue-100 text-blue-700',
    '8C': 'bg-purple-100 text-purple-700',
  };
  return badgeColors[cls] || 'bg-gray-100 text-gray-700';
};

function StudentRow({ student, index, onEdit }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const initials = student.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatLastEntry = (date) => {
    if (!date) return '-';
    try {
      return format(date.toDate(), 'MMM dd, yyyy');
    } catch {
      return '-';
    }
  };

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-gray-500">{index}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">{initials}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{student.name}</p>
            <p className="text-sm text-gray-500">No. {student.rollNo}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getClassBadgeColor(student.class)}`}>
          {student.class}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-900">{student.totalWaste?.toFixed(1) || '0.0'} kg</td>
      <td className="px-6 py-4">
        <span className="text-green-600 font-semibold">Rp{student.totalEarnings?.toFixed(2) || '0.00'}</span>
      </td>
      <td className="px-6 py-4 text-gray-500">{formatLastEntry(student.lastEntryDate)}</td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            {t('students.edit')}
          </button>
          <button
            onClick={() => navigate(`/students/${student.id}`)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
            {t('students.viewDetails')}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function StudentsPage() {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const pageSize = 10;

  const loadStudents = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const cursor = reset ? null : lastVisible;
      const result = await getStudents(pageSize, cursor);
      setStudents(result.students);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  }, [lastVisible, pageSize]);

  const loadClasses = useCallback(async () => {
    const uniqueClasses = await getUniqueClasses();
    setClasses(uniqueClasses);
  }, []);

  useEffect(() => {
    loadStudents(true);
    loadClasses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadStudents(true);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !search ||
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = !selectedClass || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
      loadStudents();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      loadStudents(true);
    }
  };

  const handleEditSuccess = () => {
    setEditStudent(null);
    setCurrentPage(1);
    loadStudents(true);
  };

  const filteredCount = filteredStudents.length;
  const fromNum = (currentPage - 1) * pageSize + 1;
  const toNum = hasMore 
    ? currentPage * pageSize 
    : fromNum + filteredCount - 1 || fromNum;
  const totalStudents = hasMore ? currentPage * pageSize : toNum;
  const recordsCount = filteredCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('students.title')}</h1>
          <p className="text-gray-500 mt-1">Manage student records and track their waste collection</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t('students.addStudent')}
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('students.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </form>

        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer bg-white w-40"
        >
          <option value="">{t('students.allClasses')}</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-sm font-medium text-gray-500 px-6 py-3 w-16">#</th>
              <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">{t('students.tableHeaders.student')}</th>
              <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">{t('students.tableHeaders.class')}</th>
              <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">{t('students.tableHeaders.totalWaste')}</th>
              <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">{t('students.tableHeaders.totalEarnings')}</th>
              <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">{t('students.tableHeaders.lastEntry')}</th>
              <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">{t('students.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">{t('common.noData')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, index) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  index={(currentPage - 1) * pageSize + index + 1}
                  onEdit={() => setEditStudent(student)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <p className="text-gray-500 text-sm">
          {t('students.showing', { from: fromNum, to: toNum, total: totalStudents })} • {recordsCount} {t('students.recordsOnPage')}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-gray-900 font-medium">{currentPage}</span>
          <button
            onClick={handleNextPage}
            disabled={!hasMore}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            setCurrentPage(1);
            loadStudents(true);
            loadClasses();
          }}
        />
      )}

      {editStudent && (
        <EditStudentModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
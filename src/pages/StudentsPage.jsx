import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Loader2, Users, Pencil, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents, getUniqueClasses } from '../firebase/students';
import { formatDateShort } from '../utils/dateHelpers';
import AddStudentModal from '../components/students/AddStudentModal';
import EditStudentModal from '../components/students/EditStudentModal';
import Pagination from '../components/layout/Pagination';

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
      return formatDateShort(date);
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
            <p className="text-sm text-gray-500">{t('common.studentIdLabel')} {student.studentId}</p>
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
      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1 sm:gap-2">
          <button
            onClick={onEdit}
            className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span className="sm:hidden">{t('students.edit')}</span>
          </button>
          <button
            onClick={() => navigate(`/students/${student.id}`)}
            className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
            <span className="sm:hidden">{t('students.viewDetails')}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function StudentsPage() {
  const { t } = useTranslation();
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [studentsData, classesData] = await Promise.all([
        getAllStudents(),
        getUniqueClasses()
      ]);
      setAllStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      const matchesSearch =
        !search ||
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(search.toLowerCase()) ||
        student.class?.toLowerCase().includes(search.toLowerCase());
      const matchesClass = !selectedClass || student.class === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [allStudents, search, selectedClass]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalFilteredCount = filteredStudents.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;

  const handleEditSuccess = () => {
    setEditStudent(null);
    loadAllData();
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    loadAllData();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 -mx-4 md:mx-0 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('students.title')}</h1>
          <p className="text-gray-500 text-sm mt-1 hidden sm:block">{t('students.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t('students.addStudent')}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 md:mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder={t('students.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={handleClassChange}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer bg-white min-w-[120px]"
        >
          <option value="">{t('students.allClasses')}</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px]">
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
            ) : paginatedStudents.length === 0 ? (
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
              paginatedStudents.map((student, index) => (
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
      </div>

      {!loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalFilteredCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
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
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
  const colorMap = {
    '6A': 'from-green-400 to-emerald-500',
    '6B': 'from-blue-400 to-indigo-500', 
    '6C': 'from-purple-400 to-violet-500',
    '7A': 'from-amber-400 to-orange-500',
    '7B': 'from-rose-400 to-pink-500',
    '7C': 'from-cyan-400 to-teal-500',
    '8A': 'from-lime-400 to-green-600',
    '8B': 'from-fuchsia-400 to-purple-600',
    '8C': 'from-red-400 to-rose-500',
  };
  return colorMap[cls] || 'from-gray-400 to-gray-500';
};

const avatarColorSchemes = [
  { from: 'from-amber-100', to: 'to-orange-200', text: 'text-amber-700', ring: 'ring-amber-400/30' },
  { from: 'from-sky-100', to: 'to-blue-200', text: 'text-sky-700', ring: 'ring-sky-400/30' },
  { from: 'from-rose-100', to: 'to-pink-200', text: 'text-rose-700', ring: 'ring-rose-400/30' },
  { from: 'from-violet-100', to: 'to-purple-200', text: 'text-violet-700', ring: 'ring-violet-400/30' },
  { from: 'from-teal-100', to: 'to-cyan-200', text: 'text-teal-700', ring: 'ring-teal-400/30' },
  { from: 'from-emerald-100', to: 'to-green-200', text: 'text-emerald-700', ring: 'ring-emerald-400/30' },
  { from: 'from-lime-100', to: 'to-emerald-200', text: 'text-lime-700', ring: 'ring-lime-400/30' },
  { from: 'from-fuchsia-100', to: 'to-pink-200', text: 'text-fuchsia-700', ring: 'ring-fuchsia-400/30' },
  { from: 'from-indigo-100', to: 'to-blue-200', text: 'text-indigo-700', ring: 'ring-indigo-400/30' },
  { from: 'from-cyan-100', to: 'to-sky-200', text: 'text-cyan-700', ring: 'ring-cyan-400/30' },
  { from: 'from-orange-100', to: 'to-amber-200', text: 'text-orange-700', ring: 'ring-orange-400/30' },
  { from: 'from-slate-100', to: 'to-gray-200', text: 'text-slate-700', ring: 'ring-slate-400/30' },
];

const getAvatarColor = (name, cls) => {
  if (!name || !cls) return avatarColorSchemes[0];
  const str = `${name}${cls}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColorSchemes.length;
  return avatarColorSchemes[index];
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

  const avatarColor = getAvatarColor(student.name, student.class);
  const classGradient = getClassBadgeColor(student.class);

  return (
    <tr 
      onClick={() => navigate(`/students/${student.id}`)}
      className="cursor-pointer group border-b border-gray-100/30 last:border-0 transition-all duration-300 hover:bg-gradient-to-r hover:from-green-100/90 hover:to-emerald-100/90 hover:shadow-lg hover:shadow-green-200/50 hover:-translate-y-0.5"
    >
      <td className="px-6 py-4 w-16 text-gray-400 font-medium group-hover:text-gray-600 transition-colors">{index}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor.from} ${avatarColor.to} flex items-center justify-center ring-2 ${avatarColor.ring} group-hover:scale-115 transition-all duration-300`}>
            <span className={`text-sm font-bold ${avatarColor.text}`}>{initials}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-green-800 transition-colors">{student.name}</p>
            <p className="text-sm text-gray-500">{t('common.studentIdLabel')} {student.studentId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-br ${classGradient} text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
          {student.class}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-900 font-semibold group-hover:text-green-800 transition-colors">{student.totalWaste?.toFixed(1) || '0.0'} kg</td>
      <td className="px-6 py-4">
        <span className="text-green-600 font-bold group-hover:text-green-800 transition-colors">Rp{student.totalEarnings?.toFixed(2) || '0.00'}</span>
      </td>
      <td className="px-6 py-4 text-gray-500 group-hover:text-gray-700 transition-colors">{formatLastEntry(student.lastEntryDate)}</td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="pointer-events-auto relative z-10 w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-sm font-medium text-green-600 bg-green-50/50 border border-green-200/50 rounded-lg hover:bg-green-100 hover:border-green-300 hover:shadow-lg hover:shadow-green-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Pencil className="w-4 h-4" />
            <span className="sm:hidden">{t('students.edit')}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/students/${student.id}`); }}
            className="pointer-events-auto relative z-10 w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50/50 border border-emerald-200/50 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ChevronRightIcon className="w-4 h-4" />
            <span className="sm:hidden">{t('students.viewDetails')}</span>
          </button>
          <ChevronRightIcon className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
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
    <div className="min-h-screen -mx-4 md:mx-0">
      {/* Glass Card Header */}
      <div className="glass-card p-5 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200/50">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('students.title')}</h1>
              <p className="text-gray-500 text-sm hidden sm:block">{t('students.subtitle')}</p>
            </div>
          </div>
          
          {/* Add Student Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50"
          >
            <Plus className="w-5 h-5" />
            {t('students.addStudent')}
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={t('students.searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200/80 bg-white/70 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all"
            />
          </div>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="px-4 py-3 rounded-xl border border-gray-200/80 bg-white/70 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer shadow-sm min-w-[140px]"
          >
            <option value="">{t('students.allClasses')}</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white">
                <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4 w-16">#</th>
                <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">{t('students.tableHeaders.student')}</th>
                <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">{t('students.tableHeaders.class')}</th>
                <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">{t('students.tableHeaders.totalWaste')}</th>
                <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">{t('students.tableHeaders.totalEarnings')}</th>
                <th className="text-left text-sm font-bold uppercase tracking-wider px-6 py-4">{t('students.tableHeaders.lastEntry')}</th>
                <th className="text-right text-sm font-bold uppercase tracking-wider px-6 py-4 w-32">{t('students.tableHeaders.actions')}</th>
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
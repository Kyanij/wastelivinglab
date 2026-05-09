import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, ChevronDown } from 'lucide-react';
import { getAllStudents } from '../../firebase/reports';
import StudentAvatar from '../ui/StudentAvatar';
import { getClassGradient } from '../../utils/studentUtils';

export default function StudentSearchInput({ value, onChange, placeholder }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setFiltered(students.slice(0, 10));
    } else {
      const lower = query.toLowerCase();
      const filtered = students
        .filter(s => 
          s.name?.toLowerCase().includes(lower) || 
          s.studentId?.toLowerCase().includes(lower)
        )
        .slice(0, 10);
      setFiltered(filtered);
    }
  }, [query, students]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
      setFiltered(data.slice(0, 10));
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (student) => {
    setQuery(student.name);
    onChange(student);
    setShowDropdown(false);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setFiltered(students.slice(0, 10));
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    setShowDropdown(true);
    setIsOpen(true);
  };

  const selectedStudent = value;

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-10" />
        <div className="relative flex items-center">
          <div className="absolute left-3 z-10">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onClick={handleInputClick}
            placeholder={placeholder || t('reports.searchStudent')}
            className="w-full pl-11 pr-10 py-3 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 shadow-sm hover:shadow-md transition-all duration-300"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className={`
            absolute z-50 w-full mt-2 
            bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl shadow-gray-900/10
            max-h-80 overflow-y-auto
            transition-all duration-300 ease-out
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
          `}
          style={{ backdropFilter: 'blur(16px)' }}
        >
          {filtered.length > 0 ? (
            <div className="p-2">
              {filtered.map((student, index) => {
                const isSelected = selectedStudent?.id === student.id;
                const classGradient = getClassGradient(student.class);
                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelect(student)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-300 ease-out
                      ${isSelected 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 border-l-4 border-l-green-500 shadow-sm' 
                        : 'hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-fuchsia-50/30 hover:shadow-sm hover:scale-[1.02] border border-transparent hover:border-violet-200/50'
                      }
                    `}
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translateX(0)' : 'translateX(-10px)'
                    }}
                  >
                    <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                      <StudentAvatar name={student.name} cls={student.class} size="md" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`font-semibold truncate transition-colors ${isSelected ? 'text-green-800' : 'text-gray-900 hover:text-violet-700'}`}>
                        {student.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${classGradient} text-white shadow-sm`}>
                          {student.class}
                        </span>
                        <span className="text-xs text-gray-400">ID: {student.studentId}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">{t('reports.noResults')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
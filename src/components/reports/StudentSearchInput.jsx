import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, User, X } from 'lucide-react';
import { getAllStudents } from '../../firebase/reports';

export default function StudentSearchInput({ value, onChange, placeholder }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
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
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setFiltered(students.slice(0, 10));
    inputRef.current?.focus();
  };

  const selectedStudent = value;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder || t('reports.searchStudent')}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {showDropdown && filtered.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {filtered.map((student) => (
            <button
              key={student.id}
              onClick={() => handleSelect(student)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {student.name?.[0]?.toUpperCase() || 'S'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                <p className="text-xs text-gray-500">
                  {student.class} • ID: {student.studentId}
                </p>
              </div>
              {selectedStudent?.id === student.id && (
                <span className="text-xs text-primary font-medium">Selected</span>
              )}
            </button>
          ))}
        </div>
      )}

      {showDropdown && query && filtered.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500">{t('reports.noResults')}</p>
        </div>
      )}
    </div>
  );
}
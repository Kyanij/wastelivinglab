import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { searchStudentsByName } from '../../firebase/students';
import { Loader2 } from 'lucide-react';

export default function StudentSearchBar({ onSelectStudent }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        const students = await searchStudentsByName(query);
        setResults(students);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (student) => {
    setSelectedStudent(student);
    setQuery(student.name);
    setShowDropdown(false);
    onSelectStudent(student);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setSelectedStudent(null);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={t('portal.searchStudent')}
          className="w-full px-4 py-3 pl-10 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showDropdown && results.length > 0 && !selectedStudent && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((student) => (
            <button
              key={student.id}
              onClick={() => handleSelect(student)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
            >
              <span className="font-medium text-gray-800">{student.name}</span>
              <span className="text-xs text-gray-500">{student.class} - {student.studentId}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
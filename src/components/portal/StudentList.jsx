import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getStudents } from '../../firebase/students';
import StudentCard from './StudentCard';
import { Loader2 } from 'lucide-react';

export default function StudentList({ selectedStudentId, onSelectStudent }) {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const observerRef = useRef(null);

  const PAGE_SIZE = 20;

  const fetchStudents = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setStudents([]);
      setLastVisible(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await getStudents(PAGE_SIZE, reset ? null : lastVisible);
      const newStudents = result.students || [];
      
      if (reset) {
        setStudents(newStudents);
      } else {
        setStudents(prev => [...prev, ...newStudents]);
      }
      
      setLastVisible(result.lastVisible || null);
      setHasMore(result.hasMore || false);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastVisible]);

  useEffect(() => {
    fetchStudents(true);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchStudents(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  const filteredStudents = searchQuery.trim()
    ? students.filter(s => 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.class?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          {t('portal.students')}
        </h2>
        <div className="relative group">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('portal.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-green-400 focus:bg-white outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{t('portal.noStudentsFound')}</p>
          </div>
        ) : (
          <>
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                isActive={selectedStudentId === student.id}
                onClick={() => onSelectStudent(student)}
              />
            ))}
            
            {hasMore && !searchQuery && (
              <div ref={observerRef} className="py-4 flex justify-center">
                {loadingMore && (
                  <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
        {filteredStudents.length} {filteredStudents.length === 1 ? t('portal.student') : t('portal.students')} {t('common.found')}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StudentList from '../components/portal/StudentList';
import StudentDetailReport from '../components/portal/StudentDetailReport';
import PortalEmptyState from '../components/portal/PortalEmptyState';
import LanguageToggle from '../components/layout/LanguageToggle';
import { Menu, X } from 'lucide-react';

export default function PublicPortal() {
  const { t } = useTranslation();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white shadow-2xl relative z-30">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-lg">Green Champs</h1>
              <p className="text-green-300 text-xs hidden sm:block">Student Waste Tracker — Public Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-60px)] overflow-hidden">
        {/* Left Sidebar - Student List */}
        <aside 
          className={`
            ${isMobile 
              ? `fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
              : 'w-80 relative'
            }
            bg-white border-r border-gray-200 flex flex-col shadow-lg
          `}
        >
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className="flex-1 overflow-hidden">
            <StudentList 
              selectedStudentId={selectedStudent?.id}
              onSelectStudent={handleSelectStudent}
            />
          </div>
        </aside>

        {/* Main Content - Student Detail Report */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-green-50/30 relative">
          {/* Ambient Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-100/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 p-6 max-w-5xl mx-auto">
            {selectedStudent ? (
              <StudentDetailReport student={selectedStudent} />
            ) : (
              <PortalEmptyState />
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-4 text-center text-green-600 text-xs">
        <p>Together we create a cleaner tomorrow.</p>
      </footer>
    </div>
  );
}
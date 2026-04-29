import { useState, useEffect } from 'react';
import { getEntriesByStudentAndDateRange } from '../firebase/wasteEntries';
import { calculateSummary } from '../utils/portalHelpers';
import StudentSearchBar from '../components/portal/StudentSearchBar';
import StudentInfoCard from '../components/portal/StudentInfoCard';
import DateRangeFilter from '../components/portal/DateRangeFilter';
import CollectionSummaryCards from '../components/portal/CollectionSummaryCards';
import DetailedReportTable from '../components/portal/DetailedReportTable';
import PortalSummaryBar from '../components/portal/PortalSummaryBar';

export default function PublicPortal() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    'Plastic': { quantity: 0, earned: 0 },
    'Paper': { quantity: 0, earned: 0 },
    'Metal': { quantity: 0, earned: 0 },
    'E-Waste': { quantity: 0, earned: 0 }
  });

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setEntries([]);
  };

  const handleApplyDateRange = async (fromDate, toDate) => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      const data = await getEntriesByStudentAndDateRange(selectedStudent.id, fromDate, toDate);
      setEntries(data);
      setSummary(calculateSummary(data));
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
    setLoading(false);
  };

  const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3c2e] to-[#0f1f14]">
      {/* Header / Brand Bar */}
      <header className="bg-[#1a3c2e] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">G</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Green Champs</h1>
            <p className="text-green-300 text-xs">Student Waste Tracker — Public Portal</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="flex justify-center">
          <StudentSearchBar onSelectStudent={handleSelectStudent} />
        </div>

        {/* Empty State */}
        {!selectedStudent && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Search for a Student</h2>
            <p className="text-green-200 text-sm">
              Enter a student name, class, or ID to view their waste collection report
            </p>
          </div>
        )}

        {/* Student Info Card */}
        {selectedStudent && (
          <StudentInfoCard student={selectedStudent} />
        )}

        {/* Date Range Filter */}
        {selectedStudent && (
          <DateRangeFilter onApply={handleApplyDateRange} />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Collection Summary Cards */}
        {!loading && selectedStudent && entries.length > 0 && (
          <CollectionSummaryCards summary={summary} />
        )}

        {/* Detailed Report Table */}
        {!loading && selectedStudent && entries.length > 0 && (
          <DetailedReportTable entries={entries} />
        )}

        {/* No Entries State */}
        {!loading && selectedStudent && entries.length === 0 && (
          <div className="p-8 text-center text-gray-400 bg-white/5 rounded-xl border border-white/10">
            <p>Select a date range and click Apply to view waste entries.</p>
          </div>
        )}

        {/* Bottom Summary Bar */}
        {!loading && entries.length > 0 && (
          <PortalSummaryBar totalWeight={totalWeight} totalEarnings={totalEarnings} />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-6 text-center text-green-300 text-xs">
        <p>Together we create a cleaner tomorrow.</p>
      </footer>
    </div>
  );
}
import { useState, useEffect, useMemo } from 'react';
import { getEntriesByStudentAndDateRange } from '../../firebase/wasteEntries';
import { calculateSummary, formatKg, formatCurrency, WASTE_TYPE_CONFIG, groupEntriesByDate } from '../../utils/portalHelpers';
import { Loader2 } from 'lucide-react';
import PortalDateGroupRow from './PortalDateGroupRow';

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-indigo-100 text-indigo-700',
];

function getAvatarColor(name) {
  const index = name?.charCodeAt(0) || 0;
  return avatarColors[index % avatarColors.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function StudentDetailReport({ student }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState('');
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    setDateFrom(lastYear.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
    setHasApplied(false);
    setEntries([]);
  }, [student]);

  const handleApplyDateFilter = async () => {
    if (!dateFrom || !dateTo) {
      setError('Please select both dates');
      return;
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      setError('Start date must be before end date');
      return;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (new Date(dateTo) > today) {
      setError('End date cannot be in the future');
      return;
    }

    setError('');
    setLoading(true);
    setExpandedDates({});
    setHasApplied(true);
    try {
      const data = await getEntriesByStudentAndDateRange(student.id, dateFrom, dateTo);
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
    setLoading(false);
  };

  const dateGroups = useMemo(() => groupEntriesByDate(entries), [entries]);
  const summary = calculateSummary(entries);
  const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);

  const colorClass = getAvatarColor(student.name);

  const toggleDateExpansion = (dateKey) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const isDateExpanded = (dateKey) => !!expandedDates[dateKey];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>

      {/* Student Header */}
      <div className="flex items-center gap-5 animate-fade-in">
        <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center font-bold text-2xl shadow-md`}>
          {getInitials(student.name)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{student.name}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {student.class}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              {student.rollNo}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {entries.length} collections
            </span>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Date Range</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-600 mb-2">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-white text-gray-700 outline-none text-sm focus:border-green-400 transition-all"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-600 mb-2">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-white text-gray-700 outline-none text-sm focus:border-green-400 transition-all"
            />
          </div>
          <button
            onClick={handleApplyDateFilter}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Apply
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </div>

      {/* Collection Summary */}
      {hasApplied && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Collection Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WASTE_TYPE_CONFIG.map((type) => {
              const data = summary[type.name] || { quantity: 0, earned: 0 };
              return (
                <div
                  key={type.name}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-xs font-medium text-gray-600 uppercase">{type.name}</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: type.color }}>
                    {formatKg(data.quantity)}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Earned: {formatCurrency(data.earned)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Report - Expandable by Date */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-white to-green-50/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Detailed Report</h3>
        </div>

        {!hasApplied ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Select Date Range</h4>
            <p className="text-gray-400 text-sm">Choose a date range above and click Apply to view collections</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No Data</h4>
            <p className="text-gray-400 text-sm">No collections found for this date range</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="w-[8%]"></div>
                <div className="w-[22%]">Date</div>
                <div className="w-[20%] text-right">Total Weight</div>
                <div className="w-[20%] text-right">Total Earnings</div>
                <div className="w-[20%]">Entries</div>
                <div className="w-[10%]"></div>
              </div>
            </div>

            {/* Date Group Rows */}
            <div>
              {dateGroups.map((dateGroup) => (
                <PortalDateGroupRow
                  key={dateGroup.dateKey}
                  dateGroup={dateGroup}
                  isExpanded={isDateExpanded(dateGroup.dateKey)}
                  onToggle={() => toggleDateExpansion(dateGroup.dateKey)}
                />
              ))}
            </div>

            {/* Grand Total */}
            <div className="bg-gradient-to-r from-green-50 to-green-100/50 border-t border-green-200 px-5 py-4">
              <div className="flex items-center">
                <div className="w-[8%]"></div>
                <div className="w-[22%]">
                  <span className="text-base font-bold text-gray-800">Total</span>
                </div>
                <div className="w-[20%] text-right">
                  <span className="text-base font-bold text-gray-800">
                    {totalWeight.toFixed(2)} <span className="text-gray-400 text-sm">kg</span>
                  </span>
                </div>
                <div className="w-[20%] text-right">
                  <span className="text-base font-bold text-green-600">
                    {formatCurrency(totalEarnings)}
                  </span>
                </div>
                <div className="w-[20%]"></div>
                <div className="w-[10%]"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
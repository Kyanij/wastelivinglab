import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { getEntriesByStudentAndDateRange } from '../../firebase/wasteEntries';
import { groupEntriesByDate } from '../../hooks/studentDetail/useStudentDetail';
import EnhancedDateRangePicker from '../../components/reports/EnhancedDateRangePicker';
import PortalDateGroupRow from './PortalDateGroupRow';

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  if (!name) return 'bg-gray-500';
  const colors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatKg(kg) {
  if (kg === 0) return '0 kg';
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`;
  return `${kg.toFixed(1)} kg`;
}

function formatCurrency(amount) {
  if (amount === 0) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PortalEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('portal.noStudentsFound')}</h3>
      <p className="text-gray-500 text-sm">{t('reports.selectStudent')}</p>
    </div>
  );
}

export default function StudentDetailReport({ student }) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: firstDayOfMonth, to: today };
  });
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    if (!student) return;
    
    const fetchData = async () => {
      setLoading(true);
      setExpandedDates({});
      try {
        const fromDate = dateRange.from.toLocaleDateString('en-CA');
        const toDate = dateRange.to.toLocaleDateString('en-CA');
        const data = await getEntriesByStudentAndDateRange(student.id, fromDate, toDate);
        setEntries(data);
      } catch (error) {
        // Silent fail
      }
      setLoading(false);
    };
    
    fetchData();
  }, [dateRange.from, dateRange.to, student]);

  const handleDateRangeChange = (from, to) => {
    setDateRange({ from, to });
  };

  const dateGroups = useMemo(() => groupEntriesByDate(entries), [entries]);
  const summary = useMemo(() => {
    const typeMap = {
      'Plastic Bottles': 'Plastic',
      'Plastic': 'Plastic',
      'Paper Waste': 'Paper',
      'Paper': 'Paper',
      'Glass': 'Glass',
      'Cans': 'Metal',
      'Metal': 'Metal',
      'E-Waste': 'E-Waste'
    };
    
    const uniqueTypes = {};
    const summaries = {};
    
    entries.forEach((entry) => {
      const rawType = entry.wasteTypeName || entry.wasteType || 'Other';
      const type = typeMap[rawType] || rawType;
      
      uniqueTypes[type] = true;
      if (!summaries[type]) {
        summaries[type] = { quantity: 0, earned: 0 };
      }
      summaries[type].quantity += entry.weight || 0;
      summaries[type].earned += entry.amount || 0;
    });
    
    return { types: Object.keys(uniqueTypes), summaries };
  }, [entries]);
  const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
  const totalEarnings = entries.reduce((sum, e) => sum + (e.amount || 0), 0);

  if (!student) {
    return <PortalEmptyState />;
  }

  const colorClass = getAvatarColor(student.name || '');

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
              {student.studentId}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {entries.length} {t('portal.collections')}
              <span className="text-gray-400 text-xs ml-1">
                ({dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('portal.dateRange')}</h3>
        <EnhancedDateRangePicker
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          reportType="portal"
          pdfData={{
            student: {
              ...student,
              totalWaste: student?.totalWaste || 0,
              totalEarnings: student?.totalEarnings || 0,
              totalEntries: entries.length,
              avgPerEntry: entries.length > 0 ? (student?.totalWaste || 0) / entries.length : 0
            },
            entries
          }}
          filters={{ dateFrom: dateRange.from.toISOString(), dateTo: dateRange.to.toISOString() }}
        />
      </div>

      {/* Collection Summary */}
      {!loading && entries.length > 0 && summary.types.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('portal.collectionSummary')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.types.map((type) => {
              const data = summary.summaries[type] || { quantity: 0, earned: 0 };
              const typeColors = {
                'Plastic': '#2563eb',
                'Paper': '#ea580c',
                'Metal': '#dc2626',
                'E-Waste': '#16a34a',
                'Glass': '#0891b2',
                'Other': '#6b7280'
              };
              const typeIcons = {
                'Plastic': '🧴',
                'Paper': '📄',
                'Metal': '🥫',
                'E-Waste': '🖥️',
                'Glass': '🫙',
                'Other': '📦'
              };
              return (
                <div
                  key={type}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{typeIcons[type] || '📦'}</span>
                    <span className="text-xs font-medium text-gray-600 uppercase">{type}</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: typeColors[type] || '#6b7280' }}>
                    {formatKg(data.quantity)}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {t('portal.earned')} {formatCurrency(data.earned)}
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
          <h3 className="text-lg font-semibold text-gray-800">{t('portal.detailedReport')}</h3>
        </div>

        {loading ? (
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
            <h4 className="text-lg font-semibold text-gray-600 mb-2">{t('portal.noData')}</h4>
            <p className="text-gray-400 text-sm">{t('portal.noCollectionsFound')}</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="w-[8%]"></div>
                <div className="w-[22%]">{t('portal.date')}</div>
                <div className="w-[20%] text-right">{t('portal.totalWeight')}</div>
                <div className="w-[20%] text-right">{t('portal.totalEarnings')}</div>
                <div className="w-[20%]">{t('portal.entries')}</div>
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
                  <span className="text-base font-bold text-gray-800">{t('portal.total')}</span>
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
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, DollarSign, FileText, BarChart3, ChevronDown, ChevronRight, Award, Calendar } from 'lucide-react';

import PageHeader from '../../components/reports/PageHeader';
import ExportPDFButton from '../../components/reports/ExportPDFButton';
import StudentSearchInput from '../../components/reports/StudentSearchInput';
import { formatDateShort } from '../../utils/dateHelpers';
import EnhancedDateRangePicker from '../../components/reports/EnhancedDateRangePicker';
import { useReportFilters, formatComparisonPeriod } from '../../hooks/reports/useReportFilters';
import { getStudentReportData, getAllClasses, getAllWasteTypes } from '../../firebase/reports';

import WasteTrendChart from '../../components/dashboard/WasteTrendChart';
import WasteDistributionChart from '../../components/dashboard/WasteDistributionChart';

export default function StudentReport() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});
  
  const { 
    dateRange, 
    comparisonRange,
    selectedClass, 
    selectedWasteType,
    updateDateRange, 
    updateClass, 
    updateWasteType,
  } = useReportFilters();

  const loadData = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const studentData = await getStudentReportData(studentId, dateRange, comparisonRange);
      setData(studentData);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent?.id) {
      loadData(selectedStudent.id);
    }
  }, [dateRange, selectedStudent]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    if (student) {
      loadData(student.id);
    } else {
      setData(null);
    }
  };

  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const stats = data ? [
    { 
      icon: Trash2, 
      label: t('reports.totalWaste'), 
      value: data.kpis?.totalWaste?.value || 0, 
      change: data.kpis?.totalWaste?.change || 0,
      suffix: ' kg' 
    },
    { 
      icon: DollarSign, 
      label: t('reports.totalEarnings'), 
      value: data.kpis?.totalEarnings?.value || 0, 
      change: data.kpis?.totalEarnings?.change || 0,
      prefix: 'Rp',
      isCurrency: true
    },
    { 
      icon: FileText, 
      label: t('reports.totalEntries'), 
      value: data.kpis?.totalEntries?.value || 0, 
      change: data.kpis?.totalEntries?.change || 0 
    },
    { 
      icon: BarChart3, 
      label: t('reports.avgPerEntry'), 
      value: data.kpis?.avgPerEntry?.value || 0, 
      change: data.kpis?.avgPerEntry?.change || 0,
      suffix: ' kg' 
    },
  ] : [];

  // Flatten entries for PDF export
  const flattenEntriesForPDF = () => {
    if (!data?.entries) return [];
    const flatEntries = [];
    data.entries.forEach((entry) => {
      entry.items.forEach((item) => {
        flatEntries.push({
          date: entry.date,
          wasteTypeName: item.wasteTypeName || 'Unknown',
          weight: item.weight || 0,
          rate: item.rate || 0,
          amount: item.amount || 0,
        });
      });
    });
    return flatEntries;
  };

  // Prepare PDF data structure
  const pdfData = data ? {
    student: data.student,
    entries: flattenEntriesForPDF(),
    totalWaste: data.kpis?.totalWaste?.value || 0,
    totalEarnings: data.kpis?.totalEarnings?.value || 0,
    totalEntries: data.kpis?.totalEntries?.value || 0,
    avgPerEntry: data.kpis?.avgPerEntry?.value || 0,
  } : null;

  const filters = {
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports.student')}
        description={t('reports.studentDesc')}
        dateRange={dateRange}
        onDateRangeChange={updateDateRange}
        reportType={selectedStudent ? 'student' : undefined}
        pdfData={pdfData}
        selectedClass={selectedClass}
        selectedWasteType={selectedWasteType}
      />

      {/* Student Search - Always Visible */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">
              {t('wasteEntry.selectStudent')}
            </label>
            <p className="text-xs text-gray-500">{t('reports.searchStudent')}</p>
          </div>
        </div>
        <StudentSearchInput 
          value={selectedStudent}
          onChange={handleStudentSelect}
        />
      </div>

      {/* Date Range Picker - Only visible after student selected */}
      {selectedStudent && (
        <EnhancedDateRangePicker
          dateRange={dateRange}
          onDateRangeChange={updateDateRange}
          onRefresh={() => selectedStudent?.id && loadData(selectedStudent.id)}
          reportType="student"
          pdfData={pdfData}
          filters={filters}
        />
      )}

      {!selectedStudent ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">{t('reports.selectStudent')}</p>
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Student Profile Card */}
          <StudentProfileCard student={data.student} />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} loading={loading} comparisonRange={comparisonRange} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WasteTrendChart 
              dailyData={data.charts?.trend || []}
              isLoading={loading}
            />
            <WasteDistributionChart 
              data={data.charts?.typeDistribution || []}
              isLoading={loading}
            />
          </div>

          {/* Entries Table with Expandable Rows */}
          <EntriesTable 
            entries={data.entries || []} 
            expandedDates={expandedDates}
            toggleDate={toggleDate}
          />

          {/* Highlights Panel */}
          <HighlightsPanel 
            rank={data.rank}
            totalStudents={data.totalStudents}
            comparisonToAvg={data.comparisonToAvg}
          />
        </>
      ) : null}
    </div>
  );
}

function StudentProfileCard({ student }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {student.name?.[0]?.toUpperCase() || 'S'}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
            <span className="px-2 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
              {student.class}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{t('common.studentIdLabel')} {student.studentId}</span>
            <span>•</span>
            <span>{t('common.joinedOn', { date: student.createdAt ? formatDateShort(student.createdAt) : 'N/A' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, suffix = '', prefix = '', isCurrency = false, loading, comparisonRange }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-gray-100 mb-4" />
          <div className="h-8 w-24 bg-gray-100 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const isPositive = change >= 0;
  const displayValue = isCurrency 
    ? typeof value === 'number' ? value.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '0.00'
    : typeof value === 'number' ? value.toFixed(2) : '0.00';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-emerald-100">
          <Icon className="w-5 h-5 text-emerald-600" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            <span>{isPositive ? '↑' : '↓'}</span>
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {prefix}{displayValue}{suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {comparisonRange && (
        <div className="text-xs text-gray-400 mt-1">
          {formatComparisonPeriod(comparisonRange.from, comparisonRange.to)}
        </div>
      )}
    </div>
  );
}

function EntriesTable({ entries, expandedDates, toggleDate }) {
  const { t } = useTranslation();

  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.totalEntries')}</h3>
        <p className="text-gray-400 text-center py-8">{t('reports.noData')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.totalEntries')}</h3>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.date} className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleDate(entry.date)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedDates[entry.date] ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium text-gray-900">
                  {formatDateShort(entry.date)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">
                  {entry.items.length} {t('reports.totalEntries').toLowerCase()}
                </span>
                <span className="font-semibold text-gray-900">
                  {entry.totalWeight.toFixed(2)} kg
                </span>
                <span className="font-semibold text-green-600">
                  Rp{entry.totalAmount.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </button>
            
            {expandedDates[entry.date] && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase">
                      <th className="text-left py-2">{t('reports.wasteType')}</th>
                      <th className="text-right py-2">{t('reports.weight')}</th>
                      <th className="text-right py-2">{t('reports.rate')}</th>
                      <th className="text-right py-2">{t('reports.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="py-2 text-sm font-medium text-gray-900">{item.wasteTypeName || 'Unknown'}</td>
                        <td className="py-2 text-sm text-gray-600 text-right">{item.weight?.toFixed(2)} kg</td>
                        <td className="py-2 text-sm text-gray-600 text-right">Rp{item.rate?.toFixed(2)}</td>
                        <td className="py-2 text-sm font-semibold text-gray-900 text-right">
                          Rp{item.amount?.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightsPanel({ rank, totalStudents, comparisonToAvg }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1A6B3C] to-[#2E8B57] p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🏆</span>
        <h3 className="text-lg font-semibold">{t('reports.insights')}</h3>
      </div>
      <ul className="space-y-3">
        <li className="flex items-center gap-2 text-white/90">
          <Award className="w-5 h-5 text-yellow-300" />
          <span>{t('reports.youAreInTop', { rank })}</span>
        </li>
        <li className="flex items-center gap-2 text-white/90">
          <span>💚</span>
          <span>{t('reports.youCollected', { percent: Math.abs(comparisonToAvg).toFixed(1) })}</span>
        </li>
        <li className="flex items-center gap-2 text-white/90">
          <span>🌱</span>
          <span>{t('reports.keepItUp')}</span>
        </li>
      </ul>
    </div>
  );
}
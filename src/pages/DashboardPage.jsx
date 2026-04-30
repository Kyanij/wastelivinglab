import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Leaf, Wallet, Users, BarChart2, Trophy,
} from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';
import StatCard from '../components/dashboard/StatCard';
import EnhancedDateRangePicker from '../components/reports/EnhancedDateRangePicker';
import WasteTrendChart from '../components/dashboard/WasteTrendChart';
import WasteDistributionChart from '../components/dashboard/WasteDistributionChart';
import ClassPerformanceChart from '../components/dashboard/ClassPerformanceChart';
import TopStudentsLeaderboard from '../components/dashboard/TopStudentsLeaderboard';
import RecentActivity from '../components/dashboard/RecentActivity';
import Insights from '../components/dashboard/Insights';
import { useDashboard } from '../hooks/dashboard/useDashboard';
import { useWasteTypes } from '../hooks/useWasteTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const today = new Date();
  const defaultDateRange = { from: startOfMonth(today), to: today };
  
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    studentClass: 'all',
    wasteType: 'all',
  });

  const { wasteTypes } = useWasteTypes();
  const {
    loading,
    kpis,
    wasteByType,
    wasteByClass,
    wasteTrendData,
    weeklyTrendData,
    monthlyTrendData,
    topStudents,
    recentActivity,
    uniqueClasses,
  } = useDashboard(filters);

  const handleDateRangeChange = (from, to) => {
    setDateRange({ from, to });
    setFilters(prev => ({ ...prev, dateFrom: from, dateTo: to }));
  };

  const handleClassChange = (value) => {
    setFilters(prev => ({ ...prev, studentClass: value }));
  };

  const handleWasteTypeChange = (value) => {
    setFilters(prev => ({ ...prev, wasteType: value }));
  };

  const handleResetFilters = () => {
    const today = new Date();
    const defaultRange = { from: startOfMonth(today), to: today };
    setDateRange(defaultRange);
    setFilters({
      dateFrom: defaultRange.from,
      dateTo: defaultRange.to,
      studentClass: 'all',
      wasteType: 'all',
    });
  };

  const hasActiveFilters = useMemo(() => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = today;
    
    const isDefaultDateRange = 
      dateRange.from?.getTime() === currentMonthStart.getTime() && 
      dateRange.to?.getTime() === currentMonthEnd.getTime();
    
    return filters.studentClass !== 'all' || filters.wasteType !== 'all' || !isDefaultDateRange;
  }, [filters, dateRange]);

  // Calculate insights data
  const totalWaste = wasteByType.reduce((sum, d) => sum + d.value, 0);
  const topClass = wasteByClass[0]?.name || '';
  const topClassTotal = wasteByClass[0]?.value || 0;
  const topClassPercent = topClassTotal > 0 && totalWaste > 0 ? (topClassTotal / totalWaste) * 100 : 0;
  const topWasteType = wasteByType[0]?.name || '';
  const topWasteTypeTotal = wasteByType[0]?.value || 0;
  const topWasteTypePercent = topWasteTypeTotal > 0 && totalWaste > 0 ? (topWasteTypeTotal / totalWaste) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waste Management Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of waste collected by students</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <EnhancedDateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
          
          <div className="hidden lg:block w-px h-8 bg-gray-200" />
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filters.studentClass} onValueChange={handleClassChange}>
              <SelectTrigger className="w-[130px] md:w-[140px] h-10">
                <SelectValue placeholder={t('students.allClasses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('students.allClasses')}</SelectItem>
                {uniqueClasses.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.wasteType} onValueChange={handleWasteTypeChange}>
              <SelectTrigger className="w-[130px] md:w-[160px] h-10">
                <SelectValue placeholder="All Waste Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Waste Types</SelectItem>
                {wasteTypes.map(wt => (
                  <SelectItem key={wt.id} value={wt.name}>{wt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters} 
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('common.reset')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard
          icon={Leaf}
          label="Total Waste (kg)"
          value={kpis.totalWaste}
          trend={kpis.trends.waste}
          suffix=" kg"
          isLoading={loading}
        />
        <StatCard
          icon={Wallet}
          label="Total Earnings"
          value={kpis.totalEarnings}
          trend={kpis.trends.earnings}
          prefix="Rp "
          isLoading={loading}
        />
        <StatCard
          icon={Users}
          label="Active Students"
          value={kpis.activeStudents}
          trend={kpis.trends.active}
          isLoading={loading}
        />
        <StatCard
          icon={BarChart2}
          label="Avg per Student"
          value={kpis.avgWastePerStudent}
          trend={kpis.trends.avg}
          suffix=" kg"
          isLoading={loading}
        />
        <StatCard
          icon={Trophy}
          label="Top Performer"
          value={kpis.topPerformer?.name || '-'}
          isText={true}
          isLoading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <WasteTrendChart
          dailyData={wasteTrendData}
          weeklyData={weeklyTrendData}
          monthlyData={monthlyTrendData}
          isLoading={loading}
        />
        <WasteDistributionChart
          data={wasteByType}
          isLoading={loading}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ClassPerformanceChart
          data={wasteByClass}
          isLoading={loading}
        />
        <TopStudentsLeaderboard
          students={topStudents}
          isLoading={loading}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity
        activities={recentActivity}
        isLoading={loading}
      />

      {/* Insights */}
        <Insights
          wasteTrend={kpis.trends.waste}
          topClass={topClass}
          topClassPercent={topClassPercent}
          topWasteType={topWasteType}
          topWasteTypePercent={topWasteTypePercent}
          isLoading={loading}
        />
    </div>
  );
}
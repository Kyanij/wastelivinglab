import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Leaf, Wallet, Users, BarChart2, Trophy,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import FilterBar from '../components/dashboard/FilterBar';
import WasteTrendChart from '../components/dashboard/WasteTrendChart';
import WasteDistributionChart from '../components/dashboard/WasteDistributionChart';
import ClassPerformanceChart from '../components/dashboard/ClassPerformanceChart';
import TopStudentsLeaderboard from '../components/dashboard/TopStudentsLeaderboard';
import RecentActivity from '../components/dashboard/RecentActivity';
import Insights from '../components/dashboard/Insights';
import { useDashboard } from '../hooks/dashboard/useDashboard';
import { useWasteTypes } from '../hooks/useWasteTypes';

export default function DashboardPage() {
  const { t } = useTranslation();
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
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        classes={uniqueClasses}
        wasteTypes={wasteTypes}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
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
      <div className="grid grid-cols-2 gap-6">
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
      <div className="grid grid-cols-2 gap-6">
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
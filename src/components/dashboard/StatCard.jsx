import { TrendingUp, TrendingDown } from 'lucide-react';

const cardColors = {
  'Total Waste (kg)': { bg: 'bg-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-600' },
  'Total Earnings': { bg: 'bg-amber-100', icon: 'text-amber-600', text: 'text-amber-600' },
  'Active Students': { bg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-600' },
  'Avg per Student': { bg: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-600' },
  'Top Performer': { bg: 'bg-rose-100', icon: 'text-rose-600', text: 'text-rose-600' },
};

export default function StatCard({ icon: Icon, label, value, trend, suffix = '', prefix = '', isText = false, isLoading = false }) {
  const colors = cardColors[label] || { bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-600' };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 md:p-5">
        <div className="animate-pulse">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gray-100 mb-3 md:mb-4" />
          <div className="h-6 md:h-8 w-16 md:w-24 bg-gray-100 rounded mb-1 md:mb-2" />
          <div className="h-3 md:h-4 w-24 md:w-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white shadow-sm p-4 md:p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-2 rounded-lg md:rounded-xl ${colors.bg}`}>
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${colors.icon}`} />
        </div>
        {trend !== undefined && !isText && (
          <div className={`flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-emerald-50 text-emerald-600' :
            isNegative ? 'bg-red-50 text-red-600' :
            'bg-gray-50 text-gray-600'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : null}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{prefix}{typeof value === 'number' ? value.toFixed(2) : value}{suffix}</div>
      <div className="text-xs md:text-sm text-gray-500">{label}</div>
    </div>
  );
}
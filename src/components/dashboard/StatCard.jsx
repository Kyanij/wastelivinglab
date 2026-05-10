import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber } from '../../utils/portalHelpers';

const kpiColors = {
  waste: { 
    gradient: 'from-blue-500 to-blue-700'
  },
  earnings: { 
    gradient: 'from-emerald-500 to-teal-500'
  },
  students: { 
    gradient: 'from-amber-500 to-orange-500'
  },
  entries: { 
    gradient: 'from-pink-500 via-purple-500 to-indigo-500'
  },
  average: { 
    gradient: 'from-cyan-500 to-blue-500'
  },
  top: { 
    gradient: 'from-rose-500 to-pink-500'
  },
};

function getKPIColor(label) {
  if (!label) return kpiColors.waste;
  const lowerLabel = label.toLowerCase();
  
  if (/waste|berat|sampah|total waste|weight|jumlah sampah|total berat/i.test(lowerLabel)) {
    return kpiColors.waste;
  }
  
  if (/earning|pendapatan|uang|total earnings|money|jumlah pendapatan/i.test(lowerLabel)) {
    return kpiColors.earnings;
  }
  
  if (/student|siswa|people|active students|jumlah siswa/i.test(lowerLabel)) {
    return kpiColors.students;
  }
  
  if (/entry|entri|count|jumlah|total entries|jumlah entri/i.test(lowerLabel)) {
    return kpiColors.entries;
  }
  
  if (/avg|rata|average|per entry|rata-rata/i.test(lowerLabel)) {
    return kpiColors.average;
  }
  
  if (/top|rank|peringkat|performer|class|peringkat/i.test(lowerLabel)) {
    return kpiColors.top;
  }
  
  return kpiColors.waste;
}

export default function StatCard({ icon: Icon, label, value, trend, suffix = '', prefix = '', isText = false, isLoading = false }) {
  const { t } = useTranslation();
  const colors = getKPIColor(label);

  if (isLoading) {
    return (
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-2xl bg-gray-200 mb-4" />
          <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className="glass-card p-5 relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-default">
      {/* Gradient tint matching icon color */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {trend !== undefined && !isText && (
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-emerald-50 text-emerald-600' :
            isNegative ? 'bg-red-50 text-red-600' :
            'bg-gray-50 text-gray-600'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : null}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {prefix}{typeof value === 'number' ? formatNumber(value) : value}{suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

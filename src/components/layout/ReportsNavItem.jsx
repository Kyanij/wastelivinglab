import { NavLink, useLocation } from 'react-router-dom';
import { FileBarChart, ChevronDown, ChevronRight, LayoutDashboard, Users, TrendingUp, GraduationCap, BarChart3, Recycle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const reportsSubItems = [
  { to: '/reports/overview', label: 'nav.overviewReport', icon: LayoutDashboard },
  { to: '/reports/student', label: 'nav.studentReport', icon: Users },
  { to: '/reports/class', label: 'nav.classReport', icon: GraduationCap },
  { to: '/reports/waste-analysis', label: 'nav.wasteAnalysis', icon: BarChart3 },
];

export default function ReportsNavItem() {
  const location = useLocation();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const isReportsRoute = location.pathname.startsWith('/reports');
  const isActive = location.pathname === '/reports' || isReportsRoute;

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        <FileBarChart className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium flex-1 text-left">{t('nav.reports')}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 opacity-50" />
        ) : (
          <ChevronRight className="w-4 h-4 opacity-50" />
        )}
      </button>

      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {reportsSubItems.map((item) => {
            const Icon = item.icon;
            const isSubActive = location.pathname === item.to;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                  isSubActive
                    ? 'bg-primary/20 text-primary-light font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{t(item.label)}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
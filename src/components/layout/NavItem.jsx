import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium">{label}</span>
      {({ isActive }) => isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </NavLink>
  );
}
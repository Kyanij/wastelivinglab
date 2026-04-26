import { LayoutDashboard, Users, Package, Recycle, FileBarChart, Settings, Leaf } from 'lucide-react';
import NavItem from './NavItem';
import LogoutButton from '../auth/LogoutButton';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/waste-entries', icon: Package, label: 'Waste Entries' },
    { to: '/waste-types', icon: Recycle, label: 'Waste Types' },
    { to: '/reports', icon: FileBarChart, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 glass border-r border-white/10 flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/40">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Green Champs</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-light">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
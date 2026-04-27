import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import LanguageToggle from './LanguageToggle';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <LanguageToggle />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
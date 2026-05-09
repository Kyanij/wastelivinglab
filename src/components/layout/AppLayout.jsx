import { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import LanguageToggle from './LanguageToggle';
import { Menu } from 'lucide-react';

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

export default function AppLayout({ title, subtitle }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <MenuContext.Provider value={{ isMenuOpen, toggleMenu, closeMenu }}>
      <div className="flex min-h-screen">
        <Sidebar />
        
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMenu}
          />
        )}
        
        <main className="flex-1 lg:ml-60 min-h-screen overflow-x-hidden">
          {/* Desktop Header - Deep Forest Green Gradient */}
          <div className="hidden lg:block bg-gradient-to-r from-green-900 to-emerald-800 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
              </div>
              <LanguageToggle />
            </div>
          </div>

          {/* Mobile Header - Deep Forest Green Gradient, Sticky */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-900 to-emerald-800 sticky top-0 z-30">
            <h1 className="text-lg font-bold text-white">{title}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
              <LanguageToggle />
            </div>
          </div>

          <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 pb-8">
            <div className="max-w-[1400px] mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </MenuContext.Provider>
  );
}

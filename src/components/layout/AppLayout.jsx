import { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import LanguageToggle from './LanguageToggle';
import { Menu, X } from 'lucide-react';

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

export default function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <MenuContext.Provider value={{ isMenuOpen, toggleMenu, closeMenu }}>
      <div className="flex min-h-screen">
        <Sidebar />
        
        {/* Mobile overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMenu}
          />
        )}
        
        <main className="flex-1 lg:ml-60 min-h-screen overflow-x-hidden">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:flex justify-end px-4 md:px-6 lg:px-8 pt-4 md:pt-6">
            <LanguageToggle />
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
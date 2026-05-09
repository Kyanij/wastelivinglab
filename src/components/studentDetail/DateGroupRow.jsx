import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateShort } from '../../utils/dateHelpers';
import { ChevronDown, ChevronRight, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import EntrySubTable from './EntrySubTable';
import { formatCurrency } from '../../utils/formatCurrency';

export default function DateGroupRow({
  dateGroup,
  isExpanded,
  onToggle,
  onEditDate,
  onDeleteDate,
  onEditItem,
  onDeleteItem,
}) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    const d = date.date ? date.date : date.dateKey;
    return formatDateShort(d);
  };

  const formatWeight = (weight) => {
    return (weight || 0).toFixed(2);
  };

  const entryCountText =
    dateGroup.entryCount === 1
      ? `1 ${t('studentDetail.entries').slice(0, -1)}`
      : `${dateGroup.entryCount} ${t('studentDetail.entries')}`;

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div className="border-b border-gray-100/50">
      <div
        className={`group relative flex items-center px-3 md:px-4 py-3 md:py-4 cursor-pointer transition-all duration-300 ${
          isExpanded 
            ? 'bg-gradient-to-r from-violet-50/80 via-lavender-50/80 to-rose-50/80 border-l-4 border-l-violet-400' 
            : 'bg-gradient-to-r from-white/80 to-gray-50/50 hover:from-violet-50/50 hover:to-rose-50/30'
        }`}
        onClick={onToggle}
      >
        <div className="w-[8%] md:w-[10%] flex items-center justify-center">
          <button className="p-1 rounded-full hover:bg-violet-100 transition-all duration-200 group-hover:scale-110">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-violet-500 transition-transform duration-300" />
            ) : (
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-violet-400 transition-colors duration-200" />
            )}
          </button>
        </div>

        <div className="w-[20%] md:w-[20%] flex items-center gap-1 md:gap-2">
          <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-violet-100' : 'bg-gray-100 group-hover:bg-violet-100'} transition-colors duration-200`}>
            <Calendar className={`w-3 h-3 md:w-4 md:h-4 ${isExpanded ? 'text-violet-600' : 'text-gray-400 group-hover:text-violet-500'}`} />
          </div>
          <span className={`font-semibold text-xs md:text-sm ${isExpanded ? 'text-violet-800' : 'text-gray-900 group-hover:text-violet-700'} transition-colors`}>
            {formatDate(dateGroup)}
          </span>
        </div>

        <div className="w-[20%] text-right">
          <span className="text-gray-700 font-medium text-xs md:text-sm group-hover:text-violet-700 transition-colors">{formatWeight(dateGroup.totalWeight)} kg</span>
        </div>

        <div className="w-[20%] text-right">
          <span className="text-violet-600 font-bold text-xs md:text-sm group-hover:text-violet-700 transition-colors">
            Rp{formatCurrency(dateGroup.totalEarnings)}
          </span>
        </div>

        <div className="w-[20%]">
          <span className={`inline-flex items-center px-2 md:px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${isExpanded ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-200' : 'bg-violet-100 text-violet-700 group-hover:bg-violet-200 group-hover:scale-105'}`}>
            {entryCountText}
          </span>
        </div>

        <div className="w-[12%] md:w-[10%] flex justify-end relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="relative z-20 p-1.5 md:p-2 hover:bg-violet-100 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <MoreVertical className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-xl shadow-gray-200/50 z-30 py-1 min-w-[140px] md:min-w-[160px] overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDate(dateGroup);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 md:px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-all duration-200"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">{t('modals.editDateEntry')}</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDate(dateGroup);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 md:px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('modals.deleteDateEntry')}</span>
                <span className="sm:hidden">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="pb-2 pl-2 relative z-10">
          <EntrySubTable
            entries={dateGroup.entries}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
            dateGroup={dateGroup}
          />
        </div>
      )}
    </div>
  );
}
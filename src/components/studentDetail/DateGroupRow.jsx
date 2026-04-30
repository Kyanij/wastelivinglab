import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import EntrySubTable from './EntrySubTable';

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
    const d = date.date ? date.date : new Date(date.dateKey);
    return format(d, 'MMM dd, yyyy');
  };

  const formatWeight = (weight) => {
    return (weight || 0).toFixed(2);
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
    <div className="border-b border-gray-100">
      <div
        className={`flex items-center px-3 md:px-4 py-3 md:py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
          isExpanded ? 'bg-green-50' : 'bg-white'
        }`}
        onClick={onToggle}
      >
        <div className="w-[8%] md:w-[10%] flex items-center justify-center">
          <button className="p-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            )}
          </button>
        </div>

        <div className="w-[20%] md:w-[20%] flex items-center gap-1 md:gap-2">
          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
          <span className="text-gray-900 font-medium text-xs md:text-sm">
            {formatDate(dateGroup)}
          </span>
        </div>

        <div className="w-[20%] text-right">
          <span className="text-gray-700 text-xs md:text-sm">{formatWeight(dateGroup.totalWeight)} kg</span>
        </div>

        <div className="w-[20%] text-right">
          <span className="text-green-600 font-medium text-xs md:text-sm">
            Rp{formatCurrency(dateGroup.totalEarnings)}
          </span>
        </div>

        <div className="w-[20%]">
          <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {entryCountText}
          </span>
        </div>

        <div className="w-[12%] md:w-[10%] flex justify-end relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px] md:min-w-[160px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDate(dateGroup);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 md:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                className="w-full flex items-center gap-2 px-3 md:px-4 py-2 text-sm text-red-500 hover:bg-red-50"
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
        <div className="pb-2">
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
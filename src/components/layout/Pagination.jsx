import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onGoToPage
}) {
  const { t } = useTranslation();
  const [goToValue, setGoToValue] = useState('');

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleGoToSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(goToValue, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToValue('');
    }
  };

  const fromItem = (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-2">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-600">
          {t('pagination.showing', { from: fromItem, to: toItem, total: totalItems })}
        </span>
        
        <div className="flex items-center gap-2 ml-2">
          <span className="text-gray-500 text-xs">{t('pagination.rowsPerPage')}</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            className="px-2 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer hover:border-gray-400 transition-colors"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleGoToSubmit} className="flex items-center gap-1.5 text-sm">
          <span className="text-gray-500">{t('pagination.goTo')}</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={goToValue}
            onChange={(e) => setGoToValue(e.target.value)}
            placeholder={currentPage}
            className="w-14 px-2 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center"
          />
          <span className="text-gray-500">/ {totalPages}</span>
        </form>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:border-gray-400"
            title={t('pagination.firstPage')}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:border-gray-400"
            title={t('pagination.prevPage')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((page, idx) => (
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-green-600 text-white shadow-md shadow-green-200'
                      : 'text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:border-gray-400"
            title={t('pagination.nextPage')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:border-gray-400"
            title={t('pagination.lastPage')}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
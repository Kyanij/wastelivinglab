import { useState } from 'react';
import { toLocalDateString } from '../../utils/portalHelpers';

export default function DateRangeFilter({ onApply }) {
  const today = new Date();
  const startOfYear = toLocalDateString(new Date(today.getFullYear(), 0, 1));
  const endOfYear = toLocalDateString(new Date(today.getFullYear(), 11, 31));

  const [fromDate, setFromDate] = useState(startOfYear);
  const [toDate, setToDate] = useState(endOfYear);

  const handleApply = () => {
    onApply(fromDate, toDate);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">From:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">To:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <button
        onClick={handleApply}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
      >
        Apply
      </button>
    </div>
  );
}
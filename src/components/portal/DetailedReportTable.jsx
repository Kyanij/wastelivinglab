import { useState } from 'react';
import { groupEntriesByDate, formatKg, formatCurrency } from '../../utils/portalHelpers';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function DetailedReportTable({ entries }) {
  const [expandedDate, setExpandedDate] = useState(null);
  const grouped = groupEntriesByDate(entries);

  const toggleDate = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const calculateDayTotals = (dayEntries) => {
    return dayEntries.reduce(
      (acc, entry) => {
        acc.weight += entry.weight || 0;
        acc.amount += entry.amount || 0;
        return acc;
      },
      { weight: 0, amount: 0 }
    );
  };

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        No waste entries found for the selected date range.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Waste (kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([date, dayEntries]) => {
              const totals = calculateDayTotals(dayEntries);
              const isExpanded = expandedDate === date;

              return (
                <>
                  <tr
                    key={date}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleDate(date)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatKg(totals.weight)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {formatCurrency(totals.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-4 py-3">
                        <table className="w-full ml-4">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Waste Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Quantity (kg)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Rate (Rp/kg)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Earnings (Rp)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dayEntries.map((entry) => (
                              <tr key={entry.id} className="border-b border-gray-100 last:border-b-0">
                                <td className="px-3 py-2 text-sm text-gray-700">
                                  {entry.wasteTypeName || entry.wasteType || 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600">{formatKg(entry.weight)}</td>
                                <td className="px-3 py-2 text-sm text-gray-600">
                                  {formatCurrency(entry.rate || 0)}
                                </td>
                                <td className="px-3 py-2 text-sm font-medium text-green-600">
                                  {formatCurrency(entry.amount || 0)}
                                </td>
                              </tr>
                            ))}
                            <tr className="font-medium">
                              <td className="px-3 py-2 text-sm text-gray-800">Total</td>
                              <td className="px-3 py-2 text-sm text-gray-800">{formatKg(totals.weight)}</td>
                              <td className="px-3 py-2 text-sm text-gray-800">-</td>
                              <td className="px-3 py-2 text-sm text-green-700">{formatCurrency(totals.amount)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { formatDateKey } from '../../utils/portalHelpers';
import { formatCurrency } from '../../utils/portalHelpers';

function formatWeight(weight) {
  return (weight || 0).toFixed(2);
}

export default function PortalDateGroupRow({ dateGroup, isExpanded, onToggle }) {
  const entryCount = dateGroup.entries.length;
  const entryCountText = entryCount === 1 ? '1 item' : `${entryCount} items`;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className={`
          flex items-center px-5 py-4 cursor-pointer transition-all duration-300
          ${isExpanded 
            ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-l-4 border-l-green-500' 
            : 'hover:bg-gray-50 bg-white'
          }
        `}
        onClick={onToggle}
      >
        <div className="w-[8%] flex items-center justify-center">
          <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-green-600 transition-transform duration-300" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 transition-transform duration-300" />
            )}
          </button>
        </div>

        <div className="w-[22%] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-medium whitespace-nowrap">
            {formatDateKey(dateGroup.dateKey)}
          </span>
        </div>

        <div className="w-[20%] text-right">
          <span className="text-gray-700 font-semibold">
            {formatWeight(dateGroup.totalWeight)} <span className="text-gray-400 text-sm">kg</span>
          </span>
        </div>

        <div className="w-[20%] text-right">
          <span className="text-green-600 font-bold">
            {formatCurrency(dateGroup.totalEarnings)}
          </span>
        </div>

        <div className="w-[20%]">
          <span className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold
            ${isExpanded 
              ? 'bg-green-500 text-white shadow-sm' 
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {entryCountText}
          </span>
        </div>

        <div className="w-[10%]"></div>
      </div>

      {isExpanded && (
        <div className="pb-3 animate-slide-down">
          <div className="bg-gradient-to-r from-gray-50 to-green-50/30 border-l-4 border-l-green-400 ml-12 mr-5 rounded-r-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-2.5 text-left w-[30%]">Waste Type</th>
                    <th className="px-4 py-2.5 text-right w-[20%]">Weight</th>
                    <th className="px-4 py-2.5 text-right w-[20%]">Rate/kg</th>
                    <th className="px-4 py-2.5 text-right w-[20%]">Amount</th>
                    <th className="px-4 py-2.5 w-[10%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dateGroup.entries.map((entry, index) => (
                    <tr 
                      key={entry.id}
                      className={`
                        transition-colors duration-200
                        ${index % 2 === 0 ? 'bg-white/70' : 'bg-gray-50/50'}
                        hover:bg-green-50/50
                      `}
                    >
                      <td className="px-4 py-3">
                        <span className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                          ${getWasteTypeBadgeClass(entry.wasteTypeName || entry.wasteType)}
                        `}>
                          <span className="text-base">{getWasteTypeIcon(entry.wasteTypeName || entry.wasteType)}</span>
                          {entry.wasteTypeName || entry.wasteType || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-700 font-medium">
                          {formatWeight(entry.weight)} <span className="text-gray-400 text-xs">kg</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {formatCurrency(entry.rate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-green-600 font-bold">
                          {formatCurrency(entry.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getWasteTypeBadgeClass(type) {
  const typeMap = {
    'Plastic': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Plastic Bottles': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Paper': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Paper Waste': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Glass': 'bg-teal-50 text-teal-700 border border-teal-200',
    'Metal': 'bg-red-50 text-red-700 border border-red-200',
    'Cans': 'bg-red-50 text-red-700 border border-red-200',
    'E-Waste': 'bg-green-50 text-green-700 border border-green-200',
    'Electronics': 'bg-green-50 text-green-700 border border-green-200',
  };
  return typeMap[type] || 'bg-gray-50 text-gray-700 border border-gray-200';
}

function getWasteTypeIcon(type) {
  const iconMap = {
    'Plastic': '🧴',
    'Plastic Bottles': '🧴',
    'Paper': '📄',
    'Paper Waste': '📄',
    'Glass': '🫙',
    'Metal': '🥫',
    'Cans': '🥫',
    'E-Waste': '🖥️',
    'Electronics': '🖥️',
  };
  return iconMap[type] || '📦';
}
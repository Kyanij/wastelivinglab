import { WASTE_TYPE_CONFIG, formatKg, formatCurrency } from '../../utils/portalHelpers';

export default function CollectionSummaryCards({ summary }) {
  const getConfig = (name) => WASTE_TYPE_CONFIG.find(c => c.name === name) || { name, color: '#6b7280', icon: '📦' };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {WASTE_TYPE_CONFIG.map((type) => {
        const data = summary[type.name] || { quantity: 0, earned: 0 };
        return (
          <div
            key={type.name}
            className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{type.icon}</span>
              <span className="text-sm font-medium text-gray-600">{type.name}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: type.color }}>
              {formatKg(data.quantity)}
            </p>
            <p className="text-sm text-green-600 font-medium">
              Earned: {formatCurrency(data.earned)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
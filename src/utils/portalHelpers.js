export function groupEntriesByDate(entries) {
  const grouped = {};
  entries.forEach((entry) => {
    const dateKey = entry.date ? new Date(entry.date.seconds * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) : 'Unknown Date';
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(entry);
  });
  return grouped;
}

export function calculateSummary(entries) {
  const summary = {
    'Plastic': { quantity: 0, earned: 0 },
    'Paper': { quantity: 0, earned: 0 },
    'Glass': { quantity: 0, earned: 0 },
    'Metal': { quantity: 0, earned: 0 }
  };
  
  const typeMap = {
    'Plastic Bottles': 'Plastic',
    'Plastic': 'Plastic',
    'Paper Waste': 'Paper',
    'Paper': 'Paper',
    'Glass': 'Glass',
    'Cans': 'Metal',
    'Metal': 'Metal',
    'E-Waste': 'E-Waste'
  };
  
  entries.forEach((entry) => {
    const type = typeMap[entry.wasteTypeName] || entry.wasteType || 'Other';
    const qty = entry.weight || 0;
    const earned = entry.amount || 0;
    
    if (summary[type]) {
      summary[type].quantity += qty;
      summary[type].earned += earned;
    } else if (type === 'E-Waste') {
      summary['E-Waste'] = { quantity: (summary['E-Waste']?.quantity || 0) + qty, earned: (summary['E-Waste']?.earned || 0) + earned };
    }
  });
  
  return summary;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

export function formatKg(kg) {
  return `${(kg || 0).toFixed(2)} kg`;
}

export const WASTE_TYPE_CONFIG = [
  { name: 'Plastic', color: '#2563eb', icon: '🧴' },
  { name: 'Paper', color: '#ea580c', icon: '📄' },
  { name: 'Metal', color: '#dc2626', icon: '🥫' },
  { name: 'E-Waste', color: '#16a34a', icon: '🖥️' }
];
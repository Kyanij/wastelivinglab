export function toLocalDateString(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function groupEntriesByDate(entries) {
  const grouped = {};
  entries.forEach((entry) => {
    let dateKey;
    if (entry.date?.toDate) {
      dateKey = toLocalDateString(entry.date.toDate());
    } else if (entry.date) {
      dateKey = toLocalDateString(new Date(entry.date));
    } else {
      dateKey = 'unknown';
    }
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        dateKey,
        entries: [],
        totalWeight: 0,
        totalEarnings: 0,
      };
    }
    grouped[dateKey].entries.push(entry);
    grouped[dateKey].totalWeight += entry.weight || 0;
    grouped[dateKey].totalEarnings += entry.amount || 0;
  });
  
  return Object.values(grouped).sort((a, b) => 
    new Date(b.dateKey) - new Date(a.dateKey)
  );
}

export function formatDateKey(dateKey) {
  const date = new Date(dateKey);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
  const num = amount || 0;
  if (Number.isInteger(num)) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
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

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}
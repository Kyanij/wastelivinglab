export const formatCurrency = (amount) => {
  const num = amount || 0;
  if (Number.isInteger(num)) {
    return num.toLocaleString('id-ID');
  }
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
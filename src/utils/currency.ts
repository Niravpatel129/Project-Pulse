export const mapCurrency = (currency: string | undefined) => {
  if (!currency) return '$';

  switch (currency.toUpperCase()) {
    case 'USD':
      return '$';
    case 'CAD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return currency;
  }
};

export const formatAmount = (amount: number, currency: string | undefined) => {
  return `${mapCurrency(currency)}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

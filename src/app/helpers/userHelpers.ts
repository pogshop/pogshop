export function getUserDisplayCurrency(user: any) {
  const userCurrency = user?.currency || 'USD';
  return userCurrency.toUpperCase();
}

export function getCurrencySymbol(currency: string): string {
  const currencyMap: { [key: string]: string } = {
    USD: '$',
    GBP: '£',
    AUD: 'AU$',
    CAD: 'CA$',
  };

  const normalizedCurrency = currency.toUpperCase();
  return currencyMap[normalizedCurrency] || '$';
}

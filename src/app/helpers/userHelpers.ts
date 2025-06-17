export function getUserDisplayCurrency(user: any) {
  const userCurrency = user?.currency || 'USD';
  return userCurrency.toUpperCase();
}

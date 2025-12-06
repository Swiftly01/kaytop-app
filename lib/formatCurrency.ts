/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., ₦50,350.00)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

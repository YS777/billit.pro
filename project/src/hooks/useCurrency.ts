import { useState, useEffect } from 'react';
import { getExchangeRates, convertFromINR, formatCurrency } from '../lib/currency';

export function useCurrency() {
  const [userCurrency, setUserCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function detectUserCurrency() {
      try {
        // Try to get currency from browser's language settings
        const currency = navigator.language.split('-')[1] || 'USD';
        setUserCurrency(currency);
        
        // Verify the currency is supported by fetching rates
        await getExchangeRates();
      } catch (err) {
        setError('Failed to detect currency');
        setUserCurrency('USD'); // Fallback to USD
      } finally {
        setLoading(false);
      }
    }

    detectUserCurrency();
  }, []);

  const convertPrice = async (amountINR: number): Promise<string> => {
    try {
      const converted = await convertFromINR(amountINR, userCurrency);
      return formatCurrency(converted, userCurrency);
    } catch (err) {
      setError('Failed to convert currency');
      return formatCurrency(amountINR, 'INR');
    }
  };

  return {
    userCurrency,
    loading,
    error,
    convertPrice,
    formatCurrency: (amount: number) => formatCurrency(amount, userCurrency),
  };
}
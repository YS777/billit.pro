import axios from 'axios';

const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/INR';

interface ExchangeRates {
  rates: Record<string, number>;
  time_last_update_utc: string;
}

let cachedRates: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const { data } = await axios.get<ExchangeRates>(EXCHANGE_RATE_API);
    cachedRates = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw new Error('Failed to fetch exchange rates');
  }
}

export async function convertFromINR(amountINR: number, targetCurrency: string): Promise<number> {
  const rates = await getExchangeRates();
  const rate = rates.rates[targetCurrency];
  
  if (!rate) {
    throw new Error(`Exchange rate not found for currency: ${targetCurrency}`);
  }

  return amountINR * rate;
}

export async function convertToINR(amount: number, fromCurrency: string): Promise<number> {
  const rates = await getExchangeRates();
  const rate = rates.rates[fromCurrency];
  
  if (!rate) {
    throw new Error(`Exchange rate not found for currency: ${fromCurrency}`);
  }

  return amount / rate;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
import { useState, useEffect, useCallback } from 'react';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const CURRENCY_KEY = 'spendsmart_currency';
const RATES_KEY = 'spendsmart_rates';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<string>(() =>
    localStorage.getItem(CURRENCY_KEY) || 'INR'
  );
  const [rates, setRates] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem(RATES_KEY) || '{}'); } catch { return {}; }
  });
  const [ratesLoading, setRatesLoading] = useState(false);

  useEffect(() => {
    setRatesLoading(true);
    fetch('https://api.frankfurter.app/latest?from=INR')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setRates(data.rates);
          localStorage.setItem(RATES_KEY, JSON.stringify(data.rates));
        }
      })
      .catch(() => { /* use cached rates */ })
      .finally(() => setRatesLoading(false));
  }, []);

  const changeCurrency = (code: string) => {
    setCurrencyState(code);
    localStorage.setItem(CURRENCY_KEY, code);
  };

  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const convertFromINR = useCallback((amountINR: number): number => {
    if (currency === 'INR') return amountINR;
    const rate = rates[currency];
    if (!rate) return amountINR;
    return amountINR * rate;
  }, [currency, rates]);

  const convertToINR = useCallback((amount: number): number => {
    if (currency === 'INR') return amount;
    const rate = rates[currency];
    if (!rate) return amount;
    return amount / rate;
  }, [currency, rates]);

  const formatAmount = useCallback((amountINR: number): string => {
    const converted = convertFromINR(amountINR);
    const sym = currencyInfo.symbol;
    if (currency === 'JPY') {
      return `${sym}${Math.round(converted).toLocaleString()}`;
    }
    if (currency === 'INR') {
      return `${sym}${amountINR.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${sym}${converted.toFixed(2)}`;
  }, [currency, currencyInfo.symbol, convertFromINR]);

  return {
    currency,
    currencyInfo,
    changeCurrency,
    convertFromINR,
    convertToINR,
    formatAmount,
    ratesLoading,
    CURRENCIES,
  };
}

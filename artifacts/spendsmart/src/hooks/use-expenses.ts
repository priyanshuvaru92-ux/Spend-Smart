import { useState, useEffect, useMemo } from 'react';
import { format, subDays, isSameDay, parseISO, isSameMonth } from 'date-fns';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Education'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Other';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'spendsmart_expenses';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch {
        console.error('Failed to parse expenses from localStorage');
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(e => isSameMonth(parseISO(e.date), now))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // categoryBreakdown / byCategory — both names exposed for compatibility
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    expenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const byCategory = categoryBreakdown;

  // last7DaysData / last7Days — both names exposed for compatibility
  const last7DaysData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(today, 6 - i);
      return {
        name: format(day, 'EEE'),
        amount: expenses
          .filter(e => isSameDay(parseISO(e.date), day))
          .reduce((sum, e) => sum + e.amount, 0),
      };
    });
  }, [expenses]);

  const last7Days = last7DaysData;

  const topCategory = useMemo(() => {
    if (categoryBreakdown.length === 0) return 'None';
    return categoryBreakdown.reduce((prev, curr) =>
      curr.value > prev.value ? curr : prev
    ).name;
  }, [categoryBreakdown]);

  return {
    expenses,
    addExpense,
    deleteExpense,
    totalSpent,
    thisMonthTotal,
    categoryBreakdown,
    byCategory,
    last7DaysData,
    last7Days,
    topCategory,
    isLoaded,
  };
}

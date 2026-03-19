import { useState, useEffect, useMemo } from 'react';
import { format, subDays, isAfter, isSameDay, parseISO } from 'date-fns';

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
  date: string; // ISO string
}

const STORAGE_KEY = 'spendsmart_expenses';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse expenses from localStorage");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever expenses change
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

  // Derived state
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    expenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const last7DaysData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = subDays(today, i);
      const dayLabel = format(targetDate, 'EEE'); // Mon, Tue, etc.
      
      const spentOnDay = expenses
        .filter(e => isSameDay(parseISO(e.date), targetDate))
        .reduce((sum, e) => sum + e.amount, 0);
        
      data.push({
        name: dayLabel,
        amount: spentOnDay
      });
    }
    return data;
  }, [expenses]);

  const topCategory = useMemo(() => {
    if (categoryBreakdown.length === 0) return 'None';
    return categoryBreakdown.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    ).name;
  }, [categoryBreakdown]);

  return {
    expenses,
    addExpense,
    deleteExpense,
    totalSpent,
    categoryBreakdown,
    last7DaysData,
    topCategory,
    isLoaded
  };
}

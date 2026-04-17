import { useState, useEffect, useMemo } from 'react';
import { format, subDays, isSameDay, parseISO, isSameMonth, addDays, addWeeks, addMonths, isAfter, parseISO as parse } from 'date-fns';

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
  date: string;
  isRecurring?: boolean;
  frequency?: 'Daily' | 'Weekly' | 'Monthly';
  receiptImage?: string;
}

export interface RecurringTemplate {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  nextDate: string;
}

const STORAGE_KEY = 'spendsmart_expenses';
const RECURRING_KEY = 'spendsmart_recurring';

function advanceDate(date: string, frequency: 'Daily' | 'Weekly' | 'Monthly'): string {
  const d = parseISO(date);
  if (frequency === 'Daily') return format(addDays(d, 1), 'yyyy-MM-dd');
  if (frequency === 'Weekly') return format(addWeeks(d, 1), 'yyyy-MM-dd');
  return format(addMonths(d, 1), 'yyyy-MM-dd');
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let loadedExpenses: Expense[] = [];
    if (stored) {
      try { loadedExpenses = JSON.parse(stored); } catch { /* ignore */ }
    }

    const rStored = localStorage.getItem(RECURRING_KEY);
    let templates: RecurringTemplate[] = [];
    if (rStored) {
      try { templates = JSON.parse(rStored); } catch { /* ignore */ }
    }

    // Generate due recurring expenses
    const today = format(new Date(), 'yyyy-MM-dd');
    const generated: Expense[] = [];
    const updatedTemplates = templates.map(t => {
      let next = t.nextDate;
      while (next <= today) {
        generated.push({
          id: crypto.randomUUID(),
          name: t.name,
          amount: t.amount,
          category: t.category,
          date: next,
          isRecurring: true,
          frequency: t.frequency,
        });
        next = advanceDate(next, t.frequency);
      }
      return { ...t, nextDate: next };
    });

    if (generated.length > 0) {
      loadedExpenses = [...generated, ...loadedExpenses];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedExpenses));
    }
    if (updatedTemplates.some((t, i) => t.nextDate !== templates[i]?.nextDate)) {
      localStorage.setItem(RECURRING_KEY, JSON.stringify(updatedTemplates));
    }

    setExpenses(loadedExpenses);
    setRecurringTemplates(updatedTemplates);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    setExpenses(prev => [newExpense, ...prev]);

    // If recurring, also create a template
    if (expense.isRecurring && expense.frequency) {
      const template: RecurringTemplate = {
        id: crypto.randomUUID(),
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        frequency: expense.frequency,
        nextDate: advanceDate(expense.date, expense.frequency),
      };
      setRecurringTemplates(prev => {
        const updated = [...prev, template];
        localStorage.setItem(RECURRING_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const deleteRecurring = (id: string) => {
    setRecurringTemplates(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem(RECURRING_KEY, JSON.stringify(updated));
      return updated;
    });
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

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    expenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const byCategory = categoryBreakdown;

  const thisMonthByCategory = useMemo(() => {
    const now = new Date();
    const breakdown: Record<string, number> = {};
    expenses
      .filter(e => isSameMonth(parseISO(e.date), now))
      .forEach(e => {
        breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
      });
    return breakdown;
  }, [expenses]);

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
    thisMonthByCategory,
    last7DaysData,
    last7Days,
    topCategory,
    isLoaded,
    recurringTemplates,
    deleteRecurring,
  };
}

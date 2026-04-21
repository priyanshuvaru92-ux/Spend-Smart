import { useState, useEffect, useMemo } from 'react';
import { format, subDays, isSameDay, parseISO, isSameMonth, addDays, addWeeks, addMonths } from 'date-fns';
import { supabase } from '../lib/supabase';

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

function advanceDate(date: string, frequency: 'Daily' | 'Weekly' | 'Monthly'): string {
  const d = parseISO(date);
  if (frequency === 'Daily') return format(addDays(d, 1), 'yyyy-MM-dd');
  if (frequency === 'Weekly') return format(addWeeks(d, 1), 'yyyy-MM-dd');
  return format(addMonths(d, 1), 'yyyy-MM-dd');
}

export function useExpenses(userId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const [{ data: expData }, { data: recData }] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('recurring_templates').select('*').eq('user_id', userId),
      ]);

      const loadedExpenses: Expense[] = (expData || []).map((r) => ({
        id: r.id,
        name: r.name,
        amount: r.amount,
        category: r.category as ExpenseCategory,
        date: r.date,
        isRecurring: r.is_recurring,
        frequency: r.frequency,
        receiptImage: r.receipt_image,
      }));

      const templates: RecurringTemplate[] = (recData || []).map((r) => ({
        id: r.id,
        name: r.name,
        amount: r.amount,
        category: r.category as ExpenseCategory,
        frequency: r.frequency,
        nextDate: r.next_date,
      }));

      // Generate due recurring expenses
      const today = format(new Date(), 'yyyy-MM-dd');
      const generated: Expense[] = [];
      const updatedTemplates: RecurringTemplate[] = [];

      for (const t of templates) {
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
        updatedTemplates.push({ ...t, nextDate: next });
      }

      // Insert generated expenses to Supabase
      if (generated.length > 0) {
        const rows = generated.map((e) => ({
          id: e.id,
          user_id: userId,
          name: e.name,
          amount: e.amount,
          category: e.category,
          date: e.date,
          is_recurring: true,
          frequency: e.frequency,
        }));
        await supabase.from('expenses').insert(rows);
      }

      // Update next_date on changed templates
      for (let i = 0; i < updatedTemplates.length; i++) {
        if (updatedTemplates[i].nextDate !== templates[i].nextDate) {
          await supabase
            .from('recurring_templates')
            .update({ next_date: updatedTemplates[i].nextDate })
            .eq('id', updatedTemplates[i].id);
        }
      }

      setExpenses([...generated, ...loadedExpenses]);
      setRecurringTemplates(updatedTemplates);
      setIsLoaded(true);
    };

    load();
  }, [userId]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    const row = {
      id,
      user_id: userId,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      is_recurring: expense.isRecurring || false,
      frequency: expense.frequency || null,
      receipt_image: expense.receiptImage || null,
    };
    await supabase.from('expenses').insert(row);
    const newExpense: Expense = { ...expense, id };
    setExpenses(prev => [newExpense, ...prev]);

    if (expense.isRecurring && expense.frequency) {
      const templateId = crypto.randomUUID();
      const nextDate = advanceDate(expense.date, expense.frequency);
      await supabase.from('recurring_templates').insert({
        id: templateId,
        user_id: userId,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        frequency: expense.frequency,
        next_date: nextDate,
      });
      setRecurringTemplates(prev => [
        ...prev,
        { id: templateId, name: expense.name, amount: expense.amount, category: expense.category, frequency: expense.frequency!, nextDate },
      ]);
    }
  };

  const deleteExpense = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const deleteRecurring = async (id: string) => {
    await supabase.from('recurring_templates').delete().eq('id', id);
    setRecurringTemplates(prev => prev.filter(t => t.id !== id));
  };

  const clearAll = async () => {
    if (!userId) return;
    await supabase.from('expenses').delete().eq('user_id', userId);
    await supabase.from('recurring_templates').delete().eq('user_id', userId);
    setExpenses([]);
    setRecurringTemplates([]);
  };

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => isSameMonth(parseISO(e.date), now)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    expenses.forEach(e => { breakdown[e.category] = (breakdown[e.category] || 0) + e.amount; });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const byCategory = categoryBreakdown;

  const thisMonthByCategory = useMemo(() => {
    const now = new Date();
    const breakdown: Record<string, number> = {};
    expenses.filter(e => isSameMonth(parseISO(e.date), now)).forEach(e => {
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
        amount: expenses.filter(e => isSameDay(parseISO(e.date), day)).reduce((sum, e) => sum + e.amount, 0),
      };
    });
  }, [expenses]);

  const last7Days = last7DaysData;

  const topCategory = useMemo(() => {
    if (categoryBreakdown.length === 0) return 'None';
    return categoryBreakdown.reduce((prev, curr) => curr.value > prev.value ? curr : prev).name;
  }, [categoryBreakdown]);

  return {
    expenses, addExpense, deleteExpense,
    totalSpent, thisMonthTotal, categoryBreakdown,
    byCategory, thisMonthByCategory, last7DaysData, last7Days,
    topCategory, isLoaded,
    recurringTemplates, deleteRecurring,
    clearAll,
  };
}

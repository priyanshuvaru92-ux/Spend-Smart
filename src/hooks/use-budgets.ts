import { useState, useEffect } from 'react';

export type BudgetGoals = Record<string, number>;

const BUDGETS_KEY = 'spendsmart_budgets';

export function useBudgets() {
  const [budgets, setBudgetsState] = useState<BudgetGoals>({});

  useEffect(() => {
    const stored = localStorage.getItem(BUDGETS_KEY);
    if (stored) {
      try { setBudgetsState(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const setBudget = (category: string, limit: number) => {
    setBudgetsState(prev => {
      const updated = { ...prev };
      if (limit <= 0) {
        delete updated[category];
      } else {
        updated[category] = limit;
      }
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { budgets, setBudget };
}

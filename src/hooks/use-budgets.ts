import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type BudgetGoals = Record<string, number>;

export function useBudgets(userId?: string) {
  const [budgets, setBudgetsState] = useState<BudgetGoals>({});

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('budgets')
      .select('category, amount')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          const map: BudgetGoals = {};
          data.forEach((row) => { map[row.category] = row.amount; });
          setBudgetsState(map);
        }
      });
  }, [userId]);

  const setBudget = async (category: string, limit: number) => {
    if (!userId) return;
    if (limit <= 0) {
      await supabase.from('budgets').delete().eq('user_id', userId).eq('category', category);
      setBudgetsState(prev => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
    } else {
      await supabase.from('budgets').upsert(
        { user_id: userId, category, amount: limit },
        { onConflict: 'user_id,category' }
      );
      setBudgetsState(prev => ({ ...prev, [category]: limit }));
    }
  };

  return { budgets, setBudget };
}

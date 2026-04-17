import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Target, RefreshCw, Trash2, Sun, Moon, Check } from 'lucide-react';
import type { BudgetGoals } from '../hooks/use-budgets';
import type { RecurringTemplate } from '../hooks/use-expenses';
import type { CurrencyInfo } from '../hooks/use-currency';

const CATEGORIES = ['Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Health', 'Other'] as const;

interface SettingsProps {
  currency: string;
  currencies: CurrencyInfo[];
  onCurrencyChange: (code: string) => void;
  budgets: BudgetGoals;
  onBudgetChange: (category: string, limit: number) => void;
  recurringTemplates: RecurringTemplate[];
  onDeleteRecurring: (id: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  currencySymbol: string;
}

export function Settings({
  currency, currencies, onCurrencyChange,
  budgets, onBudgetChange,
  recurringTemplates, onDeleteRecurring,
  isDark, onToggleDark,
  currencySymbol,
}: SettingsProps) {
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORIES.map(c => [c, budgets[c] ? String(budgets[c]) : '']))
  );
  const [savedBudgets, setSavedBudgets] = useState<Record<string, boolean>>({});

  const handleBudgetSave = (category: string) => {
    const val = Number(budgetInputs[category]);
    onBudgetChange(category, isNaN(val) ? 0 : val);
    setSavedBudgets(prev => ({ ...prev, [category]: true }));
    setTimeout(() => setSavedBudgets(prev => ({ ...prev, [category]: false })), 1500);
  };

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-3xl mx-auto w-full space-y-10">

      {/* Appearance */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {isDark ? <Moon size={20} className="text-accent" /> : <Sun size={20} className="text-accent" />}
          Appearance
        </h2>
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Dark Mode</p>
            <p className="text-sm text-muted-foreground">Switch between light cream and dark maroon theme</p>
          </div>
          <button
            onClick={onToggleDark}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>
      </motion.section>

      {/* Currency */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Coins size={20} className="text-accent" />
          Currency
        </h2>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-4">
            All amounts stored in INR. Other currencies are shown with live conversion rates.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => onCurrencyChange(c.code)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  currency === c.code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background hover:border-primary/40 text-foreground'
                }`}
              >
                <span className="text-lg">{c.symbol}</span>
                <span>{c.code}</span>
                {currency === c.code && <Check size={14} className="ml-auto text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Budget Goals */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target size={20} className="text-accent" />
          Monthly Budget Goals
        </h2>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="text-sm text-muted-foreground">Set monthly spending limits per category. Leave blank to remove limit.</p>
          {CATEGORIES.map(cat => (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-28 text-sm font-medium text-foreground flex-shrink-0">{cat}</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-muted-foreground text-sm">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  value={budgetInputs[cat]}
                  onChange={e => setBudgetInputs(prev => ({ ...prev, [cat]: e.target.value }))}
                  placeholder="No limit"
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button
                  onClick={() => handleBudgetSave(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    savedBudgets[cat]
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {savedBudgets[cat] ? <Check size={16} /> : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Recurring Expenses */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <RefreshCw size={20} className="text-accent" />
          Recurring Expenses
        </h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {recurringTemplates.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <RefreshCw size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No recurring expenses yet.</p>
              <p className="text-sm mt-1">Mark an expense as "Recurring" when adding it.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recurringTemplates.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {currencySymbol}{t.amount} · {t.frequency} · next on {t.nextDate}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteRecurring(t.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

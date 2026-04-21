import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coins, Target, RefreshCw, Trash2, Sun, Moon, Check,
  User as UserIcon, Download, Database, LogOut, AlertCircle,
} from 'lucide-react';
import type { BudgetGoals } from '../hooks/use-budgets';
import type { Expense, RecurringTemplate } from '../hooks/use-expenses';
import type { CurrencyInfo } from '../hooks/use-currency';
import { CATEGORY_CONFIG } from '../lib/categories';

const CATEGORIES = ['Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Health', 'Other'] as const;

const CURRENCY_FLAGS: Record<string, string> = {
  INR: '🇮🇳', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧',
  AED: '🇦🇪', JPY: '🇯🇵', SGD: '🇸🇬',
};

interface SettingsProps {
  user: { name: string; email: string };
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
  expenses: Expense[];
  thisMonthByCategory: Record<string, number>;
  onClearAllData: () => Promise<void> | void;
  onLogout: () => void;
}

const APP_VERSION = 'v1.0.0';

function BudgetRing({ pct, color }: { pct: number; color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(pct, 100);
  const offset = circumference - (clamped / 100) * circumference;
  const ringColor =
    pct >= 100 ? '#EF4444' : pct >= 86 ? '#EF4444'
    : pct >= 61 ? '#F59E0B' : '#10B981';

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
        <circle
          cx="44" cy="44" r={radius}
          fill="none" stroke="hsl(var(--muted))" strokeWidth="8"
        />
        <circle
          cx="44" cy="44" r={radius}
          fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-foreground">{Math.round(pct)}%</span>
        <span className="sr-only">used of {color}</span>
      </div>
    </div>
  );
}

function downloadCSV(expenses: Expense[]) {
  const headers = ['Date', 'Name', 'Category', 'Amount (INR)', 'Recurring', 'Frequency'];
  const rows = expenses.map(e => [
    e.date,
    `"${e.name.replace(/"/g, '""')}"`,
    e.category,
    String(e.amount),
    e.isRecurring ? 'Yes' : 'No',
    e.frequency || '',
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `spendsmart_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function Settings({
  user, currency, currencies, onCurrencyChange,
  budgets, onBudgetChange,
  recurringTemplates, onDeleteRecurring,
  isDark, onToggleDark,
  currencySymbol, expenses, thisMonthByCategory,
  onClearAllData, onLogout,
}: SettingsProps) {
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORIES.map(c => [c, budgets[c] ? String(budgets[c]) : '']))
  );
  const [savedBudgets, setSavedBudgets] = useState<Record<string, boolean>>({});
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleBudgetSave = (category: string) => {
    const val = Number(budgetInputs[category]);
    onBudgetChange(category, isNaN(val) ? 0 : val);
    setSavedBudgets(prev => ({ ...prev, [category]: true }));
    setEditingBudget(null);
    setTimeout(() => setSavedBudgets(prev => ({ ...prev, [category]: false })), 1500);
  };

  const initials = user.name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const totalBudget = Object.values(budgets).reduce((s, n) => s + n, 0);
  const totalSpent = Object.entries(budgets).reduce(
    (s, [cat]) => s + (thisMonthByCategory[cat] || 0), 0
  );
  const remaining = totalBudget - totalSpent;

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await onClearAllData();
    } finally {
      setClearing(false);
      setConfirmClear(false);
    }
  };

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-3xl mx-auto w-full space-y-12 page-enter">

      {/* ─── Profile ─── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Profile</p>
        <div className="bg-card border border-border rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/20 flex-shrink-0">
              {initials || <UserIcon size={28} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-lg truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Currency & Region ─── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Coins size={14} /> Currency & Region
        </p>
        <div className="bg-card border border-border rounded-2xl p-5 card-hover">
          <p className="text-sm text-muted-foreground mb-4">
            All amounts stored in INR. Other currencies shown with live conversion.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => onCurrencyChange(c.code)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 font-medium text-sm transition-all btn-press ${
                  currency === c.code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background hover:border-primary/40 text-foreground'
                }`}
              >
                <span className="text-lg">{CURRENCY_FLAGS[c.code] || '🌐'}</span>
                <span className="text-base">{c.symbol}</span>
                <span className="text-xs">{c.code}</span>
                {currency === c.code && <Check size={14} className="ml-auto text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Appearance ─── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          {isDark ? <Moon size={14} /> : <Sun size={14} />} Appearance
        </p>
        <div className="bg-card border border-border rounded-2xl p-5 card-hover flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Dark Mode</p>
            <p className="text-sm text-muted-foreground">Switch between cream and dark maroon themes</p>
          </div>
          <button
            onClick={onToggleDark}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 btn-press ${isDark ? 'bg-primary' : 'bg-muted'}`}
            aria-label="Toggle dark mode"
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>
      </section>

      {/* ─── Monthly Budgets ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Target size={14} /> Monthly Budgets
          </p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-border rounded-2xl p-4 card-hover">
            <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
            <p className="text-lg font-bold text-foreground truncate">{currencySymbol}{totalBudget.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 card-hover">
            <p className="text-xs text-muted-foreground mb-1">Spent</p>
            <p className="text-lg font-bold text-foreground truncate">{currencySymbol}{Math.round(totalSpent).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 card-hover">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className={`text-lg font-bold truncate ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {currencySymbol}{Math.round(remaining).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const limit = budgets[cat] || 0;
            const spent = thisMonthByCategory[cat] || 0;
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            const isEditing = editingBudget === cat;
            const overspent = limit > 0 && spent > limit;

            return (
              <div
                key={cat}
                className="bg-card border border-border rounded-2xl p-5 card-hover relative animate-in"
              >
                {overspent && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-red-500 px-2 py-0.5 rounded-full">
                    Overspent
                  </span>
                )}
                <button
                  onClick={() => setEditingBudget(isEditing ? null : cat)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold"
                  aria-label={`Edit ${cat} budget`}
                >
                  {isEditing ? '✕' : '✏️'}
                </button>

                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-sm"
                    style={{ backgroundColor: `${cfg.color}1F`, border: `1px solid ${cfg.color}33` }}
                  >
                    {cfg.icon}
                  </div>
                  <p className="font-bold text-foreground">{cat}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currencySymbol}{Math.round(spent).toLocaleString('en-IN')} / {limit > 0 ? `${currencySymbol}${limit.toLocaleString('en-IN')}` : 'No limit'}
                  </p>

                  {limit > 0 && (
                    <div className="my-3">
                      <BudgetRing pct={pct} color={cfg.color} />
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full mt-3">
                      <span className="text-muted-foreground text-sm">{currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={budgetInputs[cat]}
                        onChange={e => setBudgetInputs(prev => ({ ...prev, [cat]: e.target.value }))}
                        placeholder="Limit"
                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      <button
                        onClick={() => handleBudgetSave(cat)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all btn-press ${
                          savedBudgets[cat]
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                      >
                        {savedBudgets[cat] ? <Check size={16} /> : 'Save'}
                      </button>
                    </div>
                  ) : (
                    limit === 0 && (
                      <button
                        onClick={() => setEditingBudget(cat)}
                        className="text-xs text-primary font-semibold hover:underline mt-2"
                      >
                        + Set limit
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Recurring Expenses ─── */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <RefreshCw size={14} /> Recurring Expenses
        </p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden card-hover">
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
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{CATEGORY_CONFIG[t.category]?.icon || '📦'}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{t.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {currencySymbol}{t.amount} · {t.frequency} · next on {t.nextDate}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteRecurring(t.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Delete recurring template"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ─── Data & Privacy ─── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Database size={14} /> Data & Privacy
        </p>
        <div className="bg-card border border-border rounded-2xl card-hover divide-y divide-border">
          <button
            onClick={() => downloadCSV(expenses)}
            disabled={expenses.length === 0}
            className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div>
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Download size={16} className="text-accent" /> Export my data
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Download all expenses as CSV</p>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>

          {confirmClear ? (
            <div className="p-5 space-y-3">
              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>This will permanently delete all your expenses, budgets, and recurring templates. This cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors btn-press"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-colors disabled:opacity-60 btn-press"
                >
                  {clearing ? 'Clearing…' : 'Yes, delete all'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center justify-between p-5 hover:bg-destructive/5 transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-destructive flex items-center gap-2">
                  <Trash2 size={16} /> Clear all data
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">Permanently delete all your records</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">SpendSmart {APP_VERSION}</p>
      </section>

      {/* ─── Account ─── */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Account</p>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 text-destructive font-semibold border border-destructive/20 hover:bg-destructive/15 transition-colors btn-press"
        >
          <LogOut size={18} /> Log Out
        </button>
      </section>
    </div>
  );
}

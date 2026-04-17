import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Target, Wallet, AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from 'recharts';
import type { Expense } from '../hooks/use-expenses';
import type { BudgetGoals } from '../hooks/use-budgets';

interface DashboardProps {
  expenses: Expense[];
  totalSpent: number;
  topCategory: string;
  categoryBreakdown: { name: string; value: number }[];
  thisMonthByCategory: Record<string, number>;
  last7DaysData: { name: string; amount: number }[];
  onNavigateToExpenses: () => void;
  budgets: BudgetGoals;
  formatAmount: (n: number) => string;
}

const COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#94a3b8', '#cbd5e1'
];

function BudgetProgressBar({ category, spent, limit, formatAmount }: {
  category: string; spent: number; limit: number; formatAmount: (n: number) => string;
}) {
  const pct = Math.min((spent / limit) * 100, 100);
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-foreground flex items-center gap-1.5">
          {category}
          {pct >= 100 && <AlertCircle size={14} className="text-red-500" />}
          {pct >= 80 && pct < 100 && <AlertTriangle size={14} className="text-yellow-500" />}
        </span>
        <span className="text-muted-foreground">
          {formatAmount(spent)} / {formatAmount(limit)}
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full budget-bar-fill ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 text-right">{Math.round(pct)}% used</p>
    </div>
  );
}

export function Dashboard({
  expenses, totalSpent, topCategory, categoryBreakdown,
  thisMonthByCategory, last7DaysData, onNavigateToExpenses,
  budgets, formatAmount
}: DashboardProps) {

  // Compute budget alerts
  const alerts = Object.entries(budgets).map(([cat, limit]) => {
    const spent = thisMonthByCategory[cat] || 0;
    const pct = (spent / limit) * 100;
    return { cat, spent, limit, pct };
  }).filter(a => a.pct >= 80);

  const budgetCategories = Object.entries(budgets);

  if (expenses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Wallet className="text-primary w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No expenses yet!</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Click "Add Expense" to start tracking where your money goes.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 pb-24 md:pb-10">

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(({ cat, spent, limit, pct }) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm ${
                pct >= 100
                  ? 'bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400'
                  : 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-800 dark:text-yellow-300'
              }`}
            >
              {pct >= 100
                ? <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
                : <AlertTriangle size={18} className="flex-shrink-0 text-yellow-500" />}
              <span>
                {pct >= 100
                  ? `Budget exceeded for ${cat}! Spent ${formatAmount(spent)} of ${formatAmount(limit)}.`
                  : `${cat} is at ${Math.round(pct)}% of budget (${formatAmount(spent)} / ${formatAmount(limit)}).`}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <TrendingUp size={20} />
            </div>
            <span className="font-medium">Total Spent</span>
          </div>
          <div className="text-4xl font-bold text-foreground">{formatAmount(totalSpent)}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <div className="p-2 bg-accent/20 rounded-lg text-accent">
              <Target size={20} />
            </div>
            <span className="font-medium">Top Category</span>
          </div>
          <div className="text-3xl font-bold text-foreground truncate">{topCategory}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
              <ArrowRightLeft size={20} />
            </div>
            <span className="font-medium">Transactions</span>
          </div>
          <div className="text-4xl font-bold text-foreground">{expenses.length}</div>
        </motion.div>
      </div>

      {/* Budget Progress */}
      {budgetCategories.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-foreground">Monthly Budget Progress</h3>
          <div className="space-y-5">
            {budgetCategories.map(([cat, limit]) => (
              <BudgetProgressBar
                key={cat}
                category={cat}
                spent={thisMonthByCategory[cat] || 0}
                limit={limit}
                formatAmount={formatAmount}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-foreground">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => formatAmount(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.15)', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryBreakdown.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-foreground">Last 7 Days</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(val) => formatAmount(val)} />
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.15)', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  formatter={(value: number) => [formatAmount(value), 'Spent']}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center mt-4">
        <button onClick={onNavigateToExpenses} className="text-primary hover:text-primary/80 font-medium hover:underline">
          View all expenses →
        </button>
      </div>
    </div>
  );
}

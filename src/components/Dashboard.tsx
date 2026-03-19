import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ArrowRightLeft, Target, Wallet } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer 
} from 'recharts';
import type { Expense } from '../hooks/use-expenses';

interface DashboardProps {
  expenses: Expense[];
  totalSpent: number;
  topCategory: string;
  categoryBreakdown: { name: string; value: number }[];
  last7DaysData: { name: string; amount: number }[];
  onNavigateToExpenses: () => void;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#94a3b8', '#cbd5e1'];

export function Dashboard({ expenses, totalSpent, topCategory, categoryBreakdown, last7DaysData, onNavigateToExpenses }: DashboardProps) {
  
  if (expenses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Wallet className="text-primary w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No expenses yet!</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Your dashboard is looking a little empty. Click the "Add Expense" button to start tracking where your money goes.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 pb-24 md:pb-10">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <IndianRupee size={20} />
            </div>
            <span className="font-medium">Total Spent</span>
          </div>
          <div className="text-4xl font-bold text-foreground">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
              <Target size={20} />
            </div>
            <span className="font-medium">Top Category</span>
          </div>
          <div className="text-3xl font-bold text-foreground truncate">
            {topCategory}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
              <ArrowRightLeft size={20} />
            </div>
            <span className="font-medium">Transactions</span>
          </div>
          <div className="text-4xl font-bold text-foreground">
            {expenses.length}
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown (Donut) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-border shadow-sm"
        >
          <h3 className="text-xl font-bold mb-6">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => `₹${value}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryBreakdown.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Last 7 Days (Bar Chart) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl border border-border shadow-sm"
        >
          <h3 className="text-xl font-bold mb-6">Last 7 Days</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value}`, 'Spent']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 6, 6]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      <div className="flex justify-center mt-4">
        <button 
          onClick={onNavigateToExpenses}
          className="text-primary hover:text-primary/80 font-medium hover:underline"
        >
          View all expenses →
        </button>
      </div>
    </div>
  );
}

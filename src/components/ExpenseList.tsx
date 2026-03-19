import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Calendar, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Expense, ExpenseCategory } from '../hooks/use-expenses';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const CATEGORIES: ('All' | ExpenseCategory)[] = ['All', 'Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Health', 'Other'];

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<'All' | ExpenseCategory>('All');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => filterCat === 'All' || e.category === filterCat)
      .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, search, filterCat]);

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value as any)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none shadow-sm"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {expenses.length === 0 ? "You haven't added any expenses yet." : "No expenses match your search."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence>
              {filteredExpenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg">{expense.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                          {expense.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(parseISO(expense.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="text-xl font-bold text-foreground">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </div>
                    
                    {confirmingId === expense.id ? (
                      <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-semibold">Sure?</span>
                        <button 
                          onClick={() => onDelete(expense.id)}
                          className="hover:underline font-bold text-sm"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => setConfirmingId(null)}
                          className="hover:underline font-bold text-sm ml-1"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(expense.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

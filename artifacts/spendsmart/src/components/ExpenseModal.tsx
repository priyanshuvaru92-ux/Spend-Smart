import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ExpenseCategory } from '../hooks/use-expenses';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: { name: string; amount: number; category: ExpenseCategory; date: string }) => void;
}

const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Health', 'Other'];

const TODAY = () => new Date().toISOString().split("T")[0];

export function ExpenseModal({ isOpen, onClose, onSave }: ExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(TODAY());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName('');
      setAmount('');
      setCategory('Food');
      setDate(TODAY());
      setErrors({});
    }
  }, [isOpen]);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) newErrors.amount = 'Enter a valid amount';
    if (!date) newErrors.date = 'Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      amount: Number(amount),
      category,
      date,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-border"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h2 className="text-xl font-bold">Add New Expense</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">What did you spend on?</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="e.g., Masala Dosa at Canteen"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                      }}
                      placeholder="0.00"
                      min="0"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                  {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount}</p>}
                </div>

                {/* Category & Date Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                      }}
                      max={TODAY()}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    {errors.date && <p className="text-destructive text-xs mt-1">{errors.date}</p>}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Save Expense
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

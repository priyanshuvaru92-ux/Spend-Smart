import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, RefreshCw } from 'lucide-react';
import type { ExpenseCategory } from '../hooks/use-expenses';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: {
    name: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    isRecurring?: boolean;
    frequency?: 'Daily' | 'Weekly' | 'Monthly';
    receiptImage?: string;
  }) => void;
  currencySymbol: string;
  convertToINR: (amount: number) => number;
}

const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Health', 'Other'];
const TODAY = () => new Date().toISOString().split('T')[0];

interface FormState {
  name: string;
  amount: string;
  category: string;
  date: string;
  isRecurring: boolean;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  receiptImage: string;
}

const INITIAL_FORM: FormState = {
  name: '', amount: '', category: '', date: TODAY(),
  isRecurring: false, frequency: 'Monthly', receiptImage: '',
};

async function extractReceiptWithGemini(base64: string, mimeType: string): Promise<{ name?: string; amount?: string; date?: string } | null> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Look at this receipt image. Extract: total amount (number only, no currency symbol), date (YYYY-MM-DD format), and merchant or item name. Reply ONLY with valid JSON, no markdown: {"amount":"123.45","date":"2024-01-15","name":"Store Name"}. If a field is not found use empty string.' },
              { inlineData: { mimeType, data: base64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        })
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    let text: string = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch { return null; }
}

export function ExpenseModal({ isOpen, onClose, onSave, currencySymbol, convertToINR }: ExpenseModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setForm({ ...INITIAL_FORM, date: TODAY() }); setErrors({}); }
  }, [isOpen]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setForm(f => ({ ...f, receiptImage: dataUrl }));

      setOcrLoading(true);
      const extracted = await extractReceiptWithGemini(base64, file.type);
      setOcrLoading(false);
      if (extracted) {
        setForm(f => ({
          ...f,
          receiptImage: dataUrl,
          name: extracted.name || f.name,
          amount: extracted.amount || f.amount,
          date: extracted.date || f.date,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      newErrors.amount = 'Enter a valid amount';
    if (!form.category) newErrors.category = 'Select a category';
    if (!form.date) newErrors.date = 'Date is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const enteredAmount = Number(form.amount);
    const amountInINR = currencySymbol === '₹' ? enteredAmount : convertToINR(enteredAmount);

    onSave({
      name: form.name.trim(),
      amount: Math.round(amountInINR * 100) / 100,
      category: form.category as ExpenseCategory,
      date: form.date,
      isRecurring: form.isRecurring || undefined,
      frequency: form.isRecurring ? form.frequency : undefined,
      receiptImage: form.receiptImage || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-border max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5 sticky top-0">
                <h2 className="text-xl font-bold text-foreground">Add New Expense</h2>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Receipt Scanner</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={ocrLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-accent/60 text-accent font-semibold text-sm hover:bg-accent/10 transition-colors disabled:opacity-50"
                    >
                      {ocrLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                      {ocrLoading ? 'Scanning…' : 'Upload Receipt'}
                    </button>
                    {form.receiptImage && (
                      <img src={form.receiptImage} alt="Receipt" className="w-12 h-12 object-cover rounded-lg border border-border" />
                    )}
                    {ocrLoading && <span className="text-xs text-muted-foreground">AI extracting details…</span>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
                  <p className="text-xs text-muted-foreground mt-1">AI will auto-fill fields from your receipt photo.</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">What did you spend on?</label>
                  <input
                    type="text" value={form.name} onChange={set('name')}
                    placeholder="e.g., Masala Dosa at Canteen"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">
                    Amount ({currencySymbol})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{currencySymbol}</span>
                    <input
                      type="number" value={form.amount} onChange={set('amount')}
                      placeholder="0.00" min="0"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                  {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount}</p>}
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    >
                      <option value="" disabled>Select…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Date</label>
                    <input
                      type="date" value={form.date} max={TODAY()}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    {errors.date && <p className="text-destructive text-xs mt-1">{errors.date}</p>}
                  </div>
                </div>

                {/* Recurring Toggle */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="text-accent" />
                      <span className="font-semibold text-sm text-foreground">Recurring Expense</span>
                    </div>
                    <button
                      onClick={() => setForm(f => ({ ...f, isRecurring: !f.isRecurring }))}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.isRecurring ? 'bg-primary' : 'bg-border'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${form.isRecurring ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {form.isRecurring && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Frequency</label>
                      <div className="flex gap-2">
                        {(['Daily', 'Weekly', 'Monthly'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setForm(prev => ({ ...prev, frequency: f }))}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              form.frequency === f
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border text-muted-foreground hover:border-primary/40'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="pt-2">
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

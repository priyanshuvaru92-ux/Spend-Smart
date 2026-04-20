import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Loader2, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
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

// Map Gemini category labels to app categories
const GEMINI_CATEGORY_MAP: Record<string, ExpenseCategory> = {
  food: 'Food',
  travel: 'Transport',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Other',
  health: 'Health',
  education: 'Education',
  entertainment: 'Entertainment',
  other: 'Other',
};

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

interface ScanResult {
  amount: number | null;
  date: string | null;
  merchant: string | null;
  category: string | null;
}

async function scanReceiptWithGemini(imageFile: File): Promise<ScanResult> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) throw new Error('No API key');

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: imageFile.type,
                data: base64Data,
              }
            },
            {
              text: `This is a receipt image. Extract details and reply ONLY in pure JSON with no markdown, no backticks, no extra text:
{
  "amount": number or null,
  "date": "YYYY-MM-DD" or null,
  "merchant": "store name" or null,
  "category": "Food/Travel/Shopping/Bills/Health/Other"
}`
            }
          ]
        }],
        generationConfig: { temperature: 0.1 }
      })
    }
  );

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  const rawText: string = data.candidates[0].content.parts[0].text;
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as ScanResult;
}

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

export function ExpenseModal({ isOpen, onClose, onSave, currencySymbol, convertToINR }: ExpenseModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...INITIAL_FORM, date: TODAY() });
      setErrors({});
      setScanStatus('idle');
    }
  }, [isOpen]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, receiptImage: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);

    setScanStatus('scanning');
    try {
      const result = await scanReceiptWithGemini(file);
      setForm(f => ({
        ...f,
        amount: result.amount != null ? String(result.amount) : f.amount,
        date: result.date || f.date,
        name: result.merchant || f.name,
        category: result.category
          ? (GEMINI_CATEGORY_MAP[result.category.toLowerCase()] ?? f.category)
          : f.category,
      }));
      setScanStatus('success');
    } catch {
      setScanStatus('error');
    }
    // reset file input so re-uploading same file works
    if (fileRef.current) fileRef.current.value = '';
    URL.revokeObjectURL(previewUrl);
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

                {/* Receipt Scanner */}
                <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Receipt size={16} className="text-accent" />
                      Receipt Scanner
                    </label>
                    {form.receiptImage && (
                      <img src={form.receiptImage} alt="Receipt preview" className="w-12 h-12 object-cover rounded-xl border border-border shadow-sm" />
                    )}
                  </div>

                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={scanStatus === 'scanning'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary font-semibold text-sm hover:bg-primary/10 hover:border-primary/70 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {scanStatus === 'scanning' ? (
                      <><Loader2 size={16} className="animate-spin" /> 🔍 Scanning receipt with Gemini AI...</>
                    ) : (
                      <><Receipt size={16} /> 🧾 Upload Receipt</>
                    )}
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleReceiptUpload}
                  />

                  {/* Feedback messages */}
                  {scanStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2 rounded-lg"
                    >
                      <CheckCircle2 size={15} className="flex-shrink-0" />
                      ✅ Receipt scanned! Please verify the details.
                    </motion.div>
                  )}
                  {scanStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 px-3 py-2 rounded-lg"
                    >
                      <AlertTriangle size={15} className="flex-shrink-0" />
                      ⚠️ Could not read receipt. Please fill manually.
                    </motion.div>
                  )}
                  {scanStatus === 'idle' && (
                    <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP, PDF. Gemini AI extracts amount, date, merchant & category.</p>
                  )}
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

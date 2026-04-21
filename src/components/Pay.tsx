import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, CheckCircle2, ChevronRight, Smartphone, Trash2 } from 'lucide-react';
import {
  PAY_CATEGORIES, PAY_GROUPS, UPI_APPS, buildUpiLink,
  type PayCategory, type UpiApp,
} from '../lib/payCategories';
import type { Expense } from '../hooks/use-expenses';
import type { BudgetGoals } from '../hooks/use-budgets';
import { useUpiContacts, type UpiContact } from '../hooks/use-upi-contacts';

interface PayProps {
  userId: string;
  expenses: Expense[];
  budgets: BudgetGoals;
  thisMonthByCategory: Record<string, number>;
  currencySymbol: string;
  formatAmount: (n: number) => string;
  onAddExpense: (data: Omit<Expense, 'id'>) => void | Promise<void>;
  onNavigateDashboard: () => void;
}

const isMobile = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

type Step = 'payee' | 'log' | 'success' | 'desktop';

export function Pay({
  userId, expenses, budgets, thisMonthByCategory,
  currencySymbol, formatAmount, onAddExpense, onNavigateDashboard,
}: PayProps) {
  const { contacts, saveContact, updateLastPaid, deleteContact } = useUpiContacts(userId);

  const [activeCategory, setActiveCategory] = useState<PayCategory | null>(null);
  const [step, setStep] = useState<Step>('payee');
  const [payeeName, setPayeeName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [savePayee, setSavePayee] = useState(false);
  const [selectedApp, setSelectedApp] = useState<UpiApp['id'] | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [savedContactId, setSavedContactId] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<{ amount: number; cat: PayCategory; remaining: number } | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  // ── Stats for top bar ────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalSpentToday = useMemo(
    () => expenses.filter(e => e.date === todayStr).reduce((s, e) => s + e.amount, 0),
    [expenses, todayStr]
  );
  const totalBudget = useMemo(() => Object.values(budgets).reduce((s, n) => s + n, 0), [budgets]);
  const totalSpentMonth = useMemo(
    () => Object.entries(budgets).reduce((s, [cat]) => s + (thisMonthByCategory[cat] || 0), 0),
    [budgets, thisMonthByCategory]
  );
  const budgetRemaining = totalBudget - totalSpentMonth;

  // ── Recent UPI payments (last 5) ─────────────────────────────
  const recentPayments = useMemo(
    () => expenses.filter(e => e.paymentMethod === 'upi').slice(0, 5),
    [expenses]
  );

  // ── Payees-by-category lookup for badge dots ─────────────────
  const payeesByCategory = useMemo(() => {
    const map: Record<string, UpiContact[]> = {};
    contacts.forEach(c => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return map;
  }, [contacts]);

  // ── Open category sheet ──────────────────────────────────────
  const openCategory = (cat: PayCategory, prefill?: { name?: string; upiId?: string }) => {
    setActiveCategory(cat);
    setStep('payee');
    setPayeeName(prefill?.name ?? '');
    setUpiId(prefill?.upiId ?? '');
    setSavePayee(false);
    setSelectedApp(null);
    setAmount('');
    setNote('');
    setSavedContactId(null);
  };

  const closeSheet = () => {
    setActiveCategory(null);
    setStep('payee');
  };

  // ── Step 1 → Open UPI app or show desktop fallback ───────────
  const handleOpenApp = async (app: UpiApp['id']) => {
    if (!activeCategory) return;
    setSelectedApp(app);

    // Save payee if requested (before opening app, async)
    if (savePayee && upiId.trim()) {
      const newC = await saveContact({
        name: payeeName,
        upiId: upiId,
        category: activeCategory.id,
      });
      if (newC) setSavedContactId(newC.id);
    }

    if (!isMobile()) {
      setStep('desktop');
      return;
    }

    // Trigger UPI app
    const link = buildUpiLink(app, upiId.trim(), payeeName.trim());
    window.location.href = link;

    // After 1.5s show log step
    setTimeout(() => {
      setStep('log');
      setTimeout(() => amountRef.current?.focus(), 100);
    }, 1500);
  };

  // ── Step 3 → Log payment ─────────────────────────────────────
  const handleLogPayment = async () => {
    if (!activeCategory) return;
    const num = Number(amount);
    if (!num || num <= 0) return;

    const finalNote = note.trim() || activeCategory.label;
    const merchantName = payeeName.trim() || activeCategory.label;

    await onAddExpense({
      name: merchantName,
      amount: Math.round(num * 100) / 100,
      category: activeCategory.expenseCategory,
      date: todayStr,
      paymentMethod: 'upi',
      paidVia: selectedApp || undefined,
      note: finalNote,
    });

    // Update saved contact's last paid amount
    if (savedContactId) {
      updateLastPaid(savedContactId, num);
    } else {
      const existing = contacts.find(c => c.upiId.toLowerCase() === upiId.trim().toLowerCase());
      if (existing) updateLastPaid(existing.id, num);
    }

    // Compute remaining for active category
    const limit = budgets[activeCategory.expenseCategory] || 0;
    const spent = (thisMonthByCategory[activeCategory.expenseCategory] || 0) + num;
    const remaining = limit > 0 ? limit - spent : 0;

    setLastSuccess({ amount: num, cat: activeCategory, remaining });
    setStep('success');
    setTimeout(() => {
      closeSheet();
      setLastSuccess(null);
    }, 1800);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-10 pb-28 md:pb-10 max-w-5xl mx-auto w-full space-y-8 page-enter">

      {/* Quick balance bar */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onNavigateDashboard}
          className="bg-card border border-border rounded-2xl p-4 text-left card-hover btn-press"
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
            Budget Remaining
          </p>
          <p className="text-2xl font-bold" style={{ color: '#C5A028' }}>
            {currencySymbol}{Math.round(budgetRemaining).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </button>
        <button
          onClick={onNavigateDashboard}
          className="bg-card border border-border rounded-2xl p-4 text-left card-hover btn-press"
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
            Spent Today
          </p>
          <p className="text-2xl font-bold text-primary">
            {currencySymbol}{Math.round(totalSpentToday).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">View dashboard →</p>
        </button>
      </div>

      {/* Recent payments */}
      {recentPayments.length > 0 && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Recent Payments
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {recentPayments.map(e => {
              const cat = PAY_CATEGORIES.find(c => c.expenseCategory === e.category) || PAY_CATEGORIES.find(c => c.id === 'other')!;
              return (
                <button
                  key={e.id}
                  onClick={() => openCategory(cat, { name: e.name })}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all btn-press"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[100px]">{e.name}</p>
                    <p className="text-[10px] text-muted-foreground">{currencySymbol}{Math.round(e.amount)} · {e.date.slice(5)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Saved Payees */}
      {contacts.length > 0 && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Saved Payees
          </p>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden card-hover">
            {contacts.slice(0, 6).map(c => {
              const cat = PAY_CATEGORIES.find(p => p.id === c.category) || PAY_CATEGORIES.find(p => p.id === 'other')!;
              const initials = (c.name || c.upiId).slice(0, 2).toUpperCase();
              return (
                <div key={c.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <button
                    onClick={() => openCategory(cat, { name: c.name, upiId: c.upiId })}
                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.upiId}</p>
                    </div>
                    {c.lastPaidAmount && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        Last: {currencySymbol}{Math.round(c.lastPaidAmount)}
                      </span>
                    )}
                    <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
                  </button>
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                    aria-label="Delete payee"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories grouped grid */}
      <section className="space-y-7">
        {PAY_GROUPS.map(group => {
          const cats = PAY_CATEGORIES.filter(c => c.group === group);
          if (cats.length === 0) return null;
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {group}
                </p>
                <div className="h-px bg-border flex-1" />
              </div>
              <div className="flex md:grid gap-3 overflow-x-auto md:overflow-visible md:grid-cols-4 -mx-1 px-1 pb-2 md:pb-0 scrollbar-hide">
                {cats.map(cat => {
                  const hasPayees = (payeesByCategory[cat.id]?.length || 0) > 0;
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => openCategory(cat)}
                      className="flex-shrink-0 w-32 md:w-auto bg-card border border-border rounded-2xl p-3 text-center relative overflow-hidden btn-press"
                      style={{ borderTop: `3px solid ${cat.color}` }}
                    >
                      {hasPayees && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 ring-2 ring-card" />
                      )}
                      <div className="text-3xl mb-1.5 leading-none">{cat.icon}</div>
                      <p className="text-[13px] font-bold text-foreground leading-tight">{cat.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">{cat.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ─── Bottom Sheet ──────────────────────────────────── */}
      <AnimatePresence>
        {activeCategory && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3">
                <div className="w-10 h-1.5 rounded-full bg-muted" />
              </div>

              {/* Header */}
              <div className="px-6 py-4 flex items-center gap-3 border-b border-border">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${activeCategory.color}1F`, border: `1px solid ${activeCategory.color}33` }}
                >
                  {activeCategory.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-lg leading-tight">{activeCategory.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{activeCategory.desc}</p>
                </div>
                <button
                  onClick={closeSheet}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-5 max-w-lg mx-auto w-full">
                {/* STEP 1 — Payee details */}
                {step === 'payee' && (
                  <div className="space-y-4">
                    {/* Saved payees quick-select */}
                    {(payeesByCategory[activeCategory.id] || []).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Quick select</p>
                        <div className="flex flex-wrap gap-2">
                          {payeesByCategory[activeCategory.id].map(c => (
                            <button
                              key={c.id}
                              onClick={() => { setPayeeName(c.name); setUpiId(c.upiId); }}
                              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 hover:bg-primary/20 transition-colors btn-press"
                            >
                              {c.name || c.upiId}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">
                        Payee Name <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={payeeName}
                        onChange={e => setPayeeName(e.target.value)}
                        placeholder="e.g., Amma's Tiffin"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="name@okaxis"
                        autoCapitalize="off"
                        autoCorrect="off"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>

                    {upiId.trim() && (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={savePayee}
                          onChange={e => setSavePayee(e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm text-foreground">Save this payee for next time</span>
                      </label>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 mt-2">Pay using</p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {UPI_APPS.map(app => (
                          <button
                            key={app.id}
                            onClick={() => handleOpenApp(app.id)}
                            className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border hover:border-primary/60 transition-all btn-press"
                            style={{ borderColor: selectedApp === app.id ? app.color : undefined }}
                          >
                            <span className="text-2xl leading-none">{app.emoji}</span>
                            <span className="text-[11px] font-semibold text-foreground">{app.label}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 text-center">
                        Amount is entered inside your UPI app, not here.
                      </p>
                    </div>
                  </div>
                )}

                {/* DESKTOP fallback */}
                {step === 'desktop' && selectedApp && (
                  <div className="text-center space-y-4 py-2">
                    <Smartphone className="mx-auto text-primary" size={36} />
                    <p className="font-semibold text-foreground">UPI Pay works on mobile</p>
                    <p className="text-sm text-muted-foreground">Scan this QR with your phone to open the UPI app.</p>
                    {upiId.trim() ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(buildUpiLink(selectedApp, upiId.trim(), payeeName.trim()))}`}
                        alt="UPI QR code"
                        className="mx-auto rounded-xl border border-border bg-white p-2"
                        width={200} height={200}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Enter a UPI ID first to generate a QR.</p>
                    )}
                    <button
                      onClick={() => { setStep('log'); setTimeout(() => amountRef.current?.focus(), 100); }}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold btn-press"
                    >
                      I've Paid → Log Amount
                    </button>
                  </div>
                )}

                {/* STEP 3 — Log payment */}
                {step === 'log' && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <p className="text-3xl mb-1">💸</p>
                      <p className="font-bold text-foreground text-lg">Payment done?</p>
                      <p className="text-sm text-muted-foreground">How much did you pay?</p>
                    </div>

                    <div>
                      <div className="relative flex items-center justify-center">
                        <span className="absolute left-1/2 -translate-x-[80px] top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <input
                          ref={amountRef}
                          type="number"
                          inputMode="decimal"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full text-center text-4xl font-bold py-5 rounded-2xl bg-background border-2 border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">
                        Note <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder={activeCategory.label}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={closeSheet}
                        className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-muted transition-colors btn-press"
                      >
                        ❌ Cancel
                      </button>
                      <button
                        onClick={handleLogPayment}
                        disabled={!amount || Number(amount) <= 0}
                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors btn-press"
                      >
                        ✅ Log Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* SUCCESS screen */}
                {step === 'success' && lastSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-2"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className="mx-auto w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center"
                    >
                      <CheckCircle2 size={48} className="text-green-500" />
                    </motion.div>
                    <p className="text-3xl font-bold text-foreground">
                      {formatAmount(lastSuccess.amount)} logged!
                    </p>
                    <p className="text-foreground">
                      <span className="text-2xl mr-1">{lastSuccess.cat.icon}</span>
                      {lastSuccess.cat.label}
                    </p>
                    {lastSuccess.remaining > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {lastSuccess.cat.expenseCategory} budget remaining: {formatAmount(lastSuccess.remaining)}
                      </p>
                    )}
                    {lastSuccess.remaining < 0 && (
                      <p className="text-sm text-red-500 font-semibold">
                        Over budget by {formatAmount(Math.abs(lastSuccess.remaining))}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

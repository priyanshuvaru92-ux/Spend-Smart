import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import type { Expense } from '../hooks/use-expenses';
import type { BudgetGoals } from '../hooks/use-budgets';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

interface ChatBotProps {
  expenses: Expense[];
  budgets: BudgetGoals;
  userName: string;
}

function buildExpenseContext(expenses: Expense[], budgets: BudgetGoals): string {
  if (expenses.length === 0) return 'No expenses recorded yet.';

  // Total and category breakdown
  const categoryTotals: Record<string, number> = {};
  const monthlyTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    const month = e.date.slice(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + e.amount;
  });

  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const categoryLines = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `${cat}: Rs${Math.round(amt)}`)
    .join(', ');

  const monthLines = Object.entries(monthlyTotals)
    .sort()
    .slice(-3)
    .map(([m, amt]) => `${m}: Rs${Math.round(amt)}`)
    .join(', ');

  // Last 20 expenses (most recent)
  const recent = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)
    .map(e => `${e.date} | ${e.category} | ${e.name} | Rs${e.amount}`)
    .join('\n');

  const budgetLines = Object.entries(budgets).length > 0
    ? Object.entries(budgets).map(([cat, limit]) => {
        const spent = categoryTotals[cat] || 0;
        return `${cat}: spent Rs${Math.round(spent)} of Rs${limit} limit`;
      }).join(', ')
    : 'No budgets set.';

  return [
    `Total expenses: ${expenses.length} transactions, Rs${Math.round(total)} total.`,
    `Category breakdown: ${categoryLines}.`,
    `Monthly totals (recent): ${monthLines}.`,
    `Budget goals: ${budgetLines}.`,
    `Recent transactions:\n${recent}`,
  ].join('\n');
}

async function askGemini(userMessage: string, expenses: Expense[], budgets: BudgetGoals): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) return "API key not found. Please make sure VITE_GEMINI_API_KEY is set in your environment secrets.";

  const context = buildExpenseContext(expenses, budgets);
  const today = new Date().toISOString().split('T')[0];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a smart personal finance assistant for the Spend Smart app. Be concise, friendly, and helpful. Avoid excessive markdown symbols. Use plain text or simple bullet points.

Today's date: ${today}

USER'S FINANCIAL DATA:
${context}

USER'S QUESTION: ${userMessage}`
          }]
        }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => response.status.toString());
    throw new Error(`Gemini API returned ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // Surface any API-level error
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I didn't get a response. Please try again.";
}

const SUGGESTED_QUESTIONS = [
  "How much did I spend this month?",
  "What's my biggest expense category?",
  "Give me tips to save money",
  "Am I over budget anywhere?",
];

export function ChatBot({ expenses, budgets, userName }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: `Hi ${userName.split(' ')[0]}! 👋 I'm your AI finance assistant. Ask me anything about your spending — like "How much did I spend on food?" or "Give me savings tips!"`,
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await askGemini(trimmed, expenses, budgets);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', text: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'ai',
        text: `⚠️ Error: ${msg}`,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm flex flex-col bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: 'min(520px, calc(100vh - 160px))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-primary text-primary-foreground flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">SpendSmart AI</p>
                <p className="text-xs text-primary-foreground/70 leading-tight">Powered by Gemini</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <Bot size={14} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 rounded-full bg-muted-foreground/60 block"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions (shown when only welcome message) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-2 flex-shrink-0 bg-card">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your spending..."
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50 placeholder:text-muted-foreground"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md shadow-primary/20"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-xl shadow-primary/40 flex items-center justify-center text-primary-foreground"
        aria-label="Open AI Finance Chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={24} />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Unread indicator pulse */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent border-2 border-card">
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
          </span>
        )}
      </motion.button>
    </>
  );
}

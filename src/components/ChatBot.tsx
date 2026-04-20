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

async function askGemini(userMessage: string, expenses: Expense[], budgets: BudgetGoals): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) return "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment.";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a smart personal finance assistant for the Spend Smart app. Be concise, friendly, and helpful. Format responses clearly but avoid excessive markdown.

Here is the user's expense data: ${JSON.stringify(expenses)}
Here is the user's monthly budget goals: ${JSON.stringify(budgets)}

Today's date is: ${new Date().toISOString().split('T')[0]}

Answer this question helpfully and concisely: ${userMessage}`
          }]
        }],
        generationConfig: { temperature: 0.7 }
      })
    }
  );

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.candidates[0].content.parts[0].text as string;
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
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'ai',
        text: "Sorry, I couldn't reach Gemini right now. Please try again in a moment.",
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

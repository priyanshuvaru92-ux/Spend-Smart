import React from 'react';
import { Plus } from 'lucide-react';
import type { ViewState } from './Sidebar';

interface TopbarProps {
  currentView: ViewState;
  onAddExpense: () => void;
}

export function Topbar({ currentView, onAddExpense }: TopbarProps) {
  const titleMap: Record<ViewState, string> = {
    'dashboard': 'Dashboard',
    'expenses': 'All Expenses',
    'ai-analysis': 'AI Insights',
    'how-it-works': 'How It Works'
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{titleMap[currentView]}</h1>
      </div>
      <button
        onClick={onAddExpense}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
      >
        <Plus size={20} />
        <span className="hidden sm:inline">Add Expense</span>
      </button>
    </header>
  );
}

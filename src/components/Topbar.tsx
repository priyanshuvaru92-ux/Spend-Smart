import React from 'react';
import { Plus, Sun, Moon, LogOut } from 'lucide-react';
import type { ViewState } from './Sidebar';

interface TopbarProps {
  currentView: ViewState;
  onAddExpense: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  userName: string;
  onLogout: () => void;
}

export function Topbar({ currentView, onAddExpense, isDark, onToggleDark, userName, onLogout }: TopbarProps) {
  const titleMap: Record<ViewState, string> = {
    'dashboard': 'Dashboard',
    'expenses': 'All Expenses',
    'ai-analysis': 'AI Insights',
    'how-it-works': 'How It Works',
    'settings': 'Settings',
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="h-16 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-foreground">{titleMap[currentView]}</h1>
        {currentView === 'dashboard' && userName && (
          <p className="text-xs text-muted-foreground hidden sm:block">{greeting}, {userName.split(' ')[0]}! 👋</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Add Expense (not shown on settings) */}
        {currentView !== 'settings' && (
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        )}

        {/* Mobile logout */}
        <button
          onClick={onLogout}
          className="md:hidden p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          title="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

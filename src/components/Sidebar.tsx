import React from 'react';
import { clsx } from 'clsx';
import { LayoutDashboard, Receipt, Sparkles, Info, Wallet } from 'lucide-react';

export type ViewState = 'dashboard' | 'expenses' | 'ai-analysis' | 'how-it-works';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Sparkles },
    { id: 'how-it-works', label: 'How It Works', icon: Info },
  ] as const;

  return (
    <div className="w-64 h-screen bg-white border-r border-border hidden md:flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
          <Wallet size={24} strokeWidth={2} />
        </div>
        <span className="font-display font-bold text-2xl text-foreground">SpendSmart</span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={20} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
              {item.label}
            </button>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-border/50">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <h4 className="font-bold text-indigo-900 text-sm mb-1">Student Pro Tip</h4>
          <p className="text-xs text-indigo-700">Save 20% of your allowance right when you receive it!</p>
        </div>
      </div>
    </div>
  );
}

// Mobile Bottom Nav
export function MobileNav({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'ai-analysis', label: 'AI', icon: Sparkles },
    { id: 'how-it-works', label: 'Info', icon: Info },
  ] as const;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border pb-safe z-50 px-2 py-2 flex justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={clsx(
              "flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-all duration-200",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={clsx("p-1 rounded-full mb-1", isActive && "bg-primary/10")}>
              <Icon size={20} />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

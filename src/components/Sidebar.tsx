import React from 'react';
import { clsx } from 'clsx';
import { LayoutDashboard, Receipt, Sparkles, Info, Wallet, Settings, LogOut, Sun, Moon } from 'lucide-react';

export type ViewState = 'dashboard' | 'expenses' | 'ai-analysis' | 'how-it-works' | 'settings';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  userName: string;
}

export function Sidebar({ currentView, onNavigate, onLogout, isDark, onToggleDark, userName }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Sparkles },
    { id: 'how-it-works', label: 'How It Works', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="w-64 h-screen bg-card border-r border-border hidden md:flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
          <Wallet size={24} strokeWidth={2} />
        </div>
        <span className="font-display font-bold text-2xl text-foreground">SpendSmart</span>
      </div>

      {/* User greeting */}
      <div className="px-5 py-3 bg-primary/5 border-b border-border/30">
        <p className="text-xs text-muted-foreground">Signed in as</p>
        <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
      </div>

      <div className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
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

      <div className="p-4 border-t border-border/50 space-y-2">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
          <span className={`ml-auto relative w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-border'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
}

// Mobile Bottom Nav
interface MobileNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export function MobileNav({ currentView, onNavigate }: MobileNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'ai-analysis', label: 'AI', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe z-50 px-2 py-2 flex justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={clsx(
              "flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-all duration-200",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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

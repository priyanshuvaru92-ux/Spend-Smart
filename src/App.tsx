import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, MobileNav, type ViewState } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseModal } from "./components/ExpenseModal";
import { AIAnalysis } from "./components/AIAnalysis";
import { HowItWorks } from "./components/HowItWorks";
import { Settings } from "./components/Settings";
import { Auth } from "./components/Auth";
import { ChatBot } from "./components/ChatBot";
import { useExpenses } from "./hooks/use-expenses";
import { useAuth } from "./hooks/use-auth";
import { useBudgets } from "./hooks/use-budgets";
import { useCurrency } from "./hooks/use-currency";

export default function App() {
  const { toast } = useToast();

  // ── Auth ──────────────────────────────────────────────────────
  const { user, isLoaded: authLoaded, login, signup, logout, loginWithGoogle } = useAuth();

  // ── Dark Mode ─────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => localStorage.getItem('spendsmart_dark') === 'true');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('spendsmart_dark', String(isDark));
  }, [isDark]);

  const toggleDark = () => setIsDark(v => !v);

  // ── Expenses ──────────────────────────────────────────────────
  const {
    expenses, addExpense, deleteExpense,
    totalSpent, topCategory, categoryBreakdown,
    thisMonthByCategory, last7DaysData, isLoaded: expensesLoaded,
    recurringTemplates, deleteRecurring,
  } = useExpenses(user?.id);

  // ── Budgets ───────────────────────────────────────────────────
  const { budgets, setBudget } = useBudgets(user?.id);

  // ── Currency ──────────────────────────────────────────────────
  const {
    currency, currencyInfo, changeCurrency,
    convertToINR, formatAmount, CURRENCIES,
  } = useCurrency();

  // ── UI State ──────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSaveExpense = (expenseData: Parameters<typeof addExpense>[0]) => {
    addExpense(expenseData);
    toast({ title: "Saved!", description: "Expense added successfully." });
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast({ title: "Deleted", description: "Expense removed." });
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "See you soon!" });
  };

  // ── Loading / Auth Gates ──────────────────────────────────────
  if (!authLoaded) return null;

  if (!user) {
    return (
      <>
        <Auth onLogin={login} onSignup={signup} onGoogleLogin={loginWithGoogle} />
        <Toaster />
      </>
    );
  }

  if (!expensesLoaded) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleDark={toggleDark}
        userName={user.name}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <Topbar
          currentView={currentView}
          onAddExpense={() => setIsModalOpen(true)}
          isDark={isDark}
          onToggleDark={toggleDark}
          userName={user.name}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          {currentView === 'dashboard' && (
            <Dashboard
              expenses={expenses}
              totalSpent={totalSpent}
              topCategory={topCategory}
              categoryBreakdown={categoryBreakdown}
              thisMonthByCategory={thisMonthByCategory}
              last7DaysData={last7DaysData}
              onNavigateToExpenses={() => setCurrentView('expenses')}
              budgets={budgets}
              formatAmount={formatAmount}
            />
          )}
          {currentView === 'expenses' && (
            <ExpenseList
              expenses={expenses}
              onDelete={handleDeleteExpense}
              formatAmount={formatAmount}
            />
          )}
          {currentView === 'ai-analysis' && (
            <AIAnalysis expenses={expenses} />
          )}
          {currentView === 'how-it-works' && (
            <HowItWorks />
          )}
          {currentView === 'settings' && (
            <Settings
              currency={currency}
              currencies={CURRENCIES}
              onCurrencyChange={changeCurrency}
              budgets={budgets}
              onBudgetChange={setBudget}
              recurringTemplates={recurringTemplates}
              onDeleteRecurring={deleteRecurring}
              isDark={isDark}
              onToggleDark={toggleDark}
              currencySymbol={currencyInfo.symbol}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentView={currentView} onNavigate={setCurrentView} />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        currencySymbol={currencyInfo.symbol}
        convertToINR={convertToINR}
      />

      {/* AI Finance Chatbot — floats over all views */}
      <ChatBot expenses={expenses} budgets={budgets} userName={user.name} />

      <Toaster />
    </div>
  );
}

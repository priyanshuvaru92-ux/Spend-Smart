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
import { Intro } from "./components/Intro";
import { useExpenses } from "./hooks/use-expenses";

export default function App() {
  const { toast } = useToast();
  const { 
    expenses, 
    addExpense, 
    deleteExpense, 
    totalSpent, 
    topCategory, 
    categoryBreakdown, 
    last7DaysData,
    isLoaded 
  } = useExpenses();

  const [hasVisited, setHasVisited] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem('spendsmart_seen');
    if (!visited) {
      setHasVisited(false);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem('spendsmart_seen', 'true');
    setHasVisited(true);
  };

  const handleSaveExpense = (expenseData: Parameters<typeof addExpense>[0]) => {
    addExpense(expenseData);
    toast({
      title: "Success",
      description: "Expense added successfully!",
    });
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast({
      title: "Deleted",
      description: "Expense removed.",
    });
  };

  if (!isLoaded) return null; // Prevent flash

  if (!hasVisited) {
    return <Intro onStart={handleStart} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <Topbar 
          currentView={currentView} 
          onAddExpense={() => setIsModalOpen(true)} 
        />
        
        <main className="flex-1">
          {currentView === 'dashboard' && (
            <Dashboard 
              expenses={expenses}
              totalSpent={totalSpent}
              topCategory={topCategory}
              categoryBreakdown={categoryBreakdown}
              last7DaysData={last7DaysData}
              onNavigateToExpenses={() => setCurrentView('expenses')}
            />
          )}
          {currentView === 'expenses' && (
            <ExpenseList 
              expenses={expenses} 
              onDelete={handleDeleteExpense} 
            />
          )}
          {currentView === 'ai-analysis' && (
            <AIAnalysis expenses={expenses} />
          )}
          {currentView === 'how-it-works' && (
            <HowItWorks />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentView={currentView} onNavigate={setCurrentView} />

      {/* Modals & Toasts */}
      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
      />
      <Toaster />
    </div>
  );
}

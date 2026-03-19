import React from 'react';
import { Receipt, PieChart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function HowItWorks() {
  const steps = [
    {
      title: "1. Log Your Expenses",
      desc: "Hit the '+ Add Expense' button anytime you spend money. Categorize it as Food, Transport, Education, etc. to keep things organized.",
      icon: Receipt,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "2. View Your Dashboard",
      desc: "Check your Dashboard to see your total spending, top categories, and visually track where your money goes with beautiful charts.",
      icon: PieChart,
      color: "bg-pink-100 text-pink-600"
    },
    {
      title: "3. Get AI Insights",
      desc: "Once you have a few expenses, let Google's Gemini AI analyze your habits. It will generate personalized savings tips and warn you if you're overspending in certain areas.",
      icon: Sparkles,
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-display font-bold mb-4">How SpendSmart Works</h2>
        <p className="text-muted-foreground text-lg">Taking control of your student budget is as easy as 1-2-3.</p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                <Icon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 bg-primary/5 rounded-2xl p-6 md:p-8 border border-primary/10">
        <h3 className="text-lg font-bold text-primary mb-2">Privacy First</h3>
        <p className="text-muted-foreground text-sm">
          Your data is stored locally on your device using your browser's localStorage. 
          When you use the AI Analysis feature, only your expense categories and amounts are sent securely to the Gemini API for analysis.
        </p>
      </div>
    </div>
  );
}

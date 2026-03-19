import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, TrendingUp, Sparkles } from 'lucide-react';

interface IntroProps {
  onStart: () => void;
}

export function Intro({ onStart }: IntroProps) {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/intro-bg.png`}
          alt="Abstract Background" 
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30"
        >
          <Wallet size={40} strokeWidth={1.5} />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-foreground mb-6"
        >
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">SpendSmart</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl"
        >
          The ultimate AI-powered expense tracker designed specifically for Indian college students. 
          Manage your allowance, get smart insights, and stop wondering where your rupees went.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <button
            onClick={onStart}
            className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
          >
            Get Started
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
        >
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Track Easily</h3>
            <p className="text-muted-foreground text-sm">Log your daily expenses in seconds. Food, travel, or books.</p>
          </div>
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground mb-4">
              <Sparkles size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Insights</h3>
            <p className="text-muted-foreground text-sm">Let Gemini analyze your habits and give you personalized saving tips.</p>
          </div>
          <div className="glass-card p-6 rounded-3xl">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-4">
              <Wallet size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Stay on Budget</h3>
            <p className="text-muted-foreground text-sm">Visualize your spending with beautiful charts and stay in control.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

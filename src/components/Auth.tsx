import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Eye, EyeOff, ArrowRight, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<string | true>;
  onSignup: (name: string, email: string, password: string) => Promise<string | true>;
}

export function Auth({ onLogin, onSignup }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    const result = mode === 'login'
      ? await onLogin(email, password)
      : await onSignup(name, email, password);
    if (result !== true) {
      const msg = result as string;
      if (msg.toLowerCase().includes('check your email') || msg.toLowerCase().includes('confirm')) {
        setInfo(msg);
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  };

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m);
    setError('');
    setInfo('');
    setName(''); setEmail(''); setPassword('');
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col lg:flex-row">

      {/* Left Hero Panel */}
      <div className="lg:flex-1 bg-gradient-to-br from-primary via-primary/90 to-secondary flex flex-col items-center justify-center p-10 text-primary-foreground">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 mx-auto shadow-2xl">
            <Wallet size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">SpendSmart</h1>
          <p className="text-primary-foreground/80 text-center text-lg max-w-sm mx-auto mb-12">
            The smart expense tracker for Indian college students — powered by AI.
          </p>
          <div className="space-y-4 max-w-sm mx-auto">
            {[
              { icon: TrendingUp, text: 'Track every rupee effortlessly' },
              { icon: Sparkles, text: 'AI-powered spending insights' },
              { icon: ShieldCheck, text: 'Set budgets & get alerts' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} />
                </div>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Auth Panel */}
      <div className="lg:w-[480px] flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Tabs */}
          <div className="flex rounded-2xl bg-muted p-1 mb-8">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  mode === m
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {mode === 'login' ? 'Welcome back!' : 'Create your account'}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {mode === 'login'
                    ? 'Log in to see your spending dashboard.'
                    : 'Join thousands of students managing money smarter.'}
                </p>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="Priya Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="priya@college.edu"
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-card border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-muted-foreground mt-1">At least 6 characters.</p>
                )}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-destructive text-sm font-medium bg-destructive/10 px-4 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}
              {info && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-blue-700 dark:text-blue-300 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg"
                >
                  {info}
                </motion.p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Log In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

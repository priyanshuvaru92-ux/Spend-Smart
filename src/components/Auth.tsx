import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Eye, EyeOff, ArrowRight, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<string | true>;
  onSignup: (name: string, email: string, password: string) => Promise<string | true>;
  onGoogleLogin: () => Promise<string | true>;
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function Auth({ onLogin, onSignup, onGoogleLogin }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogle = async () => {
    setError('');
    setInfo('');
    setGoogleLoading(true);
    const result = await onGoogleLogin();
    if (result !== true) setError(result as string);
    setGoogleLoading(false);
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
          <div className="flex rounded-2xl bg-muted p-1 mb-6">
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

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full py-3 rounded-xl border border-border bg-card hover:bg-muted font-semibold text-sm text-foreground flex items-center justify-center gap-3 transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mb-5"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
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
              <div className="mb-2">
                <h2 className="text-xl font-bold text-foreground">
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
                disabled={loading || googleLoading}
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

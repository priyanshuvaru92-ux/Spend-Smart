import { useState, useEffect } from 'react';

export interface AuthUser {
  name: string;
  email: string;
}

const USERS_KEY = 'spendsmart_users';
const SESSION_KEY = 'spendsmart_user';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setIsLoaded(true);
  }, []);

  const login = (email: string, password: string): string | true => {
    const users: { name: string; email: string; password: string }[] =
      JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return 'Invalid email or password.';
    const u = { name: found.name, email: found.email };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return true;
  };

  const signup = (name: string, email: string, password: string): string | true => {
    if (!name.trim()) return 'Name is required.';
    if (!email.includes('@')) return 'Enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    const users: { name: string; email: string; password: string }[] =
      JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return 'Email already registered.';
    users.push({ name: name.trim(), email: email.toLowerCase(), password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const u = { name: name.trim(), email: email.toLowerCase() };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return { user, isLoaded, login, signup, logout };
}

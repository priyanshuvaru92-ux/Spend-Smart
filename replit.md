# SpendSmart

AI-powered expense tracker for Indian college students. Standalone React + Vite app at project root.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: TailwindCSS v4 + tw-animate-css
- **Charts**: Recharts
- **Animation**: Framer Motion
- **AI**: Google Gemini 2.5 Flash (`VITE_GEMINI_API_KEY`)
- **Exchange rates**: Frankfurter.app API (free, no key needed)
- **Package manager**: npm (root-level standalone project)

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_GEMINI_API_KEY` | Gemini AI API key |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

## Architecture

Auth and data stored in Supabase. Currency/dark mode preference stored in localStorage.

### Supabase Tables

| Table | Purpose |
|-------|---------|
| `expenses` | All expense records (per user via RLS) |
| `recurring_templates` | Recurring expense templates (per user) |
| `budgets` | Per-category monthly budget limits (per user) |

Row Level Security (RLS) enabled on all tables — each user only sees their own data.

### localStorage keys (UI preferences only)

| Key | Purpose |
|-----|---------|
| `spendsmart_currency` | Selected display currency code |
| `spendsmart_rates` | Cached exchange rates from frankfurter.app |
| `spendsmart_dark` | Dark mode preference |

### Key files

```
src/
├── App.tsx                  # Root — auth gate, dark mode, routing, state
├── lib/
│   └── supabase.ts          # Supabase client initialisation
├── hooks/
│   ├── use-auth.ts          # Login/signup/logout via Supabase Auth
│   ├── use-budgets.ts       # Per-category monthly budget goals (Supabase)
│   ├── use-currency.ts      # Currency selection + Frankfurter.app rates
│   └── use-expenses.ts      # Expense CRUD + recurring templates (Supabase)
├── components/
│   ├── Auth.tsx             # Login/signup page
│   ├── Dashboard.tsx        # Stats, charts, budget progress, alerts
│   ├── ExpenseList.tsx      # Searchable/filterable expense list
│   ├── ExpenseModal.tsx     # Add expense: receipt OCR, recurring, currency
│   ├── Settings.tsx         # Currency, budget goals, recurring templates
│   ├── Sidebar.tsx          # Desktop nav + logout + dark mode toggle
│   ├── Topbar.tsx           # Page header + dark mode toggle + mobile logout
│   ├── AIAnalysis.tsx       # Gemini AI spending analysis
│   ├── ChatBot.tsx          # AI finance chatbot (floating bubble)
│   └── HowItWorks.tsx       # Feature explainer page
```

## Features

1. **Auth** — Sign up / log in via Supabase Auth; user name shown in sidebar
2. **Maroon/Gold Theme** — `#800020` primary, sienna secondary, gold accent; full dark mode
3. **Dark Mode** — Toggle stored in localStorage, applies `.dark` class to `<html>`
4. **Multi-Currency** — INR/USD/EUR/GBP/AED/JPY; live rates via frankfurter.app; amounts stored in INR
5. **Monthly Budget Goals** — Per-category limits set in Settings; progress bars in Dashboard
6. **Budget Alerts** — Yellow banner at 80%, red banner at 100% of budget
7. **Recurring Expenses** — Daily/Weekly/Monthly toggle in Add Expense; auto-generated on load
8. **Receipt Scanner** — Upload receipt photo; Gemini Vision extracts amount/date/merchant
9. **AI Chatbot** — Floating maroon bubble; full expense context passed to Gemini

## Running

```bash
npm run dev    # dev server on port 5000
npm run build  # production build
```

## Deployment

Deployed via Vercel. `vercel.json` in root. `npm run build` → `dist/` folder.
Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_GEMINI_API_KEY` in Vercel → Settings → Environment Variables.

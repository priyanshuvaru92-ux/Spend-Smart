# SpendSmart

AI-powered expense tracker for Indian college students. Standalone React + Vite app at project root.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Styling**: TailwindCSS v4 + tw-animate-css
- **Charts**: Recharts
- **Animation**: Framer Motion
- **AI**: Google Gemini 2.5 Flash (`VITE_GEMINI_API_KEY`)
- **Exchange rates**: Frankfurter.app API (free, no key needed)
- **Package manager**: npm (root-level standalone project)

## Architecture

All data stored in `localStorage` — no backend required.

### localStorage keys

| Key | Purpose |
|-----|---------|
| `spendsmart_users` | All registered users (hashed by password) |
| `spendsmart_user` | Current session (name + email) |
| `spendsmart_expenses` | All expense records |
| `spendsmart_recurring` | Recurring expense templates |
| `spendsmart_budgets` | Per-category monthly budget limits |
| `spendsmart_currency` | Selected display currency code |
| `spendsmart_rates` | Cached exchange rates from frankfurter.app |
| `spendsmart_dark` | Dark mode preference |

### Key files

```
src/
├── App.tsx                  # Root — auth gate, dark mode, routing, state
├── hooks/
│   ├── use-auth.ts          # Login/signup/logout (localStorage)
│   ├── use-budgets.ts       # Per-category monthly budget goals
│   ├── use-currency.ts      # Currency selection + Frankfurter.app rates
│   └── use-expenses.ts      # Expense CRUD + recurring template management
├── components/
│   ├── Auth.tsx             # Login/signup page (replaces Intro)
│   ├── Dashboard.tsx        # Stats, charts, budget progress, alerts
│   ├── ExpenseList.tsx      # Searchable/filterable expense list
│   ├── ExpenseModal.tsx     # Add expense: receipt OCR, recurring, currency
│   ├── Settings.tsx         # Currency, budget goals, recurring templates
│   ├── Sidebar.tsx          # Desktop nav + logout + dark mode toggle
│   ├── Topbar.tsx           # Page header + dark mode toggle + mobile logout
│   ├── AIAnalysis.tsx       # Gemini AI spending analysis
│   └── HowItWorks.tsx       # Feature explainer page
```

## Features

1. **Auth** — Sign up / log in with localStorage; user name shown in sidebar
2. **Maroon/Gold Theme** — `#800020` primary, sienna secondary, gold accent; full dark mode
3. **Dark Mode** — Toggle stored in localStorage, applies `.dark` class to `<html>`
4. **Multi-Currency** — INR/USD/EUR/GBP/AED/JPY; live rates via frankfurter.app; amounts stored in INR
5. **Monthly Budget Goals** — Per-category limits set in Settings; progress bars in Dashboard
6. **Budget Alerts** — Yellow banner at 80%, red banner at 100% of budget
7. **Recurring Expenses** — Daily/Weekly/Monthly toggle in Add Expense; auto-generated on load
8. **Receipt Scanner** — Upload receipt photo; Gemini Vision extracts amount/date/merchant

## Running

```bash
npm run dev    # dev server on port 5000
npm run build  # production build
```

## Deployment

Deployed via Vercel. `vercel.json` in root. `npm run build` → `dist/` folder.

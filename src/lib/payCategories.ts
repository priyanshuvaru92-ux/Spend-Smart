import type { ExpenseCategory } from '../hooks/use-expenses';

export interface PayCategory {
  id: string;
  label: string;
  icon: string;
  expenseCategory: ExpenseCategory;
  color: string;
  desc: string;
  group: string;
}

export const PAY_CATEGORIES: PayCategory[] = [
  // Food & Drinks
  { id: 'restaurant',  label: 'Restaurant',      icon: '🍽️', expenseCategory: 'Food',          color: '#E74C3C', desc: 'Dine in, take away',          group: 'Food & Drinks' },
  { id: 'swiggy',      label: 'Swiggy / Zomato', icon: '🛵', expenseCategory: 'Food',          color: '#E74C3C', desc: 'Food delivery',                group: 'Food & Drinks' },
  { id: 'cafe',        label: 'Cafe / Chai',     icon: '☕', expenseCategory: 'Food',          color: '#E74C3C', desc: 'Coffee, tea, snacks',          group: 'Food & Drinks' },
  { id: 'grocery',     label: 'Groceries',       icon: '🛒', expenseCategory: 'Other',         color: '#27AE60', desc: 'Supermarket, kirana',          group: 'Food & Drinks' },

  // Housing & Utilities
  { id: 'rent',        label: 'Rent / PG',       icon: '🏠', expenseCategory: 'Other',         color: '#8E44AD', desc: 'Monthly rent, PG fees',        group: 'Housing & Utilities' },
  { id: 'electricity', label: 'Electricity',     icon: '⚡', expenseCategory: 'Other',         color: '#F39C12', desc: 'Light bill, BESCOM, MSEDCL',   group: 'Housing & Utilities' },
  { id: 'wifi',        label: 'WiFi / Internet', icon: '📶', expenseCategory: 'Other',         color: '#F39C12', desc: 'Broadband, Jio Fiber',         group: 'Housing & Utilities' },
  { id: 'gas',         label: 'Gas / LPG',       icon: '🔥', expenseCategory: 'Other',         color: '#F39C12', desc: 'Cylinder, piped gas',          group: 'Housing & Utilities' },
  { id: 'water',       label: 'Water Bill',      icon: '💧', expenseCategory: 'Other',         color: '#F39C12', desc: 'Municipal water bill',         group: 'Housing & Utilities' },

  // EMI & Finance
  { id: 'emi',         label: 'EMI',             icon: '🏦', expenseCategory: 'Other',         color: '#2980B9', desc: 'Loan, home, car EMI',          group: 'EMI & Finance' },
  { id: 'creditcard',  label: 'Credit Card',     icon: '💳', expenseCategory: 'Other',         color: '#2980B9', desc: 'Monthly card payment',         group: 'EMI & Finance' },
  { id: 'insurance',   label: 'Insurance',       icon: '🛡️', expenseCategory: 'Health',        color: '#2980B9', desc: 'Health, car, life',            group: 'EMI & Finance' },

  // Entertainment
  { id: 'movies',      label: 'Movie Ticket',    icon: '🎬', expenseCategory: 'Entertainment', color: '#E67E22', desc: 'PVR, INOX, BookMyShow',        group: 'Entertainment' },
  { id: 'concert',     label: 'Concert / Event', icon: '🎤', expenseCategory: 'Entertainment', color: '#E67E22', desc: 'Shows, festivals, sports',     group: 'Entertainment' },
  { id: 'ott',         label: 'OTT / Streaming', icon: '📺', expenseCategory: 'Entertainment', color: '#16A085', desc: 'Netflix, Prime, Hotstar',      group: 'Entertainment' },
  { id: 'gaming',      label: 'Gaming',          icon: '🎮', expenseCategory: 'Entertainment', color: '#E67E22', desc: 'Game purchases, recharge',     group: 'Entertainment' },

  // Transport
  { id: 'petrol',      label: 'Petrol',          icon: '⛽', expenseCategory: 'Transport',     color: '#D35400', desc: 'Fuel station',                 group: 'Transport' },
  { id: 'cab',         label: 'Cab / Auto',      icon: '🚕', expenseCategory: 'Transport',     color: '#3498DB', desc: 'Ola, Uber, auto',              group: 'Transport' },
  { id: 'metro',       label: 'Metro / Bus',     icon: '🚇', expenseCategory: 'Transport',     color: '#3498DB', desc: 'Metro recharge, bus pass',     group: 'Transport' },
  { id: 'flight',      label: 'Flight / Train',  icon: '✈️', expenseCategory: 'Transport',     color: '#1ABC9C', desc: 'IRCTC, airline booking',       group: 'Transport' },

  // Health
  { id: 'medicine',    label: 'Medicine',        icon: '💊', expenseCategory: 'Health',        color: '#2ECC71', desc: 'Pharmacy, online meds',        group: 'Health' },
  { id: 'doctor',      label: 'Doctor',          icon: '🏥', expenseCategory: 'Health',        color: '#2ECC71', desc: 'Consultation, lab tests',      group: 'Health' },
  { id: 'gym',         label: 'Gym / Fitness',   icon: '🏋️', expenseCategory: 'Health',        color: '#E74C3C', desc: 'Gym fees, yoga class',         group: 'Health' },

  // Education
  { id: 'tuition',     label: 'Tuition / Fees',  icon: '📚', expenseCategory: 'Education',     color: '#2980B9', desc: 'School, college, coaching',    group: 'Education' },
  { id: 'course',      label: 'Online Course',   icon: '💻', expenseCategory: 'Education',     color: '#2980B9', desc: 'Udemy, Coursera, Skillshare',  group: 'Education' },

  // Shopping
  { id: 'shopping',    label: 'Shopping',        icon: '🛍️', expenseCategory: 'Shopping',      color: '#9B59B6', desc: 'Clothes, shoes, Amazon',       group: 'Shopping' },
  { id: 'salon',       label: 'Salon / Spa',     icon: '💈', expenseCategory: 'Shopping',      color: '#9B59B6', desc: 'Haircut, grooming',            group: 'Shopping' },

  // Others
  { id: 'recharge',    label: 'Mobile Recharge', icon: '📲', expenseCategory: 'Other',         color: '#F39C12', desc: 'Jio, Airtel, Vi recharge',     group: 'Others' },
  { id: 'donation',    label: 'Donation',        icon: '🤲', expenseCategory: 'Other',         color: '#7F8C8D', desc: 'Temple, charity, NGO',         group: 'Others' },
  { id: 'other',       label: 'Other',           icon: '📦', expenseCategory: 'Other',         color: '#7F8C8D', desc: 'Anything else',                group: 'Others' },
];

export const PAY_GROUPS = [
  'Food & Drinks',
  'Housing & Utilities',
  'EMI & Finance',
  'Entertainment',
  'Transport',
  'Health',
  'Education',
  'Shopping',
  'Others',
] as const;

export function getPayCategory(id: string): PayCategory | undefined {
  return PAY_CATEGORIES.find(c => c.id === id);
}

export interface UpiApp {
  id: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'any';
  label: string;
  color: string;
  emoji: string;
}

export const UPI_APPS: UpiApp[] = [
  { id: 'gpay',    label: 'GPay',    color: '#1A73E8', emoji: '🟢' },
  { id: 'phonepe', label: 'PhonePe', color: '#5F259F', emoji: '🟣' },
  { id: 'paytm',   label: 'Paytm',   color: '#00BAF2', emoji: '🔵' },
  { id: 'bhim',    label: 'BHIM',    color: '#F58220', emoji: '🟠' },
  { id: 'any',     label: 'Any UPI', color: '#7F8C8D', emoji: '💳' },
];

export function buildUpiLink(app: UpiApp['id'], upiId: string, name: string): string {
  const params = upiId
    ? `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name || 'Payee')}&cu=INR`
    : `cu=INR`;
  switch (app) {
    case 'gpay':    return `tez://upi/pay?${params}`;
    case 'phonepe': return `phonepe://pay?${params}`;
    case 'paytm':   return `paytmmp://upi/pay?${params}`;
    case 'bhim':
    case 'any':
    default:        return `upi://pay?${params}`;
  }
}

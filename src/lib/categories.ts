export interface CategoryConfig {
  icon: string;
  color: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Food:          { icon: '🍽️',  color: '#E74C3C' },
  Transport:     { icon: '🚗',  color: '#3498DB' },
  Shopping:      { icon: '🛍️',  color: '#9B59B6' },
  Bills:         { icon: '⚡',  color: '#F39C12' },
  Health:        { icon: '💊',  color: '#2ECC71' },
  Travel:        { icon: '✈️',  color: '#1ABC9C' },
  Entertainment: { icon: '🎬',  color: '#E67E22' },
  Education:     { icon: '📚',  color: '#2980B9' },
  Groceries:     { icon: '🛒',  color: '#27AE60' },
  Rent:          { icon: '🏠',  color: '#8E44AD' },
  Savings:       { icon: '💰',  color: '#C5A028' },
  Fitness:       { icon: '🏋️',  color: '#E74C3C' },
  Subscriptions: { icon: '📱',  color: '#16A085' },
  Petrol:        { icon: '⛽',  color: '#D35400' },
  Other:         { icon: '📦',  color: '#7F8C8D' },
};

export const APP_CATEGORIES = [
  'Food', 'Transport', 'Education', 'Entertainment',
  'Shopping', 'Health', 'Other',
] as const;

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
}

export function getCategoryIcon(category: string): string {
  return getCategoryConfig(category).icon;
}

export function getCategoryColor(category: string): string {
  return getCategoryConfig(category).color;
}

import { LucideIcon } from 'lucide-react';
import {
  Coffee,
  ShoppingBag,
  Car,
  Plane,
  Hotel,
  Briefcase,
  Database,
  Coins,
  Heart,
  Monitor,
  Shirt,
  Tv,
  Zap,
  User,
} from 'lucide-react';

/**
 * Color configuration for a category.
 * Includes variants for backgrounds, text, borders, dots, and charts.
 */
export interface CategoryColorConfig {
  bg: string;
  text: string;
  border: string;
  dot: string;
  chart: string;
}

/**
 * Comprehensive color palette for all expense categories.
 * Provides consistent theming across badges, charts, and UI elements.
 */
export const CATEGORY_COLORS: Record<string, CategoryColorConfig> = {
  'Food & Dining': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-500/20',
    dot: 'bg-orange-600 dark:bg-orange-400',
    chart: 'rgba(251,146,60,0.85)',
  },
  Groceries: {
    bg: 'bg-green-500/10',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-500/20',
    dot: 'bg-green-600 dark:bg-green-400',
    chart: 'rgba(74,222,128,0.85)',
  },
  Transport: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-600 dark:bg-blue-400',
    chart: 'rgba(96,165,250,0.85)',
  },
  'Health & Pharmacy': {
    bg: 'bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-500/20',
    dot: 'bg-red-600 dark:bg-red-400',
    chart: 'rgba(248,113,113,0.85)',
  },
  'Electronics & Tech': {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-600 dark:bg-cyan-400',
    chart: 'rgba(34,211,238,0.85)',
  },
  'Clothing & Apparel': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-600 dark:bg-purple-400',
    chart: 'rgba(192,132,252,0.85)',
  },
  Entertainment: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-700 dark:text-pink-400',
    border: 'border-pink-500/20',
    dot: 'bg-pink-600 dark:bg-pink-400',
    chart: 'rgba(244,114,182,0.85)',
  },
  'Utilities & Bills': {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-500/20',
    dot: 'bg-yellow-600 dark:bg-yellow-400',
    chart: 'rgba(250,204,21,0.85)',
  },
  'Personal Care': {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-600 dark:bg-rose-400',
    chart: 'rgba(251,113,133,0.85)',
  },
  Other: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-600 dark:bg-slate-400',
    chart: 'rgba(148,163,184,0.85)',
  },
};

/**
 * Icon mapping for expense categories.
 * Maps category names to Lucide React icon components.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Food & Dining': Coffee,
  Groceries: ShoppingBag,
  Transport: Car,
  Travel: Plane,
  'Travel & Lodging': Plane,
  Lodging: Hotel,
  'Office Supplies': Briefcase,
  'Software / SaaS': Database,
  'Cloud Infrastructure': Database,
  'Health & Pharmacy': Heart,
  'Electronics & Tech': Monitor,
  'Clothing & Apparel': Shirt,
  Entertainment: Tv,
  'Utilities & Bills': Zap,
  'Personal Care': User,
  Other: Coins,
};

/**
 * Budget allocations per category (in USD).
 * Used in reports page for budget vs actual comparisons.
 */
export const CATEGORY_BUDGETS: Record<string, number> = {
  'Food & Dining': 300,
  Groceries: 500,
  Transport: 150,
  'Office Supplies': 1000,
  'Software / SaaS': 2500,
  'Cloud Infrastructure': 4000,
  Other: 400,
};

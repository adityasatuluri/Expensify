export interface User {
  id: string;
  pin: string; // hashed PIN
  currency: 'INR';
  createdAt: Date;
  initialBalance: number;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'credit_card';
  balance: number;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: 'income' | 'expense' | 'subscription';
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  month: string; // YYYY-MM
  limit: number;
  spent: number;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense' | 'subscription' | 'debt';
  color?: string;
}

export interface PersonDebt {
  id: string;
  userId: string;
  personName: string;
  createdAt: Date;
}

export interface Debt {
  id: string;
  userId: string;
  personDebtId: string;
  type: 'lent' | 'borrowed'; // lent: money you gave them, borrowed: money you took
  amount: number;
  description: string;
  status: 'pending' | 'paid'; // pending: not fully paid, paid: fully resolved
  createdAt: Date;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
}

// Transaction types
export const TRANSACTION_TYPES = ['income', 'expense', 'subscription'] as const;

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
];

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Bonus',
  'Investment',
  'Gift',
  'Other',
];

export const DEFAULT_SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Cloud Storage',
  'Productivity',
  'Entertainment',
  'Health & Fitness',
  'Shopping',
  'Other',
];

// Note: Debt tracking is now separate from transactions
// Debts are for reminders only (lent/borrowed), not actual transaction records

// Currency formatting
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

// Date formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const MONTH_FORMAT = 'MMMM yyyy';

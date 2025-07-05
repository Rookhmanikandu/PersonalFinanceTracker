export interface Transaction {
  _id?: string;
  id?: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  amount: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
}

export interface MonthlyExpense {
  month: string;
  expenses: number;
  income: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  count: number;
}

export interface Budget {
  _id?: string;
  id?: string;
  category: string;
  amount: number;
  month: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  category: string;
  amount: string;
  month: string;
  year: string;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Gift',
  'Other'
];
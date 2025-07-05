import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[monthIndex];
}

export function validateAmount(amount: string): string | null {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return 'Amount must be a positive number';
  }
  return null;
}

export function validateDescription(description: string): string | null {
  if (!description.trim()) {
    return 'Description is required';
  }
  if (description.length > 100) {
    return 'Description must be less than 100 characters';
  }
  return null;
}

export function validateDate(date: string): string | null {
  if (!date) {
    return 'Date is required';
  }
  const selectedDate = new Date(date);
  const today = new Date();
  if (selectedDate > today) {
    return 'Date cannot be in the future';
  }
  return null;
}
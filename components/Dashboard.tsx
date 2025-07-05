'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '@/lib/storage';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import ExpenseChart from './ExpenseChart';
import { toast } from 'sonner';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = () => {
      try {
        const saved = getTransactions();
        setTransactions(saved);
      } catch (error) {
        console.error('Error loading transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const handleAddTransaction = (formData: TransactionFormData) => {
    try {
      const newTransaction = addTransaction({
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        type: formData.type,
      });
      
      setTransactions(prev => [...prev, newTransaction]);
      toast.success('Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const handleUpdateTransaction = (formData: TransactionFormData) => {
    if (!editingTransaction) return;
    
    try {
      const updated = updateTransaction(editingTransaction.id, {
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        type: formData.type,
      });
      
      if (updated) {
        setTransactions(prev => 
          prev.map(t => t.id === editingTransaction.id ? updated : t)
        );
        setEditingTransaction(null);
        toast.success('Transaction updated successfully');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    try {
      const success = deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast.success('Transaction deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Personal Finance Tracker</h1>
          <p className="text-gray-600 mt-2">Track your income and expenses with ease</p>
        </div>

        <div className="space-y-8">
          <TransactionForm
            onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
            editTransaction={editingTransaction}
            onCancel={handleCancelEdit}
          />

          <ExpenseChart transactions={transactions} />

          <TransactionList
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </div>
      </div>
    </div>
  );
}
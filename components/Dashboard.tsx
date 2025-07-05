'use client';

import { useState, useEffect } from 'react';
import { Transaction, Budget } from '@/types/transaction';
import { 
  fetchTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} from '@/lib/api';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import ExpenseChart from './ExpenseChart';
import CategoryChart from './CategoryChart';
import BudgetManager from './BudgetManager';
import DashboardSummary from './DashboardSummary';
import BudgetComparison from './BudgetComparison';
import SpendingInsights from './SpendingInsights';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, budgetsData] = await Promise.all([
        fetchTransactions(),
        fetchBudgets()
      ]);
      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (formData: any) => {
    try {
      const newTransaction = await createTransaction({
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        type: formData.type,
        category: formData.category,
      });
      
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success('Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const handleUpdateTransaction = async (formData: any) => {
    if (!editingTransaction) return;
    
    try {
      const updated = await updateTransaction(editingTransaction._id || editingTransaction.id!, {
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        type: formData.type,
        category: formData.category,
      });
      
      setTransactions(prev => 
        prev.map(t => (t._id || t.id) === (editingTransaction._id || editingTransaction.id) ? updated : t)
      );
      setEditingTransaction(null);
      toast.success('Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => (t._id || t.id) !== id));
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveTab('transactions');
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleAddBudget = async (formData: any) => {
    try {
      const newBudget = await createBudget({
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: parseInt(formData.year),
      });
      
      setBudgets(prev => [newBudget, ...prev]);
      toast.success('Budget added successfully');
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget');
    }
  };

  const handleUpdateBudget = async (formData: any) => {
    if (!editingBudget) return;
    
    try {
      const updated = await updateBudget(editingBudget._id || editingBudget.id!, {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: parseInt(formData.year),
      });
      
      setBudgets(prev => 
        prev.map(b => (b._id || b.id) === (editingBudget._id || editingBudget.id) ? updated : b)
      );
      setEditingBudget(null);
      toast.success('Budget updated successfully');
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget(id);
      setBudgets(prev => prev.filter(b => (b._id || b.id) !== id));
      toast.success('Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setActiveTab('budgets');
  };

  const handleCancelBudgetEdit = () => {
    setEditingBudget(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Personal Finance Tracker</h1>
          <p className="text-gray-600 text-lg">Manage your finances with comprehensive tracking and budgeting</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <DashboardSummary transactions={transactions} budgets={budgets} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ExpenseChart transactions={transactions} />
              <CategoryChart transactions={transactions} />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-8">
            <TransactionForm
              onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
              editTransaction={editingTransaction}
              onCancel={handleCancelEdit}
            />
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CategoryChart transactions={transactions} />
              <ExpenseChart transactions={transactions} />
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-8">
            <BudgetManager
              budgets={budgets}
              onAdd={handleAddBudget}
              onUpdate={handleUpdateBudget}
              onDelete={handleDeleteBudget}
              onEdit={handleEditBudget}
              editingBudget={editingBudget}
              onCancelEdit={handleCancelBudgetEdit}
            />
            <BudgetComparison transactions={transactions} budgets={budgets} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <SpendingInsights transactions={transactions} budgets={budgets} />
            <BudgetComparison transactions={transactions} budgets={budgets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
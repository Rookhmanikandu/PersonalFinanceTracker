'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Budget } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, PieChart } from 'lucide-react';

interface DashboardSummaryProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function DashboardSummary({ transactions, budgets }: DashboardSummaryProps) {
  const summary = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netAmount = totalIncome - totalExpenses;
    
    const totalBudget = budgets
      .filter(b => b.month === (currentMonth + 1).toString().padStart(2, '0') && b.year === currentYear)
      .reduce((sum, b) => sum + b.amount, 0);
    
    const budgetUsed = (totalExpenses / totalBudget) * 100;
    
    // Get top category
    const categoryExpenses = new Map<string, number>();
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryExpenses.set(t.category, (categoryExpenses.get(t.category) || 0) + t.amount);
      });
    
    const topCategory = Array.from(categoryExpenses.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalIncome,
      totalExpenses,
      netAmount,
      totalBudget,
      budgetUsed,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      transactionCount: currentMonthTransactions.length
    };
  }, [transactions, budgets]);

  const cards = [
    {
      title: 'Monthly Income',
      value: formatCurrency(summary.totalIncome),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(summary.totalExpenses),
      icon: TrendingDown,
      color: 'from-red-500 to-rose-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Net Amount',
      value: formatCurrency(Math.abs(summary.netAmount)),
      icon: DollarSign,
      color: summary.netAmount >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600',
      textColor: summary.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600',
      bgColor: summary.netAmount >= 0 ? 'bg-blue-50' : 'bg-orange-50',
      prefix: summary.netAmount >= 0 ? '+' : '-'
    },
    {
      title: 'Budget Usage',
      value: summary.totalBudget > 0 ? `${summary.budgetUsed.toFixed(1)}%` : 'No Budget',
      icon: Target,
      color: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {card.prefix}{card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions</span>
                <span className="font-semibold">{summary.transactionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg per transaction</span>
                <span className="font-semibold">
                  {summary.transactionCount > 0 
                    ? formatCurrency(summary.totalExpenses / summary.transactionCount)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topCategory ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold">{summary.topCategory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(summary.topCategory.amount)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No expenses this month</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-green-600" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.totalBudget > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Budget</span>
                  <span className="font-semibold">{formatCurrency(summary.totalBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className={`font-semibold ${summary.totalBudget - summary.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.totalBudget - summary.totalExpenses)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${summary.budgetUsed > 100 ? 'bg-red-500' : summary.budgetUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(summary.budgetUsed, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No budgets set for this month</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Budget } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Calendar } from 'lucide-react';

interface SpendingInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const insights = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Last month transactions
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
    
    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseChange = lastMonthExpenses > 0 
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0;
    
    // Category analysis
    const categoryExpenses = new Map<string, number>();
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryExpenses.set(t.category, (categoryExpenses.get(t.category) || 0) + t.amount);
      });
    
    const topCategories = Array.from(categoryExpenses.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    // Budget analysis
    const currentBudgets = budgets.filter(
      b => parseInt(b.month) === currentMonth + 1 && b.year === currentYear
    );
    
    const budgetAlerts = currentBudgets
      .map(budget => {
        const spent = categoryExpenses.get(budget.category) || 0;
        const percentage = (spent / budget.amount) * 100;
        return {
          category: budget.category,
          budget: budget.amount,
          spent,
          percentage,
          status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
        };
      })
      .filter(item => item.status !== 'good');
    
    // Spending patterns
    const dailyAverage = currentMonthExpenses / currentDate.getDate();
    const projectedMonthly = dailyAverage * 30;
    
    // Income vs Expenses
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savingsRate = currentMonthIncome > 0 
      ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100 
      : 0;
    
    return {
      expenseChange,
      topCategories,
      budgetAlerts,
      dailyAverage,
      projectedMonthly,
      savingsRate,
      currentMonthExpenses,
      lastMonthExpenses,
      currentMonthIncome
    };
  }, [transactions, budgets]);

  const getInsightCards = () => [
    {
      title: 'Monthly Spending Trend',
      value: `${insights.expenseChange >= 0 ? '+' : ''}${insights.expenseChange.toFixed(1)}%`,
      description: `vs last month (${formatCurrency(insights.lastMonthExpenses)})`,
      icon: insights.expenseChange >= 0 ? TrendingUp : TrendingDown,
      color: insights.expenseChange >= 0 ? 'text-red-600' : 'text-green-600',
      bgColor: insights.expenseChange >= 0 ? 'bg-red-50' : 'bg-green-50',
      iconColor: insights.expenseChange >= 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'
    },
    {
      title: 'Daily Average',
      value: formatCurrency(insights.dailyAverage),
      description: `Projected monthly: ${formatCurrency(insights.projectedMonthly)}`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Savings Rate',
      value: `${insights.savingsRate.toFixed(1)}%`,
      description: `of income (${formatCurrency(insights.currentMonthIncome)})`,
      icon: insights.savingsRate >= 20 ? CheckCircle : AlertTriangle,
      color: insights.savingsRate >= 20 ? 'text-green-600' : insights.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600',
      bgColor: insights.savingsRate >= 20 ? 'bg-green-50' : insights.savingsRate >= 10 ? 'bg-yellow-50' : 'bg-red-50',
      iconColor: insights.savingsRate >= 20 ? 'from-green-500 to-green-600' : insights.savingsRate >= 10 ? 'from-yellow-500 to-yellow-600' : 'from-red-500 to-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getInsightCards().map((card, index) => (
          <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${card.iconColor}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Top Spending Categories
            </CardTitle>
            <CardDescription>Your highest expense categories this month</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.topCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expenses recorded this month</p>
            ) : (
              <div className="space-y-4">
                {insights.topCategories.map(([category, amount], index) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(amount)}</p>
                      <p className="text-sm text-gray-600">
                        {((amount / insights.currentMonthExpenses) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Budget Alerts
            </CardTitle>
            <CardDescription>Categories requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {insights.budgetAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-600 font-medium">All budgets on track!</p>
                <p className="text-gray-500 text-sm">No categories are over budget</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.budgetAlerts.map((alert) => (
                  <div key={alert.category} className={`p-4 rounded-lg border-l-4 ${
                    alert.status === 'over' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{alert.category}</h3>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        alert.status === 'over' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.percentage.toFixed(1)}% used
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Spent: {formatCurrency(alert.spent)} / {formatCurrency(alert.budget)}
                      </span>
                      <span className={alert.status === 'over' ? 'text-red-600' : 'text-yellow-600'}>
                        {alert.status === 'over' ? 'Over budget!' : 'Approaching limit'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Smart Recommendations
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Personalized insights to improve your financial health
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Spending Tips</h3>
              {insights.expenseChange > 10 && (
                <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                  <p className="text-sm text-orange-800">
                    Your spending increased by {insights.expenseChange.toFixed(1)}% this month. Consider reviewing your largest expense categories.
                  </p>
                </div>
              )}
              {insights.savingsRate < 10 && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-sm text-red-800">
                    Your savings rate is {insights.savingsRate.toFixed(1)}%. Aim for at least 20% to build financial security.
                  </p>
                </div>
              )}
              {insights.budgetAlerts.length > 0 && (
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                  <p className="text-sm text-yellow-800">
                    {insights.budgetAlerts.length} categories are approaching or over budget. Consider adjusting your spending or budget limits.
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Goals</h3>
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800">
                  Based on your daily average of {formatCurrency(insights.dailyAverage)}, you're projected to spend {formatCurrency(insights.projectedMonthly)} this month.
                </p>
              </div>
              {insights.savingsRate >= 20 && (
                <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                  <p className="text-sm text-green-800">
                    Great job! Your {insights.savingsRate.toFixed(1)}% savings rate is excellent. Keep up the good work!
                  </p>
                </div>
              )}
              <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                <p className="text-sm text-purple-800">
                  Consider setting up automatic transfers to savings to maintain consistent saving habits.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
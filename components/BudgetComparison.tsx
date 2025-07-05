'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction, Budget } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetComparisonProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function BudgetComparison({ transactions, budgets }: BudgetComparisonProps) {
  const comparisonData = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const currentBudgets = budgets.filter(
      b => parseInt(b.month) === currentMonth && b.year === currentYear
    );
    
    const currentExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && 
             date.getMonth() + 1 === currentMonth && 
             date.getFullYear() === currentYear;
    });
    
    const categoryExpenses = new Map<string, number>();
    currentExpenses.forEach(t => {
      categoryExpenses.set(t.category, (categoryExpenses.get(t.category) || 0) + t.amount);
    });
    
    const comparison = currentBudgets.map(budget => {
      const spent = categoryExpenses.get(budget.category) || 0;
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;
      
      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining: Math.max(0, remaining),
        percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });
    
    return comparison.sort((a, b) => b.percentage - a.percentage);
  }, [transactions, budgets]);

  const summary = useMemo(() => {
    const totalBudget = comparisonData.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = comparisonData.reduce((sum, item) => sum + item.spent, 0);
    const overBudgetCategories = comparisonData.filter(item => item.status === 'over').length;
    
    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overBudgetCategories,
      overallPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }, [comparisonData]);

  if (comparisonData.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No budget data</h3>
              <p className="text-gray-600">Set up budgets to see budget vs actual comparison.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600">Budget: {formatCurrency(data.budget)}</p>
          <p className="text-red-600">Spent: {formatCurrency(data.spent)}</p>
          <p className="text-green-600">Remaining: {formatCurrency(data.remaining)}</p>
          <p className="text-gray-600">Usage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.totalBudget)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalSpent)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className={`text-xl font-bold ${summary.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(summary.totalRemaining))}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${summary.totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className={`text-sm font-bold ${summary.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.totalRemaining >= 0 ? '+' : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Usage</p>
                <p className={`text-xl font-bold ${summary.overallPercentage > 100 ? 'text-red-600' : summary.overallPercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {summary.overallPercentage.toFixed(1)}%
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${summary.overallPercentage > 100 ? 'bg-red-100' : summary.overallPercentage > 80 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <span className={`text-xs font-bold ${summary.overallPercentage > 100 ? 'text-red-600' : summary.overallPercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {summary.overBudgetCategories}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6" />
            Budget vs Actual Spending
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Compare your planned budget with actual spending by category
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="budget" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  name="Budget"
                />
                <Bar 
                  dataKey="spent" 
                  fill="#EF4444" 
                  radius={[4, 4, 0, 0]}
                  name="Spent"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Details */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Detailed view of budget performance by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.map((item) => (
              <div key={item.category} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{item.category}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === 'over' ? 'bg-red-100 text-red-800' :
                    item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.percentage.toFixed(1)}% used
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold text-blue-600">{formatCurrency(item.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="font-semibold text-red-600">{formatCurrency(item.spent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className={`font-semibold ${item.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.remaining)}
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      item.status === 'over' ? 'bg-red-500' :
                      item.status === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, CategoryData } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export default function CategoryChart({ transactions }: CategoryChartProps) {
  const categoryData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, CategoryData>();
    
    expenseTransactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.category) || {
        category: transaction.category,
        amount: 0,
        count: 0
      };
      
      categoryMap.set(transaction.category, {
        category: transaction.category,
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      });
    });
    
    return Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.amount, 0);
  }, [categoryData]);

  if (categoryData.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <PieChartIcon className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No expense data</h3>
              <p className="text-gray-600">Add some expense transactions to see category breakdown.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.amount / totalExpenses) * 100).toFixed(1);
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.category}</p>
          <p className="text-blue-600">Amount: {formatCurrency(data.amount)}</p>
          <p className="text-gray-600">Percentage: {percentage}%</p>
          <p className="text-gray-600">Transactions: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <PieChartIcon className="h-6 w-6" />
          Expense Categories
        </CardTitle>
        <CardDescription className="text-purple-100">
          Breakdown of expenses by category
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, amount }) => {
                  const percentage = ((amount / totalExpenses) * 100).toFixed(0);
                  return `${category} (${percentage}%)`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-900 mb-4">Category Summary</h4>
          {categoryData.slice(0, 5).map((item, index) => (
            <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-gray-900">{item.category}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                <p className="text-sm text-gray-600">{item.count} transactions</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
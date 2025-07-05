'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, MonthlyExpense } from '@/types/transaction';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface ExpenseChartProps {
  transactions: Transaction[];
}

export default function ExpenseChart({ transactions }: ExpenseChartProps) {
  const monthlyData = useMemo(() => {
    const dataMap = new Map<string, MonthlyExpense>();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
      
      if (!dataMap.has(monthKey)) {
        dataMap.set(monthKey, {
          month: monthName,
          expenses: 0,
          income: 0,
        });
      }
      
      const monthData = dataMap.get(monthKey)!;
      if (transaction.type === 'expense') {
        monthData.expenses += transaction.amount;
      } else {
        monthData.income += transaction.amount;
      }
    });
    
    return Array.from(dataMap.values())
      .sort((a, b) => {
        const aDate = new Date(a.month.split(' ')[1] + '-' + a.month.split(' ')[0] + '-01');
        const bDate = new Date(b.month.split(' ')[1] + '-' + b.month.split(' ')[0] + '-01');
        return aDate.getTime() - bDate.getTime();
      });
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  }, [monthlyData]);

  const totalIncome = useMemo(() => {
    return monthlyData.reduce((sum, month) => sum + month.income, 0);
  }, [monthlyData]);

  const netAmount = totalIncome - totalExpenses;

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No data to display</h3>
              <p className="text-gray-600">Add some transactions to see your monthly expense chart.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-red-600">
            Expenses: {formatCurrency(payload[0]?.value || 0)}
          </p>
          <p className="text-green-600">
            Income: {formatCurrency(payload[1]?.value || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Monthly Financial Overview
        </CardTitle>
        <CardDescription>
          Track your income and expenses over time
        </CardDescription>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">Total Income</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-800">Total Expenses</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${netAmount >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2">
              {netAmount >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <p className={`text-sm font-medium ${netAmount >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Net Amount
              </p>
            </div>
            <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(netAmount))}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="expenses" 
                fill="#EF4444" 
                radius={[4, 4, 0, 0]}
                name="Expenses"
              />
              <Bar 
                dataKey="income" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                name="Income"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
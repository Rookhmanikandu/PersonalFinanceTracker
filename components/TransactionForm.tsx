'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionFormData, Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';
import { validateAmount, validateDescription, validateDate } from '@/lib/utils';
import { PlusCircle, Edit3, X } from 'lucide-react';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  editTransaction?: Transaction | null;
  onCancel?: () => void;
}

export default function TransactionForm({ onSubmit, editTransaction, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: '',
    date: '',
    description: '',
    type: 'expense',
    category: '',
  });
  
  const [errors, setErrors] = useState<Partial<TransactionFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editTransaction) {
      setFormData({
        amount: editTransaction.amount.toString(),
        date: editTransaction.date,
        description: editTransaction.description,
        type: editTransaction.type,
        category: editTransaction.category,
      });
    }
  }, [editTransaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newErrors: Partial<TransactionFormData> = {};
    
    const amountError = validateAmount(formData.amount);
    if (amountError) newErrors.amount = amountError;
    
    const descriptionError = validateDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;
    
    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(formData);
        if (!editTransaction) {
          setFormData({
            amount: '',
            date: '',
            description: '',
            type: 'expense',
            category: '',
          });
        }
      } catch (error) {
        console.error('Error submitting transaction:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          {editTransaction ? (
            <>
              <Edit3 className="h-6 w-6" />
              Edit Transaction
            </>
          ) : (
            <>
              <PlusCircle className="h-6 w-6" />
              Add New Transaction
            </>
          )}
        </CardTitle>
        <CardDescription className="text-blue-100">
          {editTransaction ? 'Update your transaction details' : 'Track your income and expenses with categories'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-gray-700">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'income' | 'expense') => {
                  handleInputChange('type', value);
                  handleInputChange('category', ''); // Reset category when type changes
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">💸 Expense</SelectItem>
                  <SelectItem value="income">💰 Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={`pl-10 h-12 ${errors.amount ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-gray-700">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`h-12 ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={`h-12 ${errors.category ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
            >
              {isSubmitting ? 'Saving...' : editTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
            {editTransaction && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2 h-12 px-8"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
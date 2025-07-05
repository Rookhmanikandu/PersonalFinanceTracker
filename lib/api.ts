const API_BASE = '/api';

export async function fetchTransactions(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/transactions`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function createTransaction(data: any): Promise<any> {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
}

export async function updateTransaction(id: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update transaction');
  return response.json();
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
}

export async function fetchBudgets(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/budgets`);
  if (!response.ok) throw new Error('Failed to fetch budgets');
  return response.json();
}

export async function createBudget(data: any): Promise<any> {
  const response = await fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create budget');
  return response.json();
}

export async function updateBudget(id: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE}/budgets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update budget');
  return response.json();
}

export async function deleteBudget(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/budgets/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete budget');
}
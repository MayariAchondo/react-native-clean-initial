import { apiRequest, apiUpload } from '@/lib/api';
import {
  Balance,
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from '@/types/transaction';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<Balance>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Transaction[]>('/transactions');
      setTransactions(data);
      setError(null);
    } catch (e) {
      console.error('Error cargando transacciones:', e);
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudieron cargar las transacciones',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBalance = useCallback(async () => {
    try {
      const data = await apiRequest<Balance>('/transactions/balance');
      setBalance(data);
    } catch (e) {
      console.error('Error cargando balance:', e);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    loadBalance();
  }, [loadTransactions, loadBalance]);

  const uploadReceipt = useCallback(async (uri: string): Promise<string> => {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('receipt', blob, 'receipt.jpg');
    } else {
      formData.append('receipt', {
        uri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as unknown as Blob);
    }

    const data = await apiUpload<{ receiptUrl: string }>(
      '/transactions/upload',
      formData,
    );
    return data.receiptUrl;
  }, []);

  const addTransaction = useCallback(async (
    input: CreateTransactionInput,
  ): Promise<void> => {
    const newTransaction = await apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  const updateTransaction = useCallback(async (
    id: number,
    input: UpdateTransactionInput,
  ): Promise<void> => {
    const updated = await apiRequest<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTransaction = useCallback(async (id: number): Promise<void> => {
    await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTransactionById = useCallback(async (
    id: number,
  ): Promise<Transaction | null> => {
    try {
      const data = await apiRequest<Transaction>(`/transactions/${id}`);
      return data;
    } catch {
      return null;
    }
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const calculatedBalance = totalIncome - totalExpense;

  return {
    transactions,
    loading,
    error,
    balance: balance.balance ?? calculatedBalance,
    totalIncome: balance.totalIncome ?? totalIncome,
    totalExpense: balance.totalExpense ?? totalExpense,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    uploadReceipt,
    reload: loadTransactions,
    reloadBalance: loadBalance,
  };
}


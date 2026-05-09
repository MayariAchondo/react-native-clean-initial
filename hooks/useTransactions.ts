import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useState } from 'react';
import {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from '../types/transaction';

const STORAGE_KEY = 'transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar desde AsyncStorage al montar el componente
  const loadTransactions = useCallback(async () => {
    try {
      // solo muestra loading si no hay datos aún
      if (transactions.length === 0) setLoading(true);

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data: Transaction[] = raw ? JSON.parse(raw) : [];
      setTransactions(data);
    } catch (e) {
      console.error('Error cargando transacciones:', e);
      setError('No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
    }
  }, [transactions.length]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch {
      setError('No se pudieron guardar las transacciones');
    }
  };

  const addTransaction = async (
    input: CreateTransactionInput,
  ): Promise<void> => {
    const newTransaction: Transaction = {
      id: Crypto.randomUUID(),
      date: new Date().toISOString(),
      ...input,
    };
    await saveTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = async (
    id: string,
    input: UpdateTransactionInput,
    // transaction: Omit<Transaction, 'id' | 'date'>,
  ): Promise<void> => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...input } : t,
    );
    await saveTransactions(updated);
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    const filtered = transactions.filter((t) => t.id !== id);
    await saveTransactions(filtered);
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
    reload: loadTransactions,
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Transaction } from '../types';

const STORAGE_KEY = 'transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      setTransactions(JSON.parse(data));
    }
  }

  async function saveTransactions(newTransactions: Transaction[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
    setTransactions(newTransactions);
  }

  async function addTransaction(transaction: Omit<Transaction, 'id' | 'date'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    await saveTransactions([...transactions, newTransaction]);
  }

  async function updateTransaction(id: string, transaction: Omit<Transaction, 'id' | 'date'>) {
    const updated = transactions.map(t =>
      t.id === id ? { ...t, ...transaction } : t
    );
    await saveTransactions(updated);
  }

  async function deleteTransaction(id: string) {
    const filtered = transactions.filter(t => t.id !== id);
    await saveTransactions(filtered);
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
  };
}
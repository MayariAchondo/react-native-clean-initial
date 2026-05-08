import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Category } from '../types';

const STORAGE_KEY = 'categories';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      setCategories(JSON.parse(data));
    }
  }

  async function saveCategories(newCategories: Category[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
    setCategories(newCategories);
  }

  async function addCategory(name: string) {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
    };
    await saveCategories([...categories, newCategory]);
  }

  async function updateCategory(id: string, name: string) {
    const updated = categories.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    );
    await saveCategories(updated);
  }

  async function deleteCategory(id: string) {
    const filtered = categories.filter(cat => cat.id !== id);
    await saveCategories(filtered);
  }

  return { categories, addCategory, updateCategory, deleteCategory, loadCategories };
}
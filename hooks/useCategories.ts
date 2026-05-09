import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/category';

const STORAGE_KEY = 'categories';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar desde AsyncStorage al montar el componente
  const loadCategories = useCallback(async () => {
    try {
      // solo muestra loading si no hay datos aún
      if (categories.length === 0) setLoading(true);

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data: Category[] = raw ? JSON.parse(raw) : [];
      setCategories(data);
    } catch (e) {
      console.error('Error cargando categorías:', e);
      setError('No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, [categories.length]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const saveCategories = async (newCategories: Category[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch {
      setError('No se pudieron guardar las categorías');
    }
  };

  const addCategory = async (input: CreateCategoryInput): Promise<void> => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      ...input,
    };
    await saveCategories([...categories, newCategory]);
  };

  const updateCategory = async (
    id: string,
    input: UpdateCategoryInput,
  ): Promise<void> => {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, ...input } : cat,
    );
    await saveCategories(updated);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const filtered = categories.filter((cat) => cat.id !== id);
    await saveCategories(filtered);
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    reload: loadCategories,
  };
}

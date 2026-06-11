import { useCallback, useEffect, useState } from 'react';
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/category';
import { apiRequest } from '@/lib/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Category[]>('/categories');
      setCategories(data);
      setError(null);
    } catch (e) {
      console.error('Error cargando categorías:', e);
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback(async (input: CreateCategoryInput): Promise<void> => {
    const newCategory = await apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setCategories((prev) => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback(async (
    id: number,
    input: UpdateCategoryInput,
  ): Promise<void> => {
    const updated = await apiRequest<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    setCategories((prev) => prev.map((cat) => (cat.id === id ? updated : cat)));
  }, []);

  const deleteCategory = useCallback(async (id: number): Promise<void> => {
    await apiRequest(`/categories/${id}`, { method: 'DELETE' });
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  }, []);

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
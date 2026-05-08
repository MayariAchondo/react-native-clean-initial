import { useState } from 'react';
import { z } from 'zod/v4';

const transactionSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a 0'),
  type: z.enum(['income', 'expense']),
  description: z.string().min(1, 'La descripción es obligatoria'),
  categoryId: z.string().min(1, 'Debes seleccionar una categoría'),
});

export function useTransactionForm() {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const result = transactionSchema.safeParse({
      amount: parseFloat(amount),
      type,
      description,
      categoryId,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }

  function reset() {
    setAmount('');
    setType('income');
    setDescription('');
    setCategoryId('');
    setErrors({});
  }

  return {
    amount, setAmount,
    type, setType,
    description, setDescription,
    categoryId, setCategoryId,
    errors,
    validate,
    reset,
  };
}
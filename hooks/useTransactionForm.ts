import type { Transaction } from '@/types/transaction';
import { useEffect, useState } from 'react';
import {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from '../schemas/transaction.schema';

type Props =
  | {
      mode: 'create';
      defaultValues?: {
        amount: string;
        type: Transaction['type'];
        description: string;
        categoryId: string;
      };
      onSubmit: (data: CreateTransactionInput) => Promise<void>;
    }
  | {
      mode: 'edit';
      defaultValues?: {
        amount: string;
        type: Transaction['type'];
        description: string;
        categoryId: string;
      };
      onSubmit: (data: UpdateTransactionInput) => Promise<void>;
    };

export function useTransactionForm({ mode, defaultValues, onSubmit }: Props) {
  const [amount, setAmount] = useState(defaultValues?.amount ?? '');
  const [type, setType] = useState<Transaction['type']>(
    defaultValues?.type ?? 'income',
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? '',
  );
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setAmount(defaultValues.amount);
      setType(defaultValues.type);
      setDescription(defaultValues.description);
      setCategoryId(defaultValues.categoryId);
    }
  }, [defaultValues]);

  async function handleSubmit() {
    const data = { amount: Number(amount), type, description, categoryId };

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const result = createTransactionSchema.safeParse(data);
        if (!result.success) {
          const flat = result.error.flatten();
          setErrors({
            amount: flat.fieldErrors.amount?.[0] ?? '',
            type: flat.fieldErrors.type?.[0] ?? '',
            description: flat.fieldErrors.description?.[0] ?? '',
            categoryId: flat.fieldErrors.categoryId?.[0] ?? '',
          });
          return;
        }
        await onSubmit(result.data);
      } else {
        const result = updateTransactionSchema.safeParse(data);
        if (!result.success) {
          const flat = result.error.flatten();
          setErrors({
            amount: flat.fieldErrors.amount?.[0] ?? '',
            type: flat.fieldErrors.type?.[0] ?? '',
            description: flat.fieldErrors.description?.[0] ?? '',
            categoryId: flat.fieldErrors.categoryId?.[0] ?? '',
          });
          return;
        }
        await onSubmit(result.data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return {
    amount,
    setAmount,
    type,
    setType,
    description,
    setDescription,
    categoryId,
    setCategoryId,
    errors,
    submitting,
    handleSubmit,
  };
}

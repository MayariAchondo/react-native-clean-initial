import { useState } from 'react';
import { z } from 'zod/v4';

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
});

export function useCategoryForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function validate() {
    const result = categorySchema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return false;
    }
    setError('');
    return true;
  }

  function reset() {
    setName('');
    setError('');
  }

  return { name, setName, error, validate, reset };
}
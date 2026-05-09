import { useEffect, useState } from 'react';
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../schemas/category.schema';

type Mode = 'create' | 'edit';

interface Props {
  mode: Mode;
  defaultValues?: { nombre: string };
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
}

export function useCategoryForm({ mode, defaultValues, onSubmit }: Props) {
  const [name, setName] = useState(defaultValues?.nombre ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.nombre);
    }
  }, [defaultValues]);

  async function handleSubmit() {
    const schema =
      mode === 'create' ? createCategorySchema : updateCategorySchema;
    const data = { name };

    const result = schema.safeParse(data);
    if (!result.success) {
      const flat = result.error.flatten();
      setErrors({
        nombre: flat.fieldErrors.name?.[0] ?? '',
      });
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  }

  return { name, setName, errors, submitting, handleSubmit };
}

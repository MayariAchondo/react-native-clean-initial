import * as z from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().int().min(1, 'El monto debe ser mayor a 0'),
  type: z.enum(['income', 'expense'], {
    message: "El tipo debe ser 'income' o 'expense'",
  }),
  description: z.string().min(1, 'La descripción es obligatoria'),
  categoryId: z.string().min(1, 'Debes seleccionar una categoría'),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

import * as z from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().int().positive('El monto debe ser mayor a 0'),
  type: z.enum(['income', 'expense'], {
    message: "El tipo debe ser 'income' o 'expense'",
  }),
  description: z.string().min(1, 'La descripción es obligatoria'),
  categoryId: z.number().int().positive('Debes seleccionar una categoría'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  receiptUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
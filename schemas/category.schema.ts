// validators/category.ts
import * as z from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
});

export const updateCategorySchema = createCategorySchema.partial(); // 👈 más limpio

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

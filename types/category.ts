export interface Category {
  id: number;
  name: string;
}

export type CreateCategoryInput = Pick<Category, 'name'>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
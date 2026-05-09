export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  categoryId: string;
}

export type CreateTransactionInput = Pick<
  Transaction,
  'amount' | 'type' | 'description' | 'categoryId'
>;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;

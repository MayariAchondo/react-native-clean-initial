export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  categoryId: number;
  receiptUrl?: string;
  latitude?: number;
  longitude?: number;
  category?: Category;
  userId?: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Balance {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export type CreateTransactionInput = Pick<
  Transaction,
  'amount' | 'type' | 'description' | 'categoryId' | 'date'
> & {
  receiptUrl?: string;
  latitude?: number;
  longitude?: number;
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;
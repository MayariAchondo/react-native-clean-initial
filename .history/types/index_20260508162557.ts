export interface Category {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  categoryId: string;
}
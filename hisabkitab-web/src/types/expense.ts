export interface Expense {
  _id: string;
  userId: string;
  userName: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStats {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  };
  categoryBreakdown: Array<{
    category: string;
    type: 'income' | 'expense';
    total: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    _id: {
      year: number;
      month: number;
      type: 'income' | 'expense';
    };
    total: number;
    count: number;
  }>;
  recentTransactions: Expense[];
  userSpending: Array<{
    userId: string;
    userName: string;
    totalSpent: number;
    transactionCount: number;
  }>;
}

export interface CreateExpenseDto {
  title: string;
  amount: number;
  category?: string;
  type?: 'income' | 'expense';
  description?: string;
  note?: string;
  date?: string;
  image?: string;
}

export interface UpdateExpenseDto {
  title?: string;
  amount?: number;
  category?: string;
  type?: 'income' | 'expense';
  description?: string;
  date?: string;
}

export type CategoryType = 'food' | 'rent' | 'other';

export const CATEGORIES: Record<CategoryType, { label: string; color: string; icon: string }> = {
  food: { label: 'Food', color: '#ff6b6b', icon: '🍔' },
  rent: { label: 'Rent', color: '#4ecdc4', icon: '🏠' },
  other: { label: 'Other', color: '#636e72', icon: '�' }
};

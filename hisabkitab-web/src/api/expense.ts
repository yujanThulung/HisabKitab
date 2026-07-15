import api from "./axios";
import type { Expense, ExpenseStats, CreateExpenseDto, UpdateExpenseDto } from "../types/expense";

export const expenseApi = {
  // Create new expense
  createExpense: async (data: CreateExpenseDto) => {
    const response = await api.post<{ message: string; data: { expense: Expense } }>('/expense/create', data);
    return response.data;
  },

  // Get expenses with filters and pagination
  getExpenses: async (params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get<{
      message: string;
      data: {
        expenses: Expense[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>('/expense', { params });
    return response.data;
  },

  // Get single expense by ID
  getExpenseById: async (id: string) => {
    const response = await api.get<{ message: string; data: { expense: Expense } }>(`/expense/${id}`);
    return response.data;
  },

  // Update expense
  updateExpense: async (id: string, data: UpdateExpenseDto) => {
    const response = await api.put<{ message: string; data: { expense: Expense } }>(`/expense/update/${id}`, data);
    return response.data;
  },

  // Delete expense - Not available in backend
  deleteExpense: async (_id: string) => {
    throw new Error('Delete functionality is not available');
  },

  // Get statistics - Using aggregated data from get expenses
  getStatistics: async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const response = await api.get<{ message: string; data: ExpenseStats }>('/expense/statistics', { params });
      return response.data;
    } catch (error) {
      // If statistics endpoint doesn't exist, calculate from expenses list
      const expensesResponse = await expenseApi.getExpenses(params);
      const expenses = expensesResponse.data.expenses || [];
      
      // Calculate statistics from expenses
      const stats: ExpenseStats = {
        summary: {
          totalIncome: 0,
          totalExpense: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
          balance: 0,
          transactionCount: expenses.length
        },
        categoryBreakdown: [],
        monthlyTrend: [],
        recentTransactions: expenses.slice(0, 5),
        userSpending: []
      };
      
      // Calculate user spending
      const userMap = new Map();
      expenses.forEach(expense => {
        const userName = expense.userName || 'Unknown';
        const userId = expense.userId || '';
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            userName,
            totalSpent: 0,
            transactionCount: 0
          });
        }
        const user = userMap.get(userId);
        user.totalSpent += expense.amount || 0;
        user.transactionCount += 1;
      });
      stats.userSpending = Array.from(userMap.values());
      
      // Calculate category breakdown
      const categoryMap = new Map();
      expenses.forEach(expense => {
        const category = expense.category || 'other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            category,
            type: 'expense' as const,
            total: 0,
            count: 0
          });
        }
        const cat = categoryMap.get(category);
        cat.total += expense.amount || 0;
        cat.count += 1;
      });
      stats.categoryBreakdown = Array.from(categoryMap.values());
      
      return { message: 'Statistics calculated', data: stats };
    }
  },

  // Get settlement summary
  getSettlementSummary: async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const response = await api.get<{
        message: string;
        data: {
          totalAmount: number;
          perPersonShare: number;
          userCount: number;
          settlements: Array<{
            userId: string;
            userName: string;
            totalSpent: number;
            share: number;
            balance: number;
            transactionCount: number;
          }>;
        };
      }>('/expense/settlement', { params });
      return response.data;
    } catch (error) {
      // If settlement endpoint doesn't exist, calculate from expenses
      const statsResponse = await expenseApi.getStatistics(params);
      const userSpending = statsResponse.data.userSpending || [];
      
      const totalAmount = userSpending.reduce((sum, user) => sum + user.totalSpent, 0);
      const userCount = userSpending.length;
      const perPersonShare = userCount > 0 ? totalAmount / userCount : 0;
      
      const settlements = userSpending.map(user => ({
        userId: user.userId,
        userName: user.userName,
        totalSpent: user.totalSpent,
        share: perPersonShare,
        balance: user.totalSpent - perPersonShare,
        transactionCount: user.transactionCount
      }));
      
      return {
        message: 'Settlement calculated',
        data: {
          totalAmount,
          perPersonShare,
          userCount,
          settlements: settlements.sort((a, b) => b.balance - a.balance)
        }
      };
    }
  }
};

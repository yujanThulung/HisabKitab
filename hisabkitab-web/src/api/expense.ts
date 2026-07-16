import api from './axios';
import type {
  Expense,
  ExpenseListResponse,
  CreateExpenseDto,
  UpdateExpenseDto,
} from '../types/expense';

export const expenseApi = {
  // Get expenses with optional date range and pagination
  getExpenses: async (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: ExpenseListResponse;
    }>('/expense', { params });
    return response.data;
  },

  // Get single expense by ID
  getExpenseById: async (id: string) => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: { expense: Expense };
    }>(`/expense/${id}`);
    return response.data;
  },

  // Create a new expense — sends FormData so image upload works
  createExpense: async (data: CreateExpenseDto) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('amount', String(data.amount));
    if (data.note) formData.append('note', data.note);
    if (data.date) formData.append('date', data.date);
    if (data.image) formData.append('image', data.image);

    const response = await api.post<{
      success: boolean;
      message: string;
      data: { expense: Expense };
    }>('/expense/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update an existing expense
  updateExpense: async (id: string, data: UpdateExpenseDto) => {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: { expense: Expense };
    }>(`/expense/update/${id}`, data);
    return response.data;
  },
};

// Single expense item from the backend
export interface ExpenseUser {
  _id: string;
  name: string;
  phone: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  image?: string;
  imagePublicId?: string | null;
  note?: string;
  date: string;
  userId: ExpenseUser;
  createdAt: string;
  updatedAt: string;
}

// data.summary.userTotals entry from GET /expense
export interface UserTotal {
  userId: string;
  name: string;
  phone: string;
  totalAmount: number;
}

// data.summary from GET /expense
export interface ExpenseSummary {
  grandTotal: number;
  userTotals: UserTotal[];
}

// Full data shape from GET /expense
export interface ExpenseListResponse {
  items: Expense[];
  summary: ExpenseSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CreateExpenseDto {
  title: string;
  amount: number;
  note?: string;
  date?: string;
  image?: File;   // actual File for upload; string URL when editing
}

export interface UpdateExpenseDto {
  title?: string;
  amount?: number;
  note?: string;
  date?: string;
}

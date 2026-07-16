import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'sonner';
import { expenseApi } from '../../../api/expense';
import type { Expense, ExpenseSummary } from '../../../types/expense';

export interface UserBreakdown {
  userId: string;
  name: string;
  totalAmount: number;
  transactionCount: number;
  balance: number;
  share: number;
}

export interface DashboardData {
  items: Expense[];
  grandTotal: number;
  perPersonShare: number;
  userBreakdown: UserBreakdown[];
  totalTransactions: number;
}

const DEFAULT_DATA: DashboardData = {
  items: [],
  grandTotal: 0,
  perPersonShare: 0,
  userBreakdown: [],
  totalTransactions: 0,
};

function deriveData(items: Expense[] = [], summary?: ExpenseSummary): DashboardData {
  const grandTotal = summary?.grandTotal ?? 0;
  const userTotals = summary?.userTotals ?? [];
  const userCount = userTotals.length;
  const perPersonShare = userCount > 0 ? grandTotal / userCount : 0;

  // Count transactions per user from items
  const txCountMap = new Map<string, number>();
  items.forEach(item => {
    const uid = item.userId?._id;
    if (uid) txCountMap.set(uid, (txCountMap.get(uid) ?? 0) + 1);
  });

  const userBreakdown: UserBreakdown[] = userTotals.map(u => ({
    userId: u.userId,
    name: u.name,
    totalAmount: u.totalAmount,
    transactionCount: txCountMap.get(u.userId) ?? 0,
    share: perPersonShare,
    balance: u.totalAmount - perPersonShare,
  }));

  userBreakdown.sort((a, b) => b.balance - a.balance);

  return {
    items,
    grandTotal,
    perPersonShare,
    userBreakdown,
    totalTransactions: items.length,
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await expenseApi.getExpenses({
        from: dateRange[0].toISOString(),
        to: dateRange[1].toISOString(),
        limit: 100,
      });

      setData(deriveData(res.data?.items, res.data?.summary));
    } catch (error: any) {
      setData(DEFAULT_DATA);
      if (error.response?.status === 404) {
        toast.info('No data yet. Start by adding your first purchase!');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  return { data, loading, dateRange, setDateRange, fetchData };
}

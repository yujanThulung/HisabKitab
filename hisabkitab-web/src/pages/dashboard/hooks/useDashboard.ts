import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'sonner';
import { expenseApi } from '../../../api/expense';
import { settlementApi, type CreateSettlementDto } from '../../../api/settlement';
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
  const [settling, setSettling] = useState(false);

  // lastSettledAt drives the start of the current cycle.
  // On mount we fetch the latest settlement to restore this across page refreshes.
  const [lastSettledAt, setLastSettledAt] = useState<Dayjs | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  // On mount: fetch the latest settlement and shift the date range start to
  // the day after settlement so the dashboard always shows the current cycle.
  useEffect(() => {
    const initFromLatestSettlement = async () => {
      try {
        const res = await settlementApi.getLatestSettlement();
        if (res.data?.settledAt) {
          const settledDay = dayjs(res.data.settledAt);
          setLastSettledAt(settledDay);
          // Use exact settlement timestamp so pre-settlement expenses on the same
          // day are excluded from the current cycle.
          setDateRange([settledDay, dayjs().endOf('month')]);
        }
      } catch {
        // No settlement yet — default range is fine, swallow the error silently
      }
    };

    initFromLatestSettlement();
  }, []);

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

  /**
   * handleSettle — called when the user confirms "Settle All".
   *
   * 1. Builds the full CreateSettlementDto from current data + dateRange
   * 2. POSTs to /settlement/create
   * 3. On success: updates lastSettledAt, shifts dateRange to new cycle
   *
   * The transactions array is computed here (same greedy algorithm as SettlementTab)
   * so the backend receives the exact resolved pay-graph.
   */
  const handleSettle = async (): Promise<boolean> => {
    const { userBreakdown, grandTotal, perPersonShare } = data;

    // Build transactions list (greedy balance resolution)
    const creditors = userBreakdown
      .filter(b => b.balance > 1e-9)
      .map(b => ({ ...b, remaining: b.balance }));
    const debtors = userBreakdown
      .filter(b => b.balance < -1e-9)
      .map(b => ({ ...b, remaining: -b.balance }));

    const transactions: CreateSettlementDto['transactions'] = [];
    let i = 0;
    let j = 0;
    while (i < creditors.length && j < debtors.length) {
      const pay = Math.min(creditors[i].remaining, debtors[j].remaining);
      transactions.push({
        fromId: debtors[j].userId,
        fromName: debtors[j].name,
        toId: creditors[i].userId,
        toName: creditors[i].name,
        amount: pay,
      });
      creditors[i].remaining -= pay;
      debtors[j].remaining -= pay;
      if (creditors[i].remaining < 1e-9) i++;
      if (debtors[j].remaining < 1e-9) j++;
    }

    const payload: CreateSettlementDto = {
      periodFrom: dateRange[0].toISOString(),
      periodTo: dayjs().toISOString(),
      transactions,
      userSnapshot: userBreakdown.map(u => ({
        userId: u.userId,
        name: u.name,
        totalAmount: u.totalAmount,
        balance: u.balance,
      })),
      totalAmount: grandTotal,
      perPersonShare,
    };

    setSettling(true);
    try {
      // TODO: uncomment when backend is ready
      // const res = await settlementApi.createSettlement(payload);
      // const settledDay = dayjs(res.data.settledAt);

      // Simulated response until backend is ready
      await new Promise(resolve => setTimeout(resolve, 800));
      const settledDay = dayjs();

      setLastSettledAt(settledDay);
      // Reset data immediately so the owed list clears right away
      setData(DEFAULT_DATA);
      // New cycle starts from the exact settlement timestamp — not startOf('day',
      // so existing today's expenses are excluded from the new cycle fetch.
      setDateRange([settledDay, dayjs().endOf('month')]);

      toast.success('All settled! New cycle starts from now.');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Settlement failed. Please try again.');
      return false;
    } finally {
      setSettling(false);
    }
  };

  return {
    data,
    loading,
    settling,
    lastSettledAt,
    dateRange,
    setDateRange,
    fetchData,
    handleSettle,
  };
}

import api from './axios';

// One leg of a settlement (who pays whom and how much)
export interface SettlementTransaction {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number; // always positive
}

// Per-person balance snapshot
export interface UserBalanceSnapshot {
  userId: string;
  name: string;
  totalAmount: number;
  balance: number; // positive = creditor, negative = debtor
}

// Full settlement record stored in the DB
export interface SettlementRecord {
  _id: string;
  settledAt: string;
  settledBy: string;
  periodFrom: string;
  periodTo: string;
  totalAmount: number;
  perPersonShare: number;
  transactions: SettlementTransaction[];
  userSnapshot: UserBalanceSnapshot[];
  createdAt: string;
  updatedAt: string;
}

// Preview shape — same structure but never saved, no _id/settledAt/settledBy
export interface SettlementPreview {
  periodFrom: string;
  periodTo: string;
  totalAmount: number;
  perPersonShare: number;
  transactions: SettlementTransaction[];
  userSnapshot: UserBalanceSnapshot[];
}

export const settlementApi = {
  // GET current open balances — computed live, not saved
  getPreview: async () => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: SettlementPreview | null;
    }>('/settlement/preview');
    return response.data;
  },

  // GET all settlement records sorted newest first — data[0] is the latest
  getSettlements: async () => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: SettlementRecord[];
    }>('/settlement');
    return response.data;
  },

  // POST — backend fetches expenses and computes + saves the settlement
  createSettlement: async () => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: SettlementRecord;
    }>('/settlement/create');
    return response.data;
  },
};

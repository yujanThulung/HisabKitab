import api from './axios';

// One leg of a settlement (who pays whom and how much)
export interface SettlementTransaction {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

// Per-person balance snapshot captured at settlement time
export interface UserBalanceSnapshot {
  userId: string;
  name: string;
  totalAmount: number;
  balance: number;
}

// Full settlement record stored in the DB
export interface SettlementRecord {
  _id: string;
  settledAt: string;           // ISO date string
  settledBy: string;           // userId
  periodFrom: string;          // ISO date — start of cycle
  periodTo: string;            // ISO date — end of cycle (= settledAt)
  transactions: SettlementTransaction[];
  userSnapshot: UserBalanceSnapshot[];
  totalAmount: number;
  perPersonShare: number;
  createdAt: string;
}

// Payload for POST /settlement/create
export interface CreateSettlementDto {
  periodFrom: string;
  periodTo: string;
  transactions: SettlementTransaction[];
  userSnapshot: UserBalanceSnapshot[];
  totalAmount: number;
  perPersonShare: number;
}

export const settlementApi = {
  // GET all settlement records (history)
  getSettlements: async () => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: SettlementRecord[];
    }>('/settlement');
    return response.data;
  },

  // GET the most recent settlement — used to set the dashboard date range on load
  getLatestSettlement: async () => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: SettlementRecord | null;
    }>('/settlement/latest');
    return response.data;
  },

  // POST a new settlement — freezes the current cycle and starts a new one
  createSettlement: async (data: CreateSettlementDto) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: SettlementRecord;
    }>('/settlement/create', data);
    return response.data;
  },
};

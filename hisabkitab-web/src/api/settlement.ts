import api from './axios';

export interface SettlementRecord {
  _id?: string;
  from?: { name?: string } | string;
  to?: { name?: string } | string;
  amount: number;
  date?: string;
  createdAt?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export const settlementApi = {
  // GET settlement history
  getSettlements: async () => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: SettlementRecord[];
    }>('/settlement');
    return response.data;
  },

  // POST a recorded settlement
  createSettlement: async (data: { from: string; to: string; amount: number }) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: SettlementRecord;
    }>('/settlement/create', data);
    return response.data;
  },
};

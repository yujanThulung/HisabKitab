import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { settlementApi, type SettlementRecord } from '../../../api/settlement';

export function useSettlementLogs() {
  const [logs, setLogs] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await settlementApi.getSettlements();
      // Backend returns newest first — no client-side sort needed
      setLogs(res.data ?? []);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to fetch settlement logs');
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, fetchLogs };
}

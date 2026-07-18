import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  settlementApi,
  type SettlementPreview,
  type SettlementRecord,
} from '../../../api/settlement';

export interface UseSettlementReturn {
  /** Live current-cycle balances from GET /settlement/preview. null = nothing unsettled. */
  preview: SettlementPreview | null;
  /** Most recently completed settlement (data[0] from GET /settlement). null = none yet. */
  lastSettlement: SettlementRecord | null;
  loading: boolean;
  settling: boolean;
  refresh: () => Promise<void>;
  /** POST /settlement/create — closes the cycle, refreshes both preview and lastSettlement. */
  settle: () => Promise<boolean>;
}

export function useSettlement(): UseSettlementReturn {
  const [preview, setPreview] = useState<SettlementPreview | null>(null);
  const [lastSettlement, setLastSettlement] = useState<SettlementRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Both calls are independent — fire in parallel
      const [previewRes, logsRes] = await Promise.all([
        settlementApi.getPreview(),
        settlementApi.getSettlements(),
      ]);
      setPreview(previewRes.data ?? null);
      // Backend returns newest first — index 0 is the latest completed settlement
      setLastSettlement(logsRes.data?.[0] ?? null);
    } catch {
      // Silently leave both as null — tab will show appropriate empty states
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const settle = useCallback(async (): Promise<boolean> => {
    setSettling(true);
    try {
      // Pass the exact period the user saw in the preview — backend uses these
      // to fetch and settle the right expense window.
      const body = preview
        ? { periodFrom: preview.periodFrom, periodTo: preview.periodTo }
        : undefined;

      const res = await settlementApi.createSettlement(body);
      setLastSettlement(res.data);
      setPreview(null);
      toast.success('All settled! New cycle starts from now.');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Settlement failed. Please try again.');
      return false;
    } finally {
      setSettling(false);
    }
  }, [preview]);

  return { preview, lastSettlement, loading, settling, refresh: fetchAll, settle };
}

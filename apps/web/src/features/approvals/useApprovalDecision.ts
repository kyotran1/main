import { useCallback, useState } from 'react';
import { api } from '@/lib/api';

export type DecisionMode = 'approve' | 'reject';

/**
 * Trạng thái quyết định cho MỘT yêu cầu: mở ô ghi chú theo hướng (duyệt/từ chối),
 * gọi api.decideApproval; store cập nhật qua realtime nên không cần tải lại.
 */
export function useApprovalDecision(approvalId: string) {
  const [mode, setMode] = useState<DecisionMode | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState<DecisionMode | null>(null);

  const open = useCallback((next: DecisionMode) => {
    setMode((cur) => (cur === next ? null : next));
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    setMode(null);
    setNote('');
    setError(null);
  }, []);

  const confirm = useCallback(async () => {
    if (!mode) return;
    setBusy(true);
    setError(null);
    try {
      const trimmed = note.trim();
      await api.decideApproval(approvalId, mode, trimmed ? { note: trimmed } : {});
      setDone(mode);
      setMode(null);
      setNote('');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }, [approvalId, mode, note]);

  return { mode, note, setNote, busy, error, done, open, cancel, confirm };
}

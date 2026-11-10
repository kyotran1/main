import { useCallback, useState } from 'react';
import { api } from '@/lib/api';

/**
 * Tạm dừng / tiếp tục một nhân sự AI. Store cập nhật qua realtime (agent.upserted)
 * nên không cần tải lại; chỉ giữ trạng thái bận và lỗi để hiển thị.
 */
export function useAgentPauseResume(agentId: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const toggle = useCallback(
    async (paused: boolean) => {
      setBusy(true);
      setError(null);
      try {
        if (paused) await api.resumeAgent(agentId);
        else await api.pauseAgent(agentId);
      } catch (err) {
        setError(err);
      } finally {
        setBusy(false);
      }
    },
    [agentId],
  );

  return { busy, error, toggle, clearError: () => setError(null) };
}

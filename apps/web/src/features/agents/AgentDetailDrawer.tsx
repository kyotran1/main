import { useTranslation } from 'react-i18next';
import { useOfficeStore } from '@/store/officeStore';

/**
 * NGĂN CHI TIẾT NHÂN SỰ AI – mở khi store.selectedAgentId có giá trị (mọi trang đều có thể gọi selectAgent(id)).
 * Được gắn một lần trong AppShell. TRIỂN KHAI THẬT thuộc gói công việc "tasks-agents-orgchart".
 */
export function AgentDetailDrawer() {
  const { t } = useTranslation();
  const selectedAgentId = useOfficeStore((s) => s.selectedAgentId);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  if (!selectedAgentId) return null;
  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md glass-strong p-4" role="dialog" aria-modal="true">
      <button type="button" className="text-sm text-text-muted" onClick={() => selectAgent(null)}>
        {t('common:labels.close')}
      </button>
    </aside>
  );
}

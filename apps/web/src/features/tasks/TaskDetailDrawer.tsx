import { useTranslation } from 'react-i18next';
import { useOfficeStore } from '@/store/officeStore';

/**
 * NGĂN CHI TIẾT CÔNG VIỆC – mở khi store.selectedTaskId có giá trị. Gắn một lần trong AppShell.
 * TRIỂN KHAI THẬT thuộc gói công việc "tasks-agents-orgchart".
 */
export function TaskDetailDrawer() {
  const { t } = useTranslation();
  const selectedTaskId = useOfficeStore((s) => s.selectedTaskId);
  const selectTask = useOfficeStore((s) => s.selectTask);
  if (!selectedTaskId) return null;
  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md glass-strong p-4" role="dialog" aria-modal="true">
      <button type="button" className="text-sm text-text-muted" onClick={() => selectTask(null)}>
        {t('common:labels.close')}
      </button>
    </aside>
  );
}

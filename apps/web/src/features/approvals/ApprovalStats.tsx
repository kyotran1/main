import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import type { ApprovalStatus } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForApprovalStatus } from '@ads-nolimit/i18n';
import { useDerived } from '@/store/hooks';
import { formatNumber } from '@/lib/format';
import { StatCard } from '@/components/ui/StatCard';
import { APPROVAL_STATUSES, selectApprovalStats } from './selectors';

const META: Record<ApprovalStatus, { accent: 'amber' | 'green' | 'red'; color: string; hintKey: string }> = {
  pending: { accent: 'amber', color: 'var(--color-status-waiting)', hintKey: 'approvals:stats.pendingHint' },
  approved: { accent: 'green', color: 'var(--color-status-done)', hintKey: 'approvals:stats.approvedHint' },
  rejected: { accent: 'red', color: 'var(--color-status-error)', hintKey: 'approvals:stats.rejectedHint' },
};

const ICONS: Record<ApprovalStatus, typeof Clock3> = { pending: Clock3, approved: CheckCircle2, rejected: XCircle };

/** Ba thẻ thống kê Chờ duyệt / Đã duyệt / Đã từ chối – bấm để lọc danh sách theo trạng thái. */
export function ApprovalStats({ active, onSelect }: { active: ApprovalStatus | 'all'; onSelect: (status: ApprovalStatus | 'all') => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const stats = useDerived(selectApprovalStats);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {APPROVAL_STATUSES.map((status) => {
        const label = bilingual(termIdForApprovalStatus(status), locale);
        const Icon = ICONS[status];
        const meta = META[status];
        const selected = active === status;
        return (
          <StatCard
            key={status}
            icon={<Icon className="size-5" aria-hidden="true" />}
            value={formatNumber(stats[status], locale)}
            label={label.primary}
            secondary={`${label.secondary} · ${t(meta.hintKey)}`}
            accent={meta.accent}
            color={meta.color}
            onClick={() => onSelect(selected ? 'all' : status)}
            className={selected ? 'ring-2 ring-white/30' : undefined}
          />
        );
      })}
    </div>
  );
}

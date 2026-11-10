import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock3, Play, ShieldAlert, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { StatCard } from '@/components/ui/StatCard';
import { useDerived } from '@/store/hooks';
import { selectHeadlineStats, type HeadlineStats as HeadlineStatsData } from '@/store/selectors';
import { useLocale } from '@ads-nolimit/i18n/react';
import { formatNumber } from '@/lib/format';

interface StatDef {
  key: keyof HeadlineStatsData;
  icon: LucideIcon;
  accent: 'cyan' | 'violet' | 'green' | 'amber' | 'red';
  /** Màu khớp với token trạng thái để trùng với biểu đồ vòng và các trang khác. */
  color: string;
  to: string;
  /** Khóa nav của trang đích – dùng cho tooltip "Mở …". */
  navKey: string;
}

/** Thứ tự và màu cố định theo thực thể (không đổi theo giá trị). */
const STATS: readonly StatDef[] = [
  { key: 'agents', icon: Users, accent: 'cyan', color: 'var(--color-brand-cyan)', to: '/agents', navKey: 'agents' },
  { key: 'running', icon: Play, accent: 'cyan', color: 'var(--color-status-running)', to: '/tasks', navKey: 'tasks' },
  { key: 'completed', icon: CheckCircle2, accent: 'green', color: 'var(--color-status-done)', to: '/tasks', navKey: 'tasks' },
  { key: 'pending', icon: Clock3, accent: 'amber', color: 'var(--color-status-waiting)', to: '/tasks', navKey: 'tasks' },
  { key: 'needsApproval', icon: ShieldAlert, accent: 'red', color: 'var(--color-status-approval)', to: '/approvals', navKey: 'approvals' },
];

/** Hàng 5 thẻ thống kê đầu trang Tổng quan – số liệu từ selectHeadlineStats (nguồn duy nhất). */
export function HeadlineStats() {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const stats = useDerived(selectHeadlineStats);

  // Dưới 420px xếp 1 cột để nhãn tiếng Việt không bị cắt; từ 420px trở lên 2–5 cột.
  return (
    <section aria-label={t('glossary:module.overview.inline')} className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
      {STATS.map((def, index) => {
        const Icon = def.icon;
        return (
          <div
            key={def.key}
            className={clsx('min-w-0', index === 0 && 'min-[420px]:col-span-2 sm:col-span-1')}
            title={t('overview:stats.openHint', { page: t(`nav:items.${def.navKey}.label`) })}
          >
            <StatCard
              icon={<Icon className="size-5 md:size-6" />}
              value={formatNumber(stats[def.key], locale)}
              label={t(`overview:stats.${def.key}.label`)}
              secondary={t(`overview:stats.${def.key}.secondary`)}
              accent={def.accent}
              color={def.color}
              onClick={() => navigate(def.to)}
            />
          </div>
        );
      })}
    </section>
  );
}

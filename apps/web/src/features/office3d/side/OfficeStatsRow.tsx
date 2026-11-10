import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2, Play, Users } from 'lucide-react';
import { bilingual } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useDerived } from '@/store/hooks';
import { selectHeadlineStats } from '@/store/selectors';
import { formatNumber } from '@/lib/format';

/**
 * Ba ô thống kê cột phải (Nhân sự AI / Công việc đang chạy / Đã hoàn thành).
 * Bố cục dọc để vừa cột hẹp 360px và màn hình 390px; số liệu từ selectHeadlineStats.
 */
export function OfficeStatsRow() {
  const { t } = useTranslation();
  const locale = useLocale();
  const stats = useDerived(selectHeadlineStats);
  const agents = bilingual('module.ai_agents', locale);
  const completed = bilingual('task_status.completed', locale);
  return (
    <div className="grid grid-cols-3 gap-2 xl:gap-3">
      <CompactStat to="/agents" icon={<Users className="size-4" />} value={formatNumber(stats.agents, locale)} label={agents.primary} secondary={agents.secondary} color="var(--color-brand-cyan)" />
      <CompactStat
        to="/tasks"
        icon={<Play className="size-4" />}
        value={formatNumber(stats.running, locale)}
        label={t('office3d:stats.runningTasks.label')}
        secondary={t('office3d:stats.runningTasks.secondary')}
        color="var(--color-status-running)"
      />
      <CompactStat to="/tasks" icon={<CheckCircle2 className="size-4" />} value={formatNumber(stats.completed, locale)} label={completed.primary} secondary={completed.secondary} color="var(--color-status-done)" />
    </div>
  );
}

function CompactStat({ to, icon, value, label, secondary, color }: { to: string; icon: ReactNode; value: string; label: string; secondary: string; color: string }) {
  return (
    <Link
      to={to}
      className="glass flex min-w-0 flex-col gap-1.5 p-3 transition hover:bg-white/[0.04] focus-visible:focus-ring"
      style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 18%, transparent), 0 0 22px color-mix(in srgb, ${color} 16%, transparent)` }}
      title={`${label} – ${secondary}`}
    >
      <span className="flex size-7 items-center justify-center rounded-lg" style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }} aria-hidden="true">
        {icon}
      </span>
      <span className="text-[26px] font-extrabold leading-none tracking-tight tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="term-stack">
        <span className="term-primary line-clamp-2 text-[11px] leading-tight">{label}</span>
        <span className="term-secondary truncate text-[9.5px]">{secondary}</span>
      </span>
    </Link>
  );
}

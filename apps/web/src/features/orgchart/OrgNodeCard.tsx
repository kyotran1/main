import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Agent } from '@ads-nolimit/shared';
import { useOfficeStore } from '@/store/officeStore';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName, useAgentDisplayName } from '@/components/domain/AgentName';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { AgentStatusBadge } from '@/components/domain/StatusBadges';
import { ROLE_COLOR_VAR } from '@/lib/colors';

export interface OrgNodeCardProps {
  agent: Agent;
  openTasks: number;
  /** Số nhánh con (nếu có) để hiển thị nút thu gọn. */
  childCount?: number;
  collapsed?: boolean;
  onToggle?: () => void;
  size?: 'md' | 'sm';
  className?: string;
}

/**
 * Nút trên sơ đồ: ảnh đại diện (vòng màu theo chức vụ), tên hai dòng, phòng ban rút gọn,
 * trạng thái và số việc mở. Bấm thẻ → selectAgent; nút nhỏ phía dưới thu gọn/mở nhánh.
 */
export function OrgNodeCard({ agent, openTasks, childCount = 0, collapsed, onToggle, size = 'md', className }: OrgNodeCardProps) {
  const { t } = useTranslation();
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const displayName = useAgentDisplayName();
  const roleColor = ROLE_COLOR_VAR[agent.role];
  const sm = size === 'sm';

  return (
    <div className={clsx('relative flex flex-col items-center', className)}>
      <button
        type="button"
        onClick={() => selectAgent(agent.id)}
        title={t('orgchart:node.openProfile', { name: displayName(agent) })}
        className={clsx(
          'glass-strong flex min-w-0 flex-col items-center gap-2 text-center transition hover:-translate-y-0.5 hover:bg-white/[0.06] focus-visible:focus-ring',
          sm ? 'w-[150px] p-2.5' : 'w-[176px] p-3',
        )}
        style={{ boxShadow: `inset 0 3px 0 ${roleColor}, var(--shadow-panel)` }}
      >
        <AgentAvatar agent={agent} size={sm ? 40 : 48} />
        <AgentName agent={agent} className={clsx('w-full items-center text-center [&>span]:max-w-full [&>.term-primary]:line-clamp-2 [&>.term-primary]:whitespace-normal', sm ? 'text-[12px]' : 'text-[13px]')} />
        <DepartmentName id={agent.departmentId} format="short" withDot className="max-w-full text-[11px] text-text-muted" />
        <div className="flex w-full items-center justify-center gap-1.5">
          <AgentStatusBadge status={agent.status} />
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-text-muted" title={t('orgchart:node.openTasks', { count: openTasks })}>
          {t('orgchart:node.openTasks', { count: openTasks })}
        </span>
      </button>
      {childCount > 0 && onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          title={collapsed ? t('orgchart:tree.expand', { count: childCount }) : t('orgchart:tree.collapse', { count: childCount })}
          aria-label={collapsed ? t('orgchart:tree.expand', { count: childCount }) : t('orgchart:tree.collapse', { count: childCount })}
          className="relative z-10 -mt-3 inline-flex h-6 items-center gap-1 rounded-full border border-line-strong bg-bg-panel px-2 text-[11px] font-bold text-text-muted shadow-[0_0_10px_rgba(34,211,238,0.25)] transition hover:text-text focus-visible:focus-ring"
        >
          {collapsed ? <ChevronDown className="size-3.5" aria-hidden="true" /> : <ChevronUp className="size-3.5" aria-hidden="true" />}
          {childCount}
        </button>
      ) : null}
    </div>
  );
}

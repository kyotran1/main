import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { clsx } from 'clsx';
import type { AgentRole } from '@ads-nolimit/shared';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName, useAgentDisplayName } from '@/components/domain/AgentName';
import { AgentStatusBadge } from '@/components/domain/StatusBadges';
import { useOfficeStore } from '@/store/officeStore';
import { useAgents } from '@/store/hooks';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { ViewAllLink } from '@/features/overview/KeyTasksCard';

/** Thứ tự hiển thị theo cấp bậc (giống Sơ đồ tổ chức). */
const ROLE_RANK: Record<AgentRole, number> = {
  ai_ceo: 0,
  ai_coo: 1,
  ai_project_manager: 2,
  ai_specialist: 3,
  ai_qa_reviewer: 4,
};

/** Lưới "Nhân sự AI": ảnh đại diện, tên song ngữ, trạng thái, hiệu suất; bấm → mở ngăn chi tiết. */
export function AgentGrid({ className }: { className?: string }) {
  const { t } = useTranslation();
  const agents = useAgents();
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const displayName = useAgentDisplayName();
  const sorted = useMemo(
    () => [...agents].sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role] || a.id.localeCompare(b.id)),
    [agents],
  );

  return (
    <Card accent="cyan" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<Users className="size-4.5" />}
        title={t('glossary:module.ai_agents.label')}
        subtitle={t('glossary:module.ai_agents.secondary')}
        action={<ViewAllLink to="/agents" label={t('glossary:action.view_all.label')} />}
      />
      {sorted.length === 0 ? (
        <EmptyState title={t('dashboard:agents.empty')} icon={<Users className="size-7" />} />
      ) : (
        <>
          <p className="mb-3 text-xs text-text-muted">{t('dashboard:agents.description', { count: sorted.length })}</p>
          {/* 4 cột ở màn rộng để tên song ngữ có đủ chỗ; ảnh đại diện và hiệu suất ở hàng đầu, tên chiếm trọn hàng dưới */}
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {sorted.map((agent) => {
              const roleColor = ROLE_COLOR_VAR[agent.role];
              return (
                <li key={agent.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => selectAgent(agent.id)}
                    title={t('dashboard:agents.openProfile', { name: displayName(agent) })}
                    className="flex h-full w-full flex-col gap-2 rounded-xl border border-line bg-white/[0.03] p-3 text-left transition hover:border-line-strong hover:bg-white/[0.06] focus-visible:focus-ring"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <AgentAvatar agent={agent} size={40} />
                      <span className="term-stack items-end text-right" title={`${t('dashboard:agents.performanceSecondary')} – ${t('dashboard:agents.performance')}`}>
                        <span className="text-lg font-extrabold leading-none text-text tabular-nums">{agent.performance}%</span>
                        <span className="term-secondary">{t('dashboard:agents.performance')}</span>
                      </span>
                    </div>
                    <AgentName agent={agent} className="w-full text-[13px]" />
                    <AgentStatusBadge status={agent.status} />
                    <ProgressBar value={agent.performance} color={roleColor} size="xs" className="mt-auto" label={`${t('dashboard:agents.performance')}: ${agent.performance}%`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}

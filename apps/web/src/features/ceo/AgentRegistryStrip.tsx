import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { ArrowRight, Users } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { formatPercent } from '@/lib/format';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName, useAgentDisplayName } from '@/components/domain/AgentName';
import { AgentStatusBadge } from '@/components/domain/StatusBadges';
import { selectRegistryAgents } from './selectors';

/**
 * "Agent Registry – Danh sách và cấu hình nhân sự AI (n)": dải thẻ cuộn ngang,
 * mỗi thẻ: ảnh đại diện, tên chức vụ song ngữ, trạng thái, hiệu suất; bấm → mở ngăn hồ sơ.
 */
export function AgentRegistryStrip({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const agents = useDerived(selectRegistryAgents);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const displayName = useAgentDisplayName();

  return (
    <Card accent="violet" className={clsx('@container', className)}>
      <CardHeader
        icon={<Users className="size-4.5" aria-hidden="true" />}
        title={
          <>
            <span className="@min-[48rem]:hidden">{t('glossary:module.agent_registry.short')}</span>
            <span className="hidden @min-[48rem]:inline">{t('glossary:module.agent_registry.inline')}</span> ({agents.length})
          </>
        }
        subtitle={`${t('glossary:module.agent_registry.secondary')} · ${t('ceo:registry.description')}`}
        action={
          <Link
            to="/agents"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring rounded"
            title={`${t('ceo:registry.viewDetails')} – ${t('ceo:registry.viewDetailsSecondary')}`}
          >
            {t('ceo:registry.viewDetails')}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />
      {agents.length === 0 ? (
        <EmptyState title={t('ceo:registry.empty')} icon={<Users className="size-7" aria-hidden="true" />} />
      ) : (
        <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
          {agents.map((agent) => {
            const roleColor = ROLE_COLOR_VAR[agent.role];
            return (
              <li key={agent.id} className="w-[220px] shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => selectAgent(agent.id)}
                  className="flex h-full w-full flex-col rounded-xl border border-line bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.07] focus-visible:focus-ring"
                  style={{ borderTopColor: roleColor, borderTopWidth: 2 }}
                  aria-label={t('ceo:registry.openProfile', { name: displayName(agent) })}
                >
                  <span className="flex items-center gap-3">
                    <AgentAvatar agent={agent} size={44} />
                    <AgentName agent={agent} className="min-w-0 text-sm" />
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-2">
                    <AgentStatusBadge status={agent.status} />
                    <span className="text-base font-extrabold tabular-nums" style={{ color: roleColor }} title={t('glossary:metric.performance.inline')}>
                      {formatPercent(agent.performance, locale)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

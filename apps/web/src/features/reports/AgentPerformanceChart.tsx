import { useTranslation } from 'react-i18next';
import { Gauge } from 'lucide-react';
import { clsx } from 'clsx';
import { AGENT_ROLES } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForRole } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName, useAgentDisplayName } from '@/components/domain/AgentName';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { formatPercent } from '@/lib/format';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { selectAgentPerformance } from './selectors';

/**
 * Hiệu suất nhân sự AI – biểu đồ cột ngang dựng bằng HTML (một hàng một nhân sự):
 * ảnh đại diện + tên song ngữ, thanh màu theo chức vụ, giá trị in đậm ở cuối thanh.
 * Dùng HTML thay SVG để nhãn song ngữ không bị cắt ở 390px và bấm được để mở hồ sơ.
 */
export function AgentPerformanceChart({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const displayName = useAgentDisplayName();
  const agents = useDerived(selectAgentPerformance);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const rolesPresent = AGENT_ROLES.filter((r) => agents.some((a) => a.role === r));
  const performance = terms('metric.performance');

  return (
    <Card accent="green" className={clsx('flex flex-col', className)}>
      <CardHeader icon={<Gauge className="size-4.5" />} title={t('reports:performance.title')} subtitle={t('reports:performance.secondary')} />
      {agents.length === 0 ? (
        <EmptyState title={t('reports:performance.empty')} icon={<Gauge className="size-7" />} />
      ) : (
        <>
          {/* Chú giải theo chức vụ */}
          <ul className="mb-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px]">
            {rolesPresent.map((r) => {
              const l = bilingual(termIdForRole(r), locale);
              return (
                <li key={r} className="flex items-center gap-1.5" title={l.inline}>
                  <span className="size-2.5 rounded-[3px]" style={{ background: ROLE_COLOR_VAR[r] }} aria-hidden="true" />
                  <span className="font-semibold text-text">{l.term}</span>
                </li>
              );
            })}
          </ul>
          <ol className="flex flex-col gap-2" aria-label={t('reports:performance.ariaLabel')}>
            {agents.map((agent) => {
              const color = ROLE_COLOR_VAR[agent.role];
              return (
                <li key={agent.id}>
                  <button
                    type="button"
                    onClick={() => selectAgent(agent.id)}
                    title={t('reports:performance.openProfile', { name: displayName(agent) })}
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-white/[0.05] focus-visible:focus-ring sm:grid-cols-[auto_minmax(140px,44%)_minmax(0,1fr)]"
                  >
                    <AgentAvatar agent={agent} size={30} />
                    <AgentName agent={agent} className="min-w-0 text-[13px]" />
                    <div className="col-span-2 mt-1 flex items-center gap-2 sm:col-span-1 sm:mt-0" title={`${performance.inline}: ${formatPercent(agent.performance, locale)}`}>
                      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/8" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={agent.performance} aria-label={`${performance.primary}: ${agent.performance}`}>
                        <div className="h-full rounded-full" style={{ width: `${agent.performance}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
                      </div>
                      <span className="w-10 shrink-0 text-right text-sm font-extrabold text-text tabular-nums">{agent.performance}</span>
                      <span className="hidden w-24 shrink-0 truncate text-right text-[11px] text-text-muted tabular-nums md:inline">{t('reports:performance.tasksDone', { count: agent.tasksCompleted })}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-xs text-text-dim">{t('reports:performance.description')}</p>
        </>
      )}
    </Card>
  );
}

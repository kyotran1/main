import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { ArrowDown, ArrowRight, ClipboardList, GitBranch, Inbox, Play, Search, Send } from 'lucide-react';
import type { WorkflowStage } from '@ads-nolimit/shared';
import { STAGE_OWNER_ROLE, WORKFLOW_STAGES } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForRole, termIdForStage } from '@ads-nolimit/i18n';
import { useDerived } from '@/store/hooks';
import { selectStageCounts } from '@/store/selectors';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { Card, CardHeader } from '@/components/ui/Card';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { selectStageOwners } from './selectors';

const STAGE_ICON: Record<WorkflowStage, typeof Inbox> = {
  receive: Inbox,
  plan: ClipboardList,
  assign: Send,
  execute: Play,
  review: Search,
  report: GitBranch,
};

/**
 * Sơ đồ pipeline 6 giai đoạn (WORKFLOW_STAGES): mỗi nút gồm số bước, tên giai đoạn song ngữ,
 * vai trò phụ trách (AgentName theo STAGE_OWNER_ROLE), số công việc đang mở (selectStageCounts)
 * và mô tả tiếng Việt. Mũi tên nối ngang ở màn rộng, dọc ở điện thoại. Bấm nút → chọn giai đoạn.
 */
export function PipelineDiagram({ selected, onSelect }: { selected: WorkflowStage | null; onSelect: (stage: WorkflowStage | null) => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const counts = useDerived(selectStageCounts);
  const owners = useDerived(selectStageOwners);

  return (
    <Card accent="violet" className="@container">
      <CardHeader icon={<GitBranch className="size-4.5" aria-hidden="true" />} title={t('workflow:pipeline.title')} subtitle={t('workflow:pipeline.secondary')} />
      <ol className="grid grid-cols-1 gap-3 @min-[52rem]:grid-cols-3 @min-[78rem]:grid-cols-6 @min-[78rem]:gap-5" aria-label={t('glossary:module.workflow.inline')}>
        {WORKFLOW_STAGES.map((stage, idx) => {
          const label = bilingual(termIdForStage(stage), locale);
          const role = STAGE_OWNER_ROLE[stage];
          const roleLabel = bilingual(termIdForRole(role), locale);
          const roleColor = ROLE_COLOR_VAR[role];
          const Icon = STAGE_ICON[stage];
          const agents = owners[stage];
          const lead = agents[0];
          const count = counts[stage];
          const active = selected === stage;
          const last = idx === WORKFLOW_STAGES.length - 1;
          return (
            <li key={stage} className="relative min-w-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(active ? null : stage)}
                title={t('workflow:pipeline.selectStage', { stage: label.inline })}
                className={clsx(
                  'flex h-full w-full flex-col rounded-2xl border p-3.5 text-left transition focus-visible:focus-ring',
                  active
                    ? 'border-brand-cyan/70 bg-brand-cyan/10 shadow-[0_0_28px_rgba(34,211,238,0.3)]'
                    : 'border-line bg-white/[0.03] hover:border-line-strong hover:bg-white/[0.06]',
                )}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${roleColor}, color-mix(in srgb, ${roleColor} 50%, black))`, boxShadow: `0 0 16px color-mix(in srgb, ${roleColor} 45%, transparent)` }}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="term-stack">
                      <span className="text-[10px] font-semibold tracking-wide text-text-dim">{t('workflow:pipeline.step', { n: idx + 1 })}</span>
                      <span className="term-primary text-sm leading-tight">{label.primary}</span>
                      <span className="term-secondary">{label.secondary}</span>
                    </span>
                  </span>
                  <span className="text-right" title={t('workflow:pipeline.openTasks', { count })}>
                    <span className={clsx('block text-2xl font-extrabold leading-none tabular-nums', count > 0 ? 'text-brand-cyan' : 'text-text-dim')}>{count}</span>
                    <span className="block text-[10px] text-text-muted">{t('workflow:pipeline.openTasks', { count }).replace(/^\d+\s*/, '')}</span>
                  </span>
                </span>

                <span className="mt-3 flex items-center gap-2 border-t border-line/60 pt-3">
                  {lead ? (
                    <>
                      <span className="flex -space-x-2">
                        {agents.slice(0, 3).map((a) => (
                          <AgentAvatar key={a.id} agent={a} size={24} showStatus={false} />
                        ))}
                      </span>
                      {agents.length > 1 ? (
                        <span className="term-stack min-w-0" title={roleLabel.inline}>
                          <span className="term-primary text-xs">
                            {roleLabel.term} <span className="text-text-muted">×{agents.length}</span>
                          </span>
                          <span className="term-secondary">{roleLabel.meaning}</span>
                        </span>
                      ) : (
                        <AgentName agent={lead} className="min-w-0 text-xs" />
                      )}
                    </>
                  ) : (
                    <span className="term-stack min-w-0" title={roleLabel.inline}>
                      <span className="term-primary text-xs">{roleLabel.term}</span>
                      <span className="term-secondary">{t('workflow:pipeline.noAgent')}</span>
                    </span>
                  )}
                </span>

                <span className="mt-2.5 line-clamp-4 text-[11px] leading-relaxed text-text-muted">{t(`workflow:stages.${stage}`)}</span>
              </button>

              {/* Mũi tên nối sang giai đoạn kế tiếp */}
              {!last ? (
                <>
                  <span aria-hidden="true" className="absolute top-1/2 -right-[22px] z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-bg-panel text-brand-cyan @min-[78rem]:flex">
                    <ArrowRight className="size-3.5" />
                  </span>
                  <span aria-hidden="true" className="mx-auto mt-1.5 -mb-1.5 flex size-6 items-center justify-center rounded-full border border-line-strong bg-bg-panel text-brand-cyan @min-[52rem]:hidden">
                    <ArrowDown className="size-3.5" />
                  </span>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

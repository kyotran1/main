import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, ClipboardList, FileBarChart, GitBranch, Inbox, Rocket, SearchCheck, UserCheck } from 'lucide-react';
import { clsx } from 'clsx';
import type { WorkflowStage } from '@ads-nolimit/shared';
import { STAGE_OWNER_ROLE, WORKFLOW_STAGES } from '@ads-nolimit/shared';
import { useTerms } from '@ads-nolimit/i18n/react';
import { termIdForRole, termIdForStage } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { useDerived } from '@/store/hooks';
import { selectStageCounts } from '@/store/selectors';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { ViewAllLink } from '@/features/overview/KeyTasksCard';

const STAGE_ICON: Record<WorkflowStage, LucideIcon> = {
  receive: Inbox,
  plan: ClipboardList,
  assign: UserCheck,
  execute: Rocket,
  review: SearchCheck,
  report: FileBarChart,
};

/**
 * "Quy trình làm việc": 6 giai đoạn nối tiếp (Tiếp nhận → … → Báo cáo) với số công việc đang mở
 * ở mỗi giai đoạn (selectStageCounts) và vai trò phụ trách (STAGE_OWNER_ROLE).
 */
export function WorkflowPipeline({ className }: { className?: string }) {
  const { t } = useTranslation();
  const terms = useTerms();
  const counts = useDerived(selectStageCounts);

  return (
    <Card accent="violet" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<GitBranch className="size-4.5" />}
        title={t('glossary:module.workflow.label')}
        subtitle={t('glossary:module.workflow.secondary')}
        action={<ViewAllLink to="/workflow" label={t('glossary:action.view_details.label')} />}
      />
      <p className="mb-3 text-xs text-text-muted">{t('dashboard:workflow.description')}</p>

      <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {WORKFLOW_STAGES.map((stage, index) => {
          const Icon = STAGE_ICON[stage];
          const label = terms(termIdForStage(stage));
          const ownerRole = STAGE_OWNER_ROLE[stage];
          const owner = terms(termIdForRole(ownerRole));
          const ownerColor = ROLE_COLOR_VAR[ownerRole];
          const count = counts[stage];
          const active = count > 0;
          const isLast = index === WORKFLOW_STAGES.length - 1;
          return (
            <li key={stage} className="relative min-w-0">
              <Link
                to="/workflow"
                title={`${t('dashboard:workflow.step', { n: index + 1 })}: ${label.inline}`}
                className={clsx(
                  'flex h-full flex-col gap-2 rounded-xl border p-3 transition hover:bg-white/[0.06] focus-visible:focus-ring',
                  active ? 'border-brand-violet/60 bg-brand-violet/10 shadow-[0_0_18px_rgba(139,92,246,0.18)]' : 'border-line bg-white/[0.02]',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={clsx('flex size-8 items-center justify-center rounded-lg', active ? 'bg-brand-violet/25 text-brand-purple' : 'bg-white/5 text-text-dim')}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-semibold text-text-dim">{t('dashboard:workflow.step', { n: index + 1 })}</span>
                </div>
                <span className={clsx('text-[26px] font-extrabold leading-none tracking-tight', active ? 'text-text' : 'text-text-dim')}>{count}</span>
                <span className="term-stack">
                  <span className="term-primary truncate text-[13px]">{label.short}</span>
                  <span className="term-secondary truncate">{label.secondary}</span>
                </span>
                <span className="mt-auto flex items-center gap-1.5 text-[11px] text-text-muted" title={`${t('dashboard:workflow.ownerPrefix')}: ${owner.inline}`}>
                  <span className="size-1.5 shrink-0 rounded-full" style={{ background: ownerColor, boxShadow: `0 0 6px ${ownerColor}` }} aria-hidden="true" />
                  <span className="truncate">{owner.term}</span>
                </span>
              </Link>
              {!isLast ? (
                <span className="pointer-events-none absolute top-1/2 -right-[13px] z-10 hidden size-5 -translate-y-1/2 items-center justify-center rounded-full bg-bg-panel text-text-dim ring-1 ring-line lg:flex" aria-hidden="true">
                  <ChevronRight className="size-3" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

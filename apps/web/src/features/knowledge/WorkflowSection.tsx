import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, UserRound } from 'lucide-react';
import { STAGE_OWNER_ROLE, WORKFLOW_STAGES } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForRole, termIdForStage } from '@ads-nolimit/i18n';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { SectionShell } from './SectionShell';

/**
 * Quy trình 6 giai đoạn: thanh tiến trình ngang (desktop) + thẻ từng giai đoạn với chức vụ phụ trách
 * (từ STAGE_OWNER_ROLE, nguồn dùng chung với backend) và kết quả đầu ra.
 */
export function WorkflowSection() {
  const { t } = useTranslation();
  const locale = useLocale();
  const workflowModule = bilingual('module.workflow', locale);

  return (
    <SectionShell id="workflow" lead={t('knowledge:workflow.lead')}>
      {/* Thanh tiến trình tóm tắt */}
      <ol className="mb-5 hidden items-stretch gap-0 md:flex" aria-hidden="true">
        {WORKFLOW_STAGES.map((stage, i) => {
          const label = bilingual(termIdForStage(stage), locale);
          const color = ROLE_COLOR_VAR[STAGE_OWNER_ROLE[stage]];
          return (
            <li key={stage} className="flex min-w-0 flex-1 items-center">
              <span
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl border border-line bg-white/[0.02] px-2 py-2.5 text-center"
                style={{ borderBottomColor: color, borderBottomWidth: 2 }}
              >
                <span className="text-[11px] font-semibold text-text-dim tabular-nums">{t('knowledge:workflow.stageLabel', { n: i + 1 })}</span>
                <span className="truncate text-xs font-bold text-text" title={label.inline}>
                  {label.short}
                </span>
              </span>
              {i < WORKFLOW_STAGES.length - 1 ? <ArrowRight className="mx-1 size-4 shrink-0 text-text-dim" /> : null}
            </li>
          );
        })}
      </ol>

      <ol className="flex flex-col gap-3">
        {WORKFLOW_STAGES.map((stage, i) => {
          const label = bilingual(termIdForStage(stage), locale);
          const role = STAGE_OWNER_ROLE[stage];
          const roleLabel = bilingual(termIdForRole(role), locale);
          const color = ROLE_COLOR_VAR[role];
          return (
            <li key={stage} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-white/[0.02] p-4 sm:grid-cols-[56px_minmax(0,1fr)]">
              <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-extrabold text-text-inverse tabular-nums"
                  style={{ background: color, boxShadow: `0 0 16px color-mix(in srgb, ${color} 45%, transparent)` }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="text-[11px] font-semibold text-text-dim sm:hidden">{t('knowledge:workflow.stageLabel', { n: i + 1 })}</span>
              </div>
              <div className="min-w-0">
                <h3 className="term-stack" title={label.inline}>
                  <span className="term-primary text-base leading-tight">{label.primary}</span>
                  <span className="term-secondary">{label.secondary}</span>
                </h3>
                <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-text-muted">{t(`knowledge:workflow.stages.${stage}.body`)}</p>
                <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-1.5">
                  <dt className="flex items-center gap-1.5 text-text-dim">
                    <UserRound className="size-3.5" aria-hidden="true" />
                    {t('knowledge:workflow.ownerLabel')}
                  </dt>
                  <dd className="min-w-0">
                    <span
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold"
                      style={{ color, borderColor: `color-mix(in srgb, ${color} 45%, transparent)`, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
                      title={roleLabel.inline}
                    >
                      <span className="truncate">{roleLabel.inline}</span>
                    </span>
                  </dd>
                  <dt className="flex items-center gap-1.5 text-text-dim">
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                    {t('knowledge:workflow.outputLabel')}
                  </dt>
                  <dd className="min-w-0 font-medium text-text">{t(`knowledge:workflow.stages.${stage}.output`)}</dd>
                </dl>
                {stage === 'review' ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-2.5 py-1 text-[11px] text-text-muted">
                    <RotateCcw className="size-3.5 text-brand-amber" aria-hidden="true" />
                    {t('knowledge:workflow.loopNote')}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <Link
        to="/workflow"
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/[0.07] focus-visible:focus-ring"
        title={workflowModule.inline}
      >
        {t('knowledge:quickstart.openModule', { module: workflowModule.primary })}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </SectionShell>
  );
}

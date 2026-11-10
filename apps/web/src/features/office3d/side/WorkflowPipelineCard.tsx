import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight, GitBranch } from 'lucide-react';
import { STAGE_OWNER_ROLE, WORKFLOW_STAGES } from '@ads-nolimit/shared';
import { bilingual, termIdForRole, termIdForStage } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useDerived } from '@/store/hooks';
import { selectStageCounts } from '@/store/selectors';
import { Card, CardHeader } from '@/components/ui/Card';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { formatNumber } from '@/lib/format';

/**
 * Quy trình 6 giai đoạn với số công việc đang mở ở mỗi bước (selectStageCounts).
 * Đây là một chuỗi thật nên đánh số bước; màu bước theo vai trò phụ trách (STAGE_OWNER_ROLE).
 */
export function WorkflowPipelineCard() {
  const { t } = useTranslation();
  const locale = useLocale();
  const counts = useDerived(selectStageCounts);
  const title = bilingual('module.workflow', locale);
  const viewAll = bilingual('action.view_all', locale);
  return (
    <Card>
      <CardHeader
        icon={<GitBranch className="size-4" />}
        title={title.primary}
        subtitle={title.secondary}
        action={
          <Link to="/workflow" className="text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring" title={viewAll.inline}>
            {viewAll.primary}
          </Link>
        }
      />
      <ol className="grid grid-cols-3 gap-2">
        {WORKFLOW_STAGES.map((stage, i) => {
          const label = bilingual(termIdForStage(stage), locale);
          const owner = STAGE_OWNER_ROLE[stage];
          const color = ROLE_COLOR_VAR[owner];
          const count = counts[stage];
          return (
            <li
              key={stage}
              className="relative min-w-0 rounded-xl border border-line bg-white/[0.03] p-2.5"
              title={`${label.inline} · ${t('office3d:pipeline.owner', { role: bilingual(termIdForRole(owner), locale).inline })}`}
            >
              <span className="flex items-center justify-between">
                <span className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums" style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }} aria-label={t('office3d:pipeline.step', { n: i + 1 })}>
                  {i + 1}
                </span>
                {i < WORKFLOW_STAGES.length - 1 ? <ChevronRight className="size-3 text-text-dim" aria-hidden="true" /> : null}
              </span>
              <span className="mt-2 block text-xl font-extrabold leading-none tabular-nums text-text">{formatNumber(count, locale)}</span>
              <span className="mt-1 block truncate text-[11px] font-semibold text-text">{label.short}</span>
              <span className="block truncate text-[9.5px] text-text-muted">{label.secondary}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2.5 text-[10.5px] text-text-muted">{t('office3d:pipeline.subtitle')}</p>
    </Card>
  );
}

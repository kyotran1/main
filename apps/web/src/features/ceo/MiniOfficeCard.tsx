import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Boxes, Maximize2 } from 'lucide-react';
import type { AgentStatus } from '@ads-nolimit/shared';
import { useTerms } from '@ads-nolimit/i18n/react';
import { termIdForAgentStatus } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { selectAgentCounts } from '@/store/selectors';
import { AGENT_STATUS_COLOR_VAR } from '@/lib/colors';
import { Card, CardHeader } from '@/components/ui/Card';
import { OfficeScene } from '@/features/office3d/OfficeScene';

/** Trạng thái nhân sự luôn hiển thị trên dòng tổng (các trạng thái khác chỉ hiện khi > 0). */
const ALWAYS_SHOWN: readonly AgentStatus[] = ['running', 'active', 'waiting', 'idle', 'error'];
const OPTIONAL: readonly AgentStatus[] = ['paused'];

/**
 * "Văn phòng ảo 3D (Thu nhỏ)" – nhúng OfficeScene mode="mini" (đọc store, cập nhật realtime)
 * cùng dòng tổng số nhân sự AI theo trạng thái từ selectAgentCounts.
 */
export function MiniOfficeCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const terms = useTerms();
  const counts = useDerived(selectAgentCounts);
  const selectAgent = useOfficeStore((s) => s.selectAgent);

  const statuses: AgentStatus[] = [...ALWAYS_SHOWN, ...OPTIONAL.filter((st) => counts.byStatus[st] > 0)];

  return (
    <Card accent="cyan" padded={false} className={clsx('@container', className)}>
      <CardHeader
        className="mb-0 px-4 pt-4 md:px-5"
        icon={<Boxes className="size-4.5" aria-hidden="true" />}
        title={t('ceo:office.title')}
        subtitle={t('ceo:office.secondary')}
        action={
          <Link
            to="/office"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong bg-white/[0.03] px-2.5 text-xs font-semibold text-text hover:bg-white/[0.08] focus-visible:focus-ring"
            title={`${t('ceo:office.openFull')} – ${t('ceo:office.openFullSecondary')}`}
          >
            <Maximize2 className="size-3.5 text-brand-cyan" aria-hidden="true" />
            <span className="hidden @min-[30rem]:inline">{t('ceo:office.openFull')}</span>
          </Link>
        }
      />
      <div className="px-3 pt-3 md:px-4">
        <OfficeScene mode="mini" className="h-[240px] sm:h-[280px] xl:h-[320px]" onSelectAgent={(id) => selectAgent(id)} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 text-xs md:px-5">
        <span className="font-semibold text-text" title={`${t('ceo:office.total', { count: counts.total })} (${t('ceo:office.totalSecondary')})`}>
          {t('ceo:office.total', { count: counts.total })}
        </span>
        {statuses.map((st) => {
          const label = terms(termIdForAgentStatus(st));
          const color = AGENT_STATUS_COLOR_VAR[st];
          return (
            <span key={st} className="inline-flex items-center gap-1.5 text-text-muted" title={label.inline}>
              <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} aria-hidden="true" />
              {label.primary}
              <span className="font-bold text-text tabular-nums">({counts.byStatus[st]})</span>
            </span>
          );
        })}
      </div>
    </Card>
  );
}

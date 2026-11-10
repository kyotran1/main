import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Lightbulb, Loader } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { formatTime } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { selectQuickReport } from './selectors';

/**
 * "Báo cáo nhanh của AI CEO" – các gạch đầu dòng sinh từ dữ liệu store (dự án, công việc,
 * rủi ro, đề xuất) kèm thời điểm cập nhật của snapshot. Không dùng số liệu giả.
 */
export function CeoQuickReport({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const report = useDerived(selectQuickReport);
  const updatedAt = useOfficeStore((s) => s.updatedAt);
  const { counts, projects, pendingApprovals } = report;
  const firstPending = pendingApprovals[0];
  const hasData = counts.total > 0 || projects.length > 0;

  const items: { key: string; icon: ReactNode; text: string; tone: string }[] = [
    ...projects.map((p) => ({
      key: `project-${p.id}`,
      icon: <CheckCircle2 className="size-4" aria-hidden="true" />,
      text: t('ceo:report.project', { name: p.name, percent: Math.round(p.progress) }),
      tone: 'var(--color-brand-green)',
    })),
    {
      key: 'completed',
      icon: <CheckCircle2 className="size-4" aria-hidden="true" />,
      text: t('ceo:report.completed', { count: counts.byStatus.completed, total: counts.total, percent: counts.completionRate }),
      tone: 'var(--color-brand-green)',
    },
    {
      key: 'in-progress',
      icon: <Loader className="size-4" aria-hidden="true" />,
      text: t('ceo:report.inProgress', { count: counts.byStatus.in_progress, waiting: counts.byStatus.pending + counts.byStatus.not_started }),
      tone: 'var(--color-brand-blue)',
    },
    {
      key: 'risk',
      icon: <AlertTriangle className="size-4" aria-hidden="true" />,
      text:
        counts.byStatus.overdue + counts.byStatus.blocked > 0
          ? t('ceo:report.risk', { overdue: counts.byStatus.overdue, blocked: counts.byStatus.blocked })
          : t('ceo:report.riskNone'),
      tone: counts.byStatus.overdue + counts.byStatus.blocked > 0 ? 'var(--color-brand-amber)' : 'var(--color-brand-green)',
    },
    {
      key: 'proposal',
      icon: <Lightbulb className="size-4" aria-hidden="true" />,
      text: firstPending ? t('ceo:report.proposal', { count: pendingApprovals.length, title: firstPending.title }) : t('ceo:report.proposalNone'),
      tone: 'var(--color-brand-violet)',
    },
  ];

  return (
    <Card accent="amber" className={className}>
      <CardHeader
        icon={<FileText className="size-4.5" aria-hidden="true" />}
        title={t('ceo:report.title')}
        subtitle={updatedAt ? `${t('ceo:report.secondary')} · ${t('ceo:report.updatedAt', { time: formatTime(updatedAt, locale) })}` : t('ceo:report.secondary')}
      />
      {!hasData ? (
        <EmptyState title={t('ceo:report.empty')} icon={<FileText className="size-7" aria-hidden="true" />} />
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.key} className="flex items-start gap-2.5 text-[13px] leading-snug text-text">
                <span className="mt-px shrink-0" style={{ color: item.tone }}>
                  {item.icon}
                </span>
                <span className="min-w-0 [overflow-wrap:anywhere]">{item.text}</span>
              </li>
            ))}
          </ul>
          {pendingApprovals.length > 0 ? (
            <Link
              to="/approvals"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring rounded"
            >
              {t('ceo:report.goToApprovals')}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </>
      )}
    </Card>
  );
}

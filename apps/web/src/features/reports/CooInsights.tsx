import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForDepartment } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { formatNumber, formatSignedPercent } from '@/lib/format';
import { selectCooInsights } from './selectors';

type Tone = 'good' | 'warn' | 'info';

interface Insight {
  key: string;
  tone: Tone;
  text: string;
  action?: { to: string; label: string };
}

const TONE: Record<Tone, { color: string; icon: ReactNode }> = {
  good: { color: 'var(--color-status-done)', icon: <CheckCircle2 className="size-4" /> },
  warn: { color: 'var(--color-status-waiting)', icon: <AlertTriangle className="size-4" /> },
  info: { color: 'var(--color-brand-cyan)', icon: <Info className="size-4" /> },
};

/**
 * "Nhận định của AI COO" – các câu nhận định sinh từ dữ liệu store (tỷ lệ hoàn thành,
 * quá hạn, bị chặn, chờ duyệt, phòng ban dẫn đầu/cần hỗ trợ, KPI). Văn bản là bản dịch giao diện
 * có tham số (reports:insights.*), không phải dữ liệu từ backend.
 */
export function CooInsights({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const data = useDerived(selectCooInsights);
  const coo = useDerived((s) => Object.values(s.agents).find((a) => a.role === 'ai_coo'));
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const displayName = useAgentDisplayName();

  const insights: Insight[] = [];
  if (data.totalTasks > 0) {
    insights.push({ key: 'completion', tone: 'info', text: t('reports:insights.completion', { done: data.completed, total: data.totalTasks, rate: data.completionRate }) });
    insights.push(
      data.completionRate >= 70
        ? { key: 'rate', tone: 'good', text: t('reports:insights.completionHigh', { rate: data.completionRate }) }
        : { key: 'rate', tone: 'warn', text: t('reports:insights.completionLow', { rate: data.completionRate }) },
    );
    insights.push(
      data.overdue === 0
        ? { key: 'overdue', tone: 'good', text: t('reports:insights.overdueNone') }
        : { key: 'overdue', tone: 'warn', text: t('reports:insights.overdueSome', { count: data.overdue }), action: { to: '/tasks', label: t('reports:insights.goToTasks') } },
    );
    if (data.blocked > 0) insights.push({ key: 'blocked', tone: 'warn', text: t('reports:insights.blocked', { count: data.blocked }), action: { to: '/tasks', label: t('reports:insights.goToTasks') } });
  }
  insights.push(
    data.pendingApprovals === 0
      ? { key: 'approvals', tone: 'good', text: t('reports:insights.approvalsNone') }
      : { key: 'approvals', tone: 'warn', text: t('reports:insights.approvalsSome', { count: data.pendingApprovals }), action: { to: '/approvals', label: t('reports:insights.goToApprovals') } },
  );
  if (data.top) insights.push({ key: 'top', tone: 'good', text: t('reports:insights.topDepartment', { department: bilingual(termIdForDepartment(data.top.departmentId), locale).short, rate: data.top.rate }) });
  if (data.lagging) insights.push({ key: 'lagging', tone: 'info', text: t('reports:insights.laggingDepartment', { department: bilingual(termIdForDepartment(data.lagging.departmentId), locale).short, rate: data.lagging.rate }) });
  if (data.agentsTotal > 0) insights.push({ key: 'agents', tone: 'info', text: t('reports:insights.agentsRunning', { count: data.agentsRunning, total: data.agentsTotal }) });
  if (data.kpi) {
    insights.push({
      key: 'kpi',
      tone: 'info',
      text: t('reports:insights.kpi', {
        leads: formatSignedPercent(data.kpi.leads, locale),
        conversion: formatSignedPercent(data.kpi.conversion, locale),
        roi: t('common:units.times', { value: formatNumber(data.kpi.roi, locale, { maximumFractionDigits: 1 }) }),
      }),
    });
  }

  return (
    <Card accent="violet" strong className={clsx('relative flex flex-col overflow-hidden', className)}>
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-brand-violet/30 blur-3xl" aria-hidden="true" />
      <CardHeader
        icon={<Sparkles className="size-4.5" />}
        title={t('reports:insights.title')}
        subtitle={t('reports:insights.secondary')}
        action={
          coo ? (
            <button type="button" onClick={() => selectAgent(coo.id)} title={displayName(coo)} aria-label={displayName(coo)} className="flex items-center rounded-xl p-1 hover:bg-white/[0.05] focus-visible:focus-ring">
              <AgentAvatar agent={coo} size={32} />
            </button>
          ) : null
        }
      />
      <p className="mb-3 text-xs text-text-muted">{t('reports:insights.intro')}</p>
      {insights.length === 0 ? (
        <EmptyState title={t('reports:insights.empty')} icon={<Sparkles className="size-7" />} />
      ) : (
        <ul className="relative flex flex-col gap-2">
          {insights.map((item) => {
            const tone = TONE[item.tone];
            return (
              <li key={item.key} className="flex items-start gap-3 rounded-xl border border-line/50 bg-white/[0.03] px-3 py-2.5">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full" style={{ color: tone.color, background: `color-mix(in srgb, ${tone.color} 16%, transparent)` }} aria-hidden="true">
                  {tone.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-text">{item.text}</p>
                  {item.action ? (
                    <Link to={item.action.to} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring">
                      {item.action.label}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

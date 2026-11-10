import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { AgentRole } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForRole } from '@ads-nolimit/i18n';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { Card, CardHeader } from '@/components/ui/Card';

type Actor = { role: AgentRole } | { owner: true };

/** Chuỗi trách nhiệm cố định: AI CEO lập kế hoạch → Owner phê duyệt → PM phân công → … */
const CHAIN: { actor: Actor; actionKey: string }[] = [
  { actor: { role: 'ai_ceo' }, actionKey: 'workflow:rules.actions.plan' },
  { actor: { owner: true }, actionKey: 'workflow:rules.actions.approve' },
  { actor: { role: 'ai_project_manager' }, actionKey: 'workflow:rules.actions.assign' },
  { actor: { role: 'ai_specialist' }, actionKey: 'workflow:rules.actions.execute' },
  { actor: { role: 'ai_qa_reviewer' }, actionKey: 'workflow:rules.actions.review' },
  { actor: { role: 'ai_coo' }, actionKey: 'workflow:rules.actions.report' },
];

const RULE_KEYS = ['workflow:rules.items.approvalFirst', 'workflow:rules.items.qaGate', 'workflow:rules.items.realtime'] as const;

/** Khối "Quy tắc quản trị": chuỗi vai trò → hành động (song ngữ) và các nguyên tắc bất biến. */
export function GovernanceRules({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <Card accent="amber" className={className}>
      <CardHeader icon={<ShieldCheck className="size-4.5" aria-hidden="true" />} title={t('workflow:rules.title')} subtitle={`${t('workflow:rules.secondary')} · ${t('workflow:rules.description')}`} />
      <ol className="flex flex-wrap items-center gap-y-2">
        {CHAIN.map((step, idx) => {
          const isOwner = 'owner' in step.actor;
          const label = isOwner
            ? { term: t('common:owner.title'), meaning: t('common:owner.secondary'), inline: `${t('common:owner.secondary')} – ${t('common:owner.title')}` }
            : bilingual(termIdForRole(step.actor.role), locale);
          const color = isOwner ? 'var(--color-brand-green)' : ROLE_COLOR_VAR[step.actor.role];
          return (
            <Fragment key={step.actionKey}>
              <li className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5" style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }} title={label.inline}>
                <span className="size-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} aria-hidden="true" />
                <span className="term-stack">
                  <span className="term-primary text-xs">
                    <span style={{ color }}>{label.term}</span> {t(step.actionKey)}
                  </span>
                  <span className="term-secondary">{label.meaning}</span>
                </span>
              </li>
              {idx < CHAIN.length - 1 ? <ArrowRight className="mx-1.5 size-4 shrink-0 text-text-dim" aria-hidden="true" /> : null}
            </Fragment>
          );
        })}
      </ol>
      <ul className="mt-4 flex flex-col gap-2 border-t border-line/60 pt-3">
        {RULE_KEYS.map((key, idx) => (
          <li key={key} className="flex items-start gap-2.5 text-[13px] leading-snug text-text">
            <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-amber/15 text-[11px] font-bold text-brand-amber tabular-nums">{idx + 1}</span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

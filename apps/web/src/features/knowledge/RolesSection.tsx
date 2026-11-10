import { useTranslation } from 'react-i18next';
import { ChevronDown, Crown } from 'lucide-react';
import type { AgentRole } from '@ads-nolimit/shared';
import { AGENT_ROLES } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForRole } from '@ads-nolimit/i18n';
import type { OfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { SectionShell } from './SectionShell';

/** Cấp trên trực tiếp của từng chức vụ – null là Chủ doanh nghiệp. */
const REPORTS_TO: Record<AgentRole, AgentRole | null> = {
  ai_ceo: null,
  ai_coo: 'ai_ceo',
  ai_project_manager: 'ai_coo',
  ai_specialist: 'ai_project_manager',
  ai_qa_reviewer: 'ai_coo',
};

/** Số nhân sự AI thực tế đang giữ từng chức vụ – đọc từ store duy nhất để khớp Sơ đồ tổ chức. */
const selectRoleCounts = (s: OfficeStore): Record<AgentRole, number> => {
  const out = Object.fromEntries(AGENT_ROLES.map((r) => [r, 0])) as Record<AgentRole, number>;
  for (const agent of Object.values(s.agents)) out[agent.role] += 1;
  return out;
};

/** Vai trò năm chức vụ AI: chuỗi báo cáo + thẻ mô tả, trách nhiệm và số nhân sự đang giữ chức vụ. */
export function RolesSection() {
  const { t } = useTranslation();
  const locale = useLocale();
  const counts = useDerived(selectRoleCounts);

  return (
    <SectionShell id="roles" lead={t('knowledge:roles.lead')}>
      {/* Chuỗi báo cáo */}
      <div className="mb-5 rounded-2xl border border-line bg-bg-base/40 p-4">
        <span className="term-stack mb-3" title={`${t('knowledge:roles.chainSecondary')} – ${t('knowledge:roles.chainTitle')}`}>
          <span className="term-primary text-sm">{t('knowledge:roles.chainTitle')}</span>
          <span className="term-secondary">{t('knowledge:roles.chainSecondary')}</span>
        </span>
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/50 bg-brand-gold/10 px-3 py-1 font-semibold text-text">
            <Crown className="size-3.5 text-brand-gold" aria-hidden="true" />
            {t('knowledge:roles.reportsToOwner')}
          </li>
          {(['ai_ceo', 'ai_coo', 'ai_project_manager', 'ai_specialist'] as const).map((role) => {
            const label = bilingual(termIdForRole(role), locale);
            const color = ROLE_COLOR_VAR[role];
            return (
              <li key={role} className="inline-flex items-center gap-2">
                <ChevronDown className="size-3.5 -rotate-90 text-text-dim" aria-hidden="true" />
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold"
                  style={{ color, borderColor: `color-mix(in srgb, ${color} 45%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
                  title={label.inline}
                >
                  {label.term}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {AGENT_ROLES.map((role) => {
          const label = bilingual(termIdForRole(role), locale);
          const color = ROLE_COLOR_VAR[role];
          const duties = t(`knowledge:roles.items.${role}.duties`, { returnObjects: true }) as string[];
          const boss = REPORTS_TO[role];
          const bossLabel = boss ? bilingual(termIdForRole(boss), locale) : null;
          const count = counts[role];
          return (
            <li
              key={role}
              className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-white/[0.02] p-4"
              style={{ borderTopColor: `color-mix(in srgb, ${color} 70%, transparent)`, borderTopWidth: 2 }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="term-stack min-w-0" title={label.inline}>
                  <span className="term-primary text-base leading-tight" style={{ color }}>
                    {label.term}
                  </span>
                  <span className="term-secondary text-text">{label.meaning}</span>
                </h3>
                <span
                  className="shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums"
                  style={{ color, borderColor: `color-mix(in srgb, ${color} 40%, transparent)` }}
                  title={count > 0 ? t('knowledge:roles.holders', { count }) : t('knowledge:roles.noHolders')}
                >
                  {count > 0 ? t('knowledge:roles.holders', { count }) : t('knowledge:roles.noHolders')}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-text-muted">{t(`knowledge:roles.items.${role}.summary`)}</p>
              <div className="text-xs">
                <span className="text-text-dim">{t('knowledge:roles.responsibilities')}</span>
                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {duties.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-text">
                      <span className="mt-[7px] size-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-auto flex flex-wrap items-center gap-x-1.5 border-t border-line pt-3 text-xs text-text-dim">
                <span>{t('knowledge:roles.reportsTo')}:</span>
                <span className="font-semibold text-text-muted" title={bossLabel?.inline}>
                  {bossLabel ? bossLabel.inline : t('knowledge:roles.reportsToOwner')}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

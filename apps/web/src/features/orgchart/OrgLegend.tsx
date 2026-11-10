import { useTranslation } from 'react-i18next';
import type { AgentRole, AgentStatus } from '@ads-nolimit/shared';
import { AGENT_ROLES } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForAgentStatus, termIdForRole } from '@ads-nolimit/i18n';
import { AGENT_STATUS_COLOR_VAR, ROLE_COLOR_VAR } from '@/lib/colors';

const STATUSES: readonly AgentStatus[] = ['running', 'active', 'waiting', 'idle', 'paused', 'error'];

/** Chú thích: màu chấm trạng thái (song ngữ) và màu vòng theo chức vụ. */
export function OrgLegend({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <div className={className}>
      <div className="glass flex flex-col gap-3 p-3.5 md:flex-row md:items-start md:gap-8">
        <LegendGroup label={t('orgchart:legend.title')} secondary={t('orgchart:legend.secondary')}>
          {STATUSES.map((s) => {
            const label = bilingual(termIdForAgentStatus(s), locale);
            const color = AGENT_STATUS_COLOR_VAR[s];
            return (
              <li key={s} className="inline-flex items-center gap-1.5 text-xs text-text" title={label.inline}>
                <span className="size-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} aria-hidden="true" />
                <span>
                  {label.primary} <span className="text-text-muted">({label.secondary})</span>
                </span>
              </li>
            );
          })}
        </LegendGroup>
        <LegendGroup label={t('orgchart:legend.roleTitle')} secondary={t('orgchart:legend.roleSecondary')}>
          {(AGENT_ROLES as readonly AgentRole[]).map((r) => {
            const label = bilingual(termIdForRole(r), locale);
            const color = ROLE_COLOR_VAR[r];
            return (
              <li key={r} className="inline-flex items-center gap-1.5 text-xs text-text" title={label.inline}>
                <span className="size-3 rounded-full border-2" style={{ borderColor: color, boxShadow: `0 0 8px ${color}` }} aria-hidden="true" />
                <span>
                  {label.term} <span className="text-text-muted">– {label.meaning}</span>
                </span>
              </li>
            );
          })}
        </LegendGroup>
      </div>
    </div>
  );
}

function LegendGroup({ label, secondary, children }: { label: string; secondary: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="term-stack mb-2" title={`${secondary} – ${label}`}>
        <span className="term-primary text-xs">{label}</span>
        <span className="term-secondary">{secondary}</span>
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">{children}</ul>
    </div>
  );
}

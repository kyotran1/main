import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import type { Agent } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForRole } from '@ads-nolimit/i18n';

/**
 * Tên nhân sự AI theo chuẩn song ngữ:
 * - Dòng chính: tên gọi (displayName) hoặc chức vụ tiếng Anh gốc (vd "AI CEO").
 * - Dòng phụ: nghĩa tiếng Việt của chức vụ (vd "Giám đốc điều hành AI").
 * Luôn có tooltip "AI CEO – Giám đốc điều hành AI".
 */
export function AgentName({ agent, format = 'stacked', className }: { agent: Agent; format?: 'stacked' | 'inline' | 'primary'; className?: string }) {
  const locale = useLocale();
  const role = bilingual(termIdForRole(agent.role), locale);
  const primary = agent.displayName ? `${agent.displayName}` : role.term;
  const secondary = agent.displayName ? role.inline : role.meaning;
  const tooltip = role.inline;
  if (format === 'inline') {
    return (
      <span className={className} title={tooltip}>
        {agent.displayName ? `${agent.displayName} · ${role.inline}` : role.inline}
      </span>
    );
  }
  if (format === 'primary') {
    return (
      <span className={className} title={tooltip}>
        {primary}
      </span>
    );
  }
  return (
    <span className={clsx('term-stack', className)} title={tooltip}>
      <span className="term-primary truncate">{primary}</span>
      <span className="term-secondary truncate">{secondary}</span>
    </span>
  );
}

export function useAgentDisplayName() {
  const locale = useLocale();
  const { t } = useTranslation();
  return (agent: Agent | undefined, fallback?: string): string => {
    if (!agent) return fallback ?? t('common:labels.unknown');
    const role = bilingual(termIdForRole(agent.role), locale);
    return agent.displayName ? `${agent.displayName} (${role.term})` : role.inline;
  };
}

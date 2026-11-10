import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { formatNumber } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { selectSkillSummary, type SkillSummary } from './selectors';

const COLLAPSED_COUNT = 10;

/**
 * Bảng kỹ năng toàn đội: id kỹ thuật dạng chip + nhãn tiếng Việt (connectors:skills.<id>, dự phòng là id),
 * nhân sự sở hữu và mức thành thạo trung bình. Một màu duy nhất cho thanh tiến độ (không tô theo thứ hạng).
 */
export function SkillsPanel({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const skills = useDerived(selectSkillSummary);
  const [expanded, setExpanded] = useState(false);
  const skillTerm = bilingual('tech.skill', locale);
  const visible = expanded ? skills : skills.slice(0, COLLAPSED_COUNT);
  const canToggle = skills.length > COLLAPSED_COUNT;

  return (
    <Card accent="violet" className={clsx('flex min-w-0 flex-col', className)} strong>
      <CardHeader
        icon={<Sparkles className="size-4" aria-hidden="true" />}
        title={t('connectors:skillsPanel.title')}
        subtitle={`${t('connectors:skillsPanel.secondary')} · ${t('connectors:skillsPanel.count', { count: skills.length })}`}
      />
      <p className="mb-3 text-xs leading-relaxed text-text-muted">{t('connectors:skillsPanel.description')}</p>

      {skills.length === 0 ? (
        <EmptyState title={t('connectors:skillsPanel.empty')} description={t('connectors:skillsPanel.emptyDescription')} icon={<Sparkles className="size-7" aria-hidden="true" />} />
      ) : (
        <>
          <div className="mb-1 flex items-center justify-between gap-3 px-1 text-[10px] font-semibold text-text-dim" aria-hidden="true">
            <span title={skillTerm.inline}>{skillTerm.primary}</span>
            <span title={`${t('connectors:skillsPanel.ownersSecondary')} – ${t('connectors:skillsPanel.owners')}`}>{t('connectors:skillsPanel.owners')}</span>
          </div>
          <ul className="flex flex-col divide-y divide-line/60">
            {visible.map((skill) => (
              <SkillRow key={skill.id} skill={skill} />
            ))}
          </ul>
          {canToggle ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 inline-flex items-center justify-center gap-1.5 self-center rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-cyan transition hover:bg-white/5 focus-visible:focus-ring"
              aria-expanded={expanded}
            >
              {expanded ? <ChevronUp className="size-3.5" aria-hidden="true" /> : <ChevronDown className="size-3.5" aria-hidden="true" />}
              {expanded ? t('connectors:skillsPanel.showLess') : t('connectors:skillsPanel.showAll', { count: formatNumber(skills.length, locale) })}
            </button>
          ) : null}
        </>
      )}
    </Card>
  );
}

function SkillRow({ skill }: { skill: SkillSummary }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const displayName = useAgentDisplayName();
  // Nhãn tiếng Việt từ từ điển; thiếu thì hiển thị id (định danh kỹ thuật, không dịch).
  const label = t(`connectors:skills.${skill.id}`, { defaultValue: skill.id });
  const level = t('connectors:skillsPanel.levelValue', { value: formatNumber(skill.avgLevel, locale) });

  return (
    <li className="flex flex-col gap-1.5 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 min-w-0 text-sm font-semibold leading-snug text-text" title={`${skill.id} – ${label}`}>
          {label}
        </p>
        <ul className="flex shrink-0 items-center -space-x-1.5" aria-label={t('connectors:skillsPanel.owners')}>
        {skill.owners.map((agent) => (
          <li key={agent.id}>
            <button
              type="button"
              onClick={() => selectAgent(agent.id)}
              title={displayName(agent)}
              aria-label={displayName(agent)}
              className="block rounded-full transition hover:z-10 hover:scale-110 focus-visible:focus-ring"
            >
              <AgentAvatar agent={agent} size={22} showStatus={false} />
            </button>
          </li>
        ))}
        </ul>
      </div>
      <div className="flex items-center gap-2">
        <code className="shrink-0 rounded-md border border-line bg-white/[0.03] px-1.5 py-px text-[10px] leading-4 text-text-dim">{skill.id}</code>
        <ProgressBar
          value={skill.avgLevel}
          size="sm"
          color="var(--color-brand-cyan)"
          label={`${t('connectors:skillsPanel.avgLevel')} – ${label}: ${level}`}
          className="flex-1"
        />
        <span className="w-9 shrink-0 text-right text-xs font-bold tabular-nums text-text">{level}</span>
      </div>
    </li>
  );
}

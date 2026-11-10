import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual } from '@ads-nolimit/i18n';
import { SettingsCard } from './SettingsCard';

/** Tóm tắt chuẩn ngôn ngữ giao diện + liên kết tới Bảng thuật ngữ trong Kho tri thức. */
export function LanguageStandardCard() {
  const { t } = useTranslation();
  const locale = useLocale();
  const rules = t('settings:standard.rules', { returnObjects: true }) as string[];
  const knowledge = bilingual('module.knowledge_base', locale);
  const example = bilingual('role.ai_ceo', 'vi-VN');

  return (
    <SettingsCard
      icon={<BookOpenCheck className="size-4" aria-hidden="true" />}
      title={t('settings:standard.title')}
      secondary={t('settings:standard.secondary')}
      description={t('settings:standard.description')}
    >
      <ul className="flex flex-col gap-2.5">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-text">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-cyan" aria-hidden="true" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-dashed border-line-strong bg-white/[0.02] p-3">
        <span className="term-stack" title={example.inline}>
          <span className="term-primary text-base">{example.term}</span>
          <span className="term-secondary">{example.meaning}</span>
        </span>
      </div>

      <Link
        to="/knowledge#glossary"
        className="inline-flex items-center gap-2 self-start rounded-xl border border-brand-violet/50 bg-brand-violet/15 px-4 py-2 text-sm font-semibold text-text transition hover:bg-brand-violet/25 focus-visible:focus-ring"
        title={`${t('settings:standard.linkSecondary')} – ${knowledge.inline}`}
      >
        <span>{t('settings:standard.link')}</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </SettingsCard>
  );
}

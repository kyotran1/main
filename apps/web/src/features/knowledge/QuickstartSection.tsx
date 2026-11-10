import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Crown, PauseCircle, ShieldCheck } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual } from '@ads-nolimit/i18n';
import { SectionShell } from './SectionShell';

type GuideId = 'assign' | 'approve' | 'pause' | 'office';

/** Bốn hướng dẫn nhanh – mỗi hướng dẫn trỏ tới phân hệ liên quan (đường dẫn là định danh kỹ thuật). */
const GUIDES: readonly { id: GuideId; icon: typeof Crown; path: string; termId: string; accent: string }[] = [
  { id: 'assign', icon: Crown, path: '/ceo', termId: 'module.ceo_command_center', accent: 'var(--color-brand-gold)' },
  { id: 'approve', icon: ShieldCheck, path: '/approvals', termId: 'module.approval_center', accent: 'var(--color-brand-red)' },
  { id: 'pause', icon: PauseCircle, path: '/agents', termId: 'module.ai_agents', accent: 'var(--color-brand-cyan)' },
  { id: 'office', icon: Boxes, path: '/office', termId: 'module.virtual_office_3d', accent: 'var(--color-brand-violet)' },
] as const;

export function QuickstartSection() {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <SectionShell id="quickstart" lead={t('knowledge:quickstart.lead')}>
      <div className="grid gap-3 md:grid-cols-2">
        {GUIDES.map(({ id, icon: Icon, path, termId, accent }) => {
          const steps = t(`knowledge:quickstart.guides.${id}.steps`, { returnObjects: true }) as string[];
          const module = bilingual(termId, locale);
          const title = t(`knowledge:quickstart.guides.${id}.title`);
          const secondary = t(`knowledge:quickstart.guides.${id}.secondary`);
          return (
            <article key={id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 40%, transparent)` }}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <h3 className="term-stack min-w-0" title={`${secondary} – ${title}`}>
                  <span className="term-primary text-[15px] leading-tight">{title}</span>
                  <span className="term-secondary">{secondary}</span>
                </h3>
              </div>
              <ol className="flex flex-col gap-2">
                {steps.map((step, i) => (
                  <li key={i} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 text-sm leading-relaxed text-text">
                    <span
                      className="mt-0.5 flex size-6 items-center justify-center rounded-full border text-[11px] font-bold tabular-nums"
                      style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}
                      aria-label={t('knowledge:quickstart.stepLabel', { n: i + 1 })}
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <Link
                to={path}
                className="mt-auto inline-flex items-center gap-2 self-start rounded-xl border border-line-strong bg-white/[0.03] px-3.5 py-2 text-sm font-semibold text-text transition hover:bg-white/[0.07] focus-visible:focus-ring"
                title={module.inline}
              >
                {t('knowledge:quickstart.openModule', { module: module.short })}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

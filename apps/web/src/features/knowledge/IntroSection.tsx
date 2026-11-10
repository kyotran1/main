import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Cloud, HardDrive, ShieldCheck } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual } from '@ads-nolimit/i18n';
import { SectionShell } from './SectionShell';

type LayerId = 'local' | 'bridge' | 'cloud';

/** Ba lớp kiến trúc: cục bộ (hổ phách), cầu nối (cyan), đám mây (tím) – chỉ dùng token màu. */
const LAYERS: readonly { id: LayerId; icon: typeof Cloud; color: string }[] = [
  { id: 'local', icon: HardDrive, color: 'var(--color-brand-amber)' },
  { id: 'bridge', icon: ArrowLeftRight, color: 'var(--color-brand-cyan)' },
  { id: 'cloud', icon: Cloud, color: 'var(--color-brand-violet)' },
] as const;

/** Giới thiệu hệ thống + sơ đồ kiến trúc Hybrid Local + Cloud + ba nguyên tắc vận hành. */
export function IntroSection() {
  const { t } = useTranslation();
  const locale = useLocale();
  const paragraphs = t('knowledge:intro.paragraphs', { returnObjects: true }) as string[];
  const principles = t('knowledge:intro.principles.items', { returnObjects: true }) as { title: string; body: string }[];
  const hybrid = bilingual('tech.hybrid_local_cloud', locale);

  return (
    <SectionShell id="intro" lead={t('knowledge:intro.lead')}>
      <div className="flex max-w-[72ch] flex-col gap-3 text-sm leading-relaxed text-text">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Sơ đồ kiến trúc */}
      <figure className="mt-6 rounded-2xl border border-line bg-bg-base/40 p-4 md:p-5">
        <figcaption className="mb-4 flex flex-col gap-1">
          <span className="term-stack" title={hybrid.inline}>
            <span className="term-primary text-base">{t('knowledge:intro.architecture.title')}</span>
            <span className="term-secondary">{t('knowledge:intro.architecture.secondary')}</span>
          </span>
          <p className="max-w-[72ch] text-sm leading-relaxed text-text-muted">{t('knowledge:intro.architecture.body')}</p>
        </figcaption>

        <div className="relative grid gap-3 md:grid-cols-[1fr_minmax(0,0.8fr)_1fr] md:gap-0">
          {LAYERS.map(({ id, icon: Icon, color }, i) => {
            const items = t(`knowledge:intro.architecture.layers.${id}.items`, { returnObjects: true }) as string[];
            const isBridge = id === 'bridge';
            return (
              <div key={id} className="relative flex min-w-0 flex-col md:px-3">
                {/* Đường nối giữa các lớp (chỉ ở màn hình rộng) */}
                {i < LAYERS.length - 1 ? (
                  <span
                    className="absolute top-7 right-[-6px] z-10 hidden size-3 rounded-full md:block"
                    style={{ background: color, boxShadow: `0 0 10px ${color}` }}
                    aria-hidden="true"
                  />
                ) : null}
                <div
                  className="flex h-full flex-col gap-3 rounded-2xl border p-4"
                  style={{
                    borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
                    background: isBridge ? `color-mix(in srgb, ${color} 7%, transparent)` : 'rgba(255,255,255,0.02)',
                    boxShadow: `inset 0 1px 0 color-mix(in srgb, ${color} 25%, transparent)`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="term-stack min-w-0" title={`${t(`knowledge:intro.architecture.layers.${id}.secondary`)} – ${t(`knowledge:intro.architecture.layers.${id}.title`)}`}>
                      <span className="term-primary text-sm">{t(`knowledge:intro.architecture.layers.${id}.title`)}</span>
                      <span className="term-secondary">{t(`knowledge:intro.architecture.layers.${id}.secondary`)}</span>
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5 text-[13px] leading-snug text-text-muted">
                    {items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="mt-[7px] size-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          {/* Đường kẻ ngang nối ba lớp */}
          <span
            className="pointer-events-none absolute top-7 right-6 left-6 -z-0 hidden h-px md:block"
            style={{ background: 'linear-gradient(90deg, var(--color-brand-amber), var(--color-brand-cyan), var(--color-brand-violet))', opacity: 0.5 }}
            aria-hidden="true"
          />
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-text-dim">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-cyan" aria-hidden="true" />
          <span>{t('knowledge:intro.architecture.caption')}</span>
        </p>
      </figure>

      {/* Ba nguyên tắc */}
      <h3 className="mt-6 mb-3 text-sm font-semibold text-text">{t('knowledge:intro.principles.title')}</h3>
      <ol className="grid gap-3 sm:grid-cols-3">
        {principles.map((p, i) => (
          <li key={i} className="flex min-w-0 flex-col gap-1 rounded-xl border border-line bg-white/[0.02] p-3">
            <span className="text-2xl font-extrabold leading-none text-brand-amber/80 tabular-nums" aria-hidden="true">
              {i + 1}
            </span>
            <span className="text-sm font-semibold leading-snug text-text">{p.title}</span>
            <span className="text-xs leading-relaxed text-text-muted">{p.body}</span>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

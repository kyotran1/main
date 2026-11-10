import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { ArrowUp, Clock3 } from 'lucide-react';
import { KNOWLEDGE_SECTIONS, type KnowledgeSectionId } from './sections';

/** Đếm từ của toàn bộ namespace knowledge để ước lượng thời gian đọc (≈ 200 từ/phút). */
function estimateMinutes(content: unknown): number {
  const text = JSON.stringify(content ?? '');
  const words = text.replace(/[{}[\]"]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Mục lục Kho tri thức: dính bên trái ở màn hình rộng, thành dải chip cuộn ngang ở màn hình hẹp.
 * Mục đang đọc được tô sáng; chọn mục sẽ cuộn mượt tới phần tương ứng.
 */
export function KnowledgeToc({ active, className }: { active: KnowledgeSectionId; className?: string }) {
  const { t } = useTranslation();
  const minutes = estimateMinutes(t('knowledge:intro', { returnObjects: true }));
  const railRef = useRef<HTMLOListElement>(null);

  // Màn hình hẹp: cuộn ngang dải chip để chip đang đọc luôn nhìn thấy (không cuộn trang).
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!rail || !chip) return;
    const target = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [active]);

  const jump = (id: KnowledgeSectionId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav aria-label={`${t('knowledge:toc.title')} – ${t('knowledge:toc.secondary')}`} className={clsx('min-w-0', className)}>
      {/* Màn hình rộng: danh sách dọc trong thẻ kính */}
      <div className="glass hidden flex-col gap-1 p-3 xl:flex">
        <div className="mb-2 flex items-baseline justify-between gap-2 px-2">
          <span className="term-stack" title={`${t('knowledge:toc.secondary')} – ${t('knowledge:toc.title')}`}>
            <span className="term-primary text-sm">{t('knowledge:toc.title')}</span>
            <span className="term-secondary">{t('knowledge:toc.secondary')}</span>
          </span>
          <span className="text-[11px] text-text-dim">{t('knowledge:toc.sectionCount', { count: KNOWLEDGE_SECTIONS.length })}</span>
        </div>
        <ol className="flex flex-col gap-0.5">
          {KNOWLEDGE_SECTIONS.map(({ id, icon: Icon }, index) => {
            const isActive = id === active;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={jump(id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={clsx(
                    'group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-sm transition focus-visible:focus-ring',
                    isActive
                      ? 'border-brand-amber/50 bg-brand-amber/10 text-text'
                      : 'border-transparent text-text-muted hover:bg-white/[0.04] hover:text-text',
                  )}
                >
                  <span
                    className={clsx(
                      'flex size-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums',
                      isActive ? 'bg-brand-amber text-text-inverse' : 'bg-white/[0.05] text-text-dim group-hover:text-text-muted',
                    )}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="term-stack min-w-0 flex-1" title={`${t(`knowledge:sections.${id}.secondary`)} – ${t(`knowledge:sections.${id}.title`)}`}>
                    <span className={clsx('term-primary line-clamp-2 text-[13px] leading-snug', !isActive && 'font-medium text-current')}>{t(`knowledge:sections.${id}.title`)}</span>
                    <span className="term-secondary truncate">{t(`knowledge:sections.${id}.secondary`)}</span>
                  </span>
                  <Icon className={clsx('size-3.5 shrink-0', isActive ? 'text-brand-amber' : 'text-text-dim')} aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ol>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-line px-2 pt-3 text-[11px] whitespace-nowrap text-text-dim">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
            {t('knowledge:toc.readingTime', { minutes })}
          </span>
          <a
            href="#main"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-text-muted transition hover:text-text focus-visible:focus-ring"
          >
            <ArrowUp className="size-3" aria-hidden="true" />
            {t('knowledge:toc.backToTop')}
          </a>
        </div>
      </div>

      {/* Màn hình hẹp: dải chip cuộn ngang, dính dưới thanh tiêu đề */}
      <ol ref={railRef} className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 xl:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {KNOWLEDGE_SECTIONS.map(({ id, icon: Icon }, index) => {
          const isActive = id === active;
          return (
            <li key={id} className="shrink-0" data-section={id}>
              <a
                href={`#${id}`}
                onClick={jump(id)}
                aria-current={isActive ? 'location' : undefined}
                title={`${t(`knowledge:sections.${id}.secondary`)} – ${t(`knowledge:sections.${id}.title`)}`}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition focus-visible:focus-ring',
                  isActive ? 'border-brand-amber/60 bg-brand-amber/15 text-text' : 'border-line bg-white/[0.03] text-text-muted',
                )}
              >
                <span className="tabular-nums text-text-dim" aria-hidden="true">
                  {index + 1}
                </span>
                <Icon className={clsx('size-3.5', isActive ? 'text-brand-amber' : 'text-text-dim')} aria-hidden="true" />
                {t(`knowledge:sections.${id}.title`)}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

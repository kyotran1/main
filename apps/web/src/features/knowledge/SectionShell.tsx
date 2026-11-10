import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { KNOWLEDGE_SECTIONS, type KnowledgeSectionId } from './sections';

/**
 * Khung chuẩn cho một mục trong Kho tri thức: số thứ tự, tiêu đề song ngữ (tiếng Việt đậm,
 * tiếng Anh nhỏ), đoạn dẫn và nội dung. `scroll-mt` bù chiều cao thanh tiêu đề dính.
 */
export function SectionShell({
  id,
  lead,
  children,
  className,
  accent = 'none',
}: {
  id: KnowledgeSectionId;
  lead?: string;
  children: ReactNode;
  className?: string;
  accent?: 'none' | 'cyan' | 'violet' | 'green' | 'amber' | 'red';
}) {
  const { t } = useTranslation();
  const index = KNOWLEDGE_SECTIONS.findIndex((s) => s.id === id) + 1;
  const Icon = KNOWLEDGE_SECTIONS[index - 1]?.icon;
  const title = t(`knowledge:sections.${id}.title`);
  const secondary = t(`knowledge:sections.${id}.secondary`);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      // scroll-mt bù thanh tiêu đề + dải mục lục dính (màn hình hẹp); ở xl mục lục nằm cột riêng nên chỉ cần bù thanh tiêu đề.
      className={clsx('glass min-w-0 scroll-mt-[132px] p-4 md:p-6 xl:scroll-mt-24', accent !== 'none' && `neon-border-${accent}`, className)}
    >
      <header className="mb-4 flex items-start gap-3 md:mb-5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-amber/12 text-brand-amber ring-1 ring-brand-amber/40"
          aria-hidden="true"
        >
          {Icon ? <Icon className="size-5" /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-heading`} className="term-stack" title={`${secondary} – ${title}`}>
            <span className="term-primary text-lg leading-tight tracking-tight md:text-xl">
              <span className="mr-2 text-text-dim tabular-nums">{index}.</span>
              {title}
            </span>
            <span className="term-secondary">{secondary}</span>
          </h2>
          {lead ? <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-text-muted">{lead}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

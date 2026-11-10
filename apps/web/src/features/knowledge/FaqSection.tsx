import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { SectionShell } from './SectionShell';

/** Câu hỏi thường gặp dạng accordion – dùng <details> gốc để bàn phím và trình đọc màn hình hoạt động sẵn. */
export function FaqSection() {
  const { t } = useTranslation();
  const items = t('knowledge:faq.items', { returnObjects: true }) as { q: string; a: string }[];

  return (
    <SectionShell id="faq" lead={t('knowledge:faq.lead')}>
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {items.map((item, i) => (
          <details key={i} className="group bg-white/[0.015] open:bg-white/[0.04]" open={i === 0}>
            <summary
              className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold text-text transition hover:bg-white/[0.03] focus-visible:focus-ring [&::-webkit-details-marker]:hidden"
              title={t('knowledge:faq.expandHint')}
            >
              <span className="min-w-0 flex-1 leading-snug">{item.q}</span>
              <ChevronDown className="size-4 shrink-0 text-text-dim transition-transform group-open:rotate-180 group-open:text-brand-amber" aria-hidden="true" />
            </summary>
            <p className="max-w-[72ch] px-4 pb-4 text-sm leading-relaxed text-text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

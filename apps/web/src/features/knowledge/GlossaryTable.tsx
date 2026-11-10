import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { BookA, Search, X } from 'lucide-react';
import { listGlossary, type GlossaryCategory, type GlossaryEntry } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { formatNumber } from '@/lib/format';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionShell } from './SectionShell';

/** Thứ tự nhóm hiển thị trong bộ lọc – theo mức độ người dùng gặp thường xuyên. */
const CATEGORIES: readonly GlossaryCategory[] = [
  'module',
  'role',
  'department',
  'task_status',
  'agent_status',
  'priority',
  'stage',
  'approval_type',
  'approval_status',
  'project_status',
  'metric',
  'execution_mode',
  'connector_category',
  'action',
  'tech',
];

/** Bỏ dấu + chữ thường để tìm tiếng Việt không cần gõ dấu. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function matches(entry: GlossaryEntry, q: string): boolean {
  if (!q) return true;
  return [entry.en, entry.vi, entry.viShort ?? '', entry.noteVi ?? '', entry.id].some((f) => normalize(f).includes(q));
}

/**
 * Bảng thuật ngữ tra cứu: tìm theo tiếng Anh/tiếng Việt (không cần dấu), lọc theo nhóm.
 * Dựng từ GLOSSARY – nguồn duy nhất của mọi nhãn song ngữ trên giao diện.
 * Màn hình hẹp: mỗi dòng thành một thẻ để không tràn ngang.
 */
export function GlossaryTable() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GlossaryCategory | 'all'>('all');
  const deferredQuery = useDeferredValue(query);

  const all = useMemo(() => listGlossary(), []);
  const countByCategory = useMemo(() => {
    const out = {} as Record<GlossaryCategory, number>;
    for (const e of all) out[e.category] = (out[e.category] ?? 0) + 1;
    return out;
  }, [all]);

  const rows = useMemo(() => {
    const q = normalize(deferredQuery);
    return all
      .filter((e) => (category === 'all' || e.category === category) && matches(e, q))
      .sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.en.localeCompare(b.en));
  }, [all, category, deferredQuery]);

  const col = (k: 'term' | 'meaning' | 'short' | 'note') => t(`knowledge:glossary.columns.${k}`);

  return (
    <SectionShell id="glossary" lead={t('knowledge:glossary.lead')} accent="amber">
      {/* Thanh tìm kiếm */}
      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">{t('knowledge:glossary.searchLabel')}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-dim" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('knowledge:glossary.searchPlaceholder')}
            className="h-12 w-full rounded-2xl border border-line bg-bg-base/60 pr-11 pl-10 text-[15px] text-text placeholder:text-text-dim transition focus:border-brand-amber/60 focus-visible:focus-ring"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-dim transition hover:bg-white/5 hover:text-text focus-visible:focus-ring"
              aria-label={t('knowledge:glossary.clear')}
              title={t('knowledge:glossary.clear')}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </label>

        {/* Bộ lọc nhóm */}
        <div className="flex flex-col gap-2">
          <span className="term-stack" title={`${t('knowledge:glossary.filterSecondary')} – ${t('knowledge:glossary.filterLabel')}`}>
            <span className="term-primary text-xs text-text-muted">{t('knowledge:glossary.filterLabel')}</span>
          </span>
          <div role="radiogroup" aria-label={t('knowledge:glossary.filterLabel')} className="flex flex-wrap gap-1.5">
            <FilterChip active={category === 'all'} onClick={() => setCategory('all')} count={all.length} locale={locale}>
              {t('knowledge:glossary.all')}
            </FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)} count={countByCategory[c] ?? 0} locale={locale}>
                {t(`knowledge:glossary.categories.${c}`)}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {/* Kết quả */}
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-text-muted" role="status" aria-live="polite">
        <span className="inline-flex items-center gap-1.5">
          <BookA className="size-3.5 text-brand-amber" aria-hidden="true" />
          {t('knowledge:glossary.result', { count: rows.length })}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title={t('knowledge:glossary.empty')}
            description={t('knowledge:glossary.emptyDescription')}
            icon={<Search className="size-7" aria-hidden="true" />}
          />
        </div>
      ) : (
        <>
          {/* Bảng – màn hình ≥ md */}
          <div className="mt-3 hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full table-fixed border-collapse text-sm">
              <caption className="sr-only">{`${t('knowledge:sections.glossary.secondary')} – ${t('knowledge:sections.glossary.title')}`}</caption>
              <thead className="bg-bg-base/60 text-left text-[11px] font-semibold text-text-muted">
                <tr>
                  <th scope="col" className="w-[26%] px-4 py-2.5">{col('term')}</th>
                  <th scope="col" className="w-[30%] px-4 py-2.5">{col('meaning')}</th>
                  <th scope="col" className="w-[18%] px-4 py-2.5">{col('short')}</th>
                  <th scope="col" className="px-4 py-2.5">{col('note')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {rows.map((e) => (
                  <tr key={e.id} className="align-top transition hover:bg-white/[0.03]">
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="block font-bold text-text [overflow-wrap:anywhere]">{e.en}</span>
                      <span className="mt-1 block truncate text-[10px] text-text-dim" title={`${t('knowledge:glossary.idLabel')}: ${e.id}`}>
                        {t(`knowledge:glossary.categories.${e.category}`)}
                      </span>
                    </th>
                    <td className="px-4 py-3 font-semibold text-brand-amber [overflow-wrap:anywhere]">{e.vi}</td>
                    <td className="px-4 py-3 text-text-muted [overflow-wrap:anywhere]">{e.viShort ?? '—'}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-text-muted [overflow-wrap:anywhere]">{e.noteVi ?? <span className="text-text-dim">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thẻ – màn hình hẹp */}
          <ul className="mt-3 flex flex-col gap-2 md:hidden">
            {rows.map((e) => (
              <li key={e.id} className="rounded-xl border border-line bg-white/[0.02] p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="term-stack min-w-0">
                    <span className="term-primary text-[15px] leading-tight">{e.en}</span>
                    <span className="mt-0.5 text-sm font-semibold text-brand-amber [overflow-wrap:anywhere]">{e.vi}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] text-text-dim">{t(`knowledge:glossary.categories.${e.category}`)}</span>
                </div>
                {e.viShort || e.noteVi ? (
                  <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                    {e.viShort ? (
                      <>
                        <dt className="text-text-dim">{col('short')}</dt>
                        <dd className="text-text-muted">{e.viShort}</dd>
                      </>
                    ) : null}
                    {e.noteVi ? (
                      <>
                        <dt className="text-text-dim">{col('note')}</dt>
                        <dd className="leading-relaxed text-text-muted">{e.noteVi}</dd>
                      </>
                    ) : null}
                  </dl>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionShell>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  locale,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  locale: 'vi-VN' | 'en-US';
  children: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:focus-ring',
        active ? 'border-brand-amber/60 bg-brand-amber/15 text-text' : 'border-line bg-white/[0.02] text-text-muted hover:bg-white/[0.06] hover:text-text',
      )}
    >
      <span>{children}</span>
      <span className={clsx('tabular-nums', active ? 'text-brand-amber' : 'text-text-dim')}>{formatNumber(count, locale)}</span>
    </button>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Braces, ChevronDown, Download, FileSpreadsheet } from 'lucide-react';
import { useTerm } from '@ads-nolimit/i18n/react';
import { Button } from '@/components/ui/Button';
import { useOfficeStore } from '@/store/officeStore';
import { buildExportSnapshot, buildTasksCsv } from './selectors';

/** Tải một chuỗi về máy dưới dạng tệp (Blob phía trình duyệt, không gọi máy chủ). */
function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

/** Nút "Xuất dữ liệu" với menu chọn JSON (toàn bộ snapshot) hoặc CSV (bảng công việc). */
export function ExportMenu() {
  const { t } = useTranslation();
  const exportTerm = useTerm('action.export');
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng menu khi bấm ra ngoài hoặc nhấn Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDone(null), 3500);
    return () => clearTimeout(id);
  }, [done]);

  const run = (kind: 'json' | 'csv') => {
    const state = useOfficeStore.getState();
    const file = kind === 'json' ? `ads-nolimit-report-${stamp()}.json` : `ads-nolimit-tasks-${stamp()}.csv`;
    if (kind === 'json') downloadText(file, JSON.stringify(buildExportSnapshot(state), null, 2), 'application/json;charset=utf-8');
    else downloadText(file, buildTasksCsv(state), 'text/csv;charset=utf-8');
    setOpen(false);
    setDone(file);
  };

  return (
    <div ref={ref} className="relative">
      <Button variant="primary" size="md" icon={<Download className="size-4" />} iconRight={<ChevronDown className="size-4 opacity-80" />} aria-haspopup="menu" aria-expanded={open} title={exportTerm.inline} onClick={() => setOpen((v) => !v)}>
        {t('reports:export.button')}
      </Button>
      {open ? (
        <div role="menu" aria-label={t('reports:export.menuLabel')} className="glass-strong absolute right-0 z-20 mt-2 w-64 overflow-hidden p-1.5 shadow-panel">
          <button type="button" role="menuitem" onClick={() => run('json')} className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/[0.06] focus-visible:focus-ring">
            <Braces className="mt-0.5 size-4 shrink-0 text-brand-cyan" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-text">{t('reports:export.json')}</span>
              <span className="block text-[11px] text-text-muted">{t('reports:export.jsonHint')}</span>
            </span>
          </button>
          <button type="button" role="menuitem" onClick={() => run('csv')} className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/[0.06] focus-visible:focus-ring">
            <FileSpreadsheet className="mt-0.5 size-4 shrink-0 text-brand-green" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-text">{t('reports:export.csv')}</span>
              <span className="block text-[11px] text-text-muted">{t('reports:export.csvHint')}</span>
            </span>
          </button>
        </div>
      ) : null}
      <p role="status" aria-live="polite" className="sr-only">
        {done ? t('reports:export.done', { file: done }) : ''}
      </p>
      {done ? (
        <span className="absolute top-full right-0 mt-2 max-w-[260px] truncate rounded-lg border border-brand-green/40 bg-brand-green/10 px-2.5 py-1 text-[11px] font-semibold text-brand-green">
          {t('reports:export.done', { file: done })}
        </span>
      ) : null}
    </div>
  );
}

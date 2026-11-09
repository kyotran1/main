import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { describeError } from '@ads-nolimit/i18n';
import { ApiError } from '@/lib/api';
import { Button } from './Button';

/**
 * Thông báo lỗi chuẩn: tiêu đề tiếng Việt + giải thích (kèm thuật ngữ gốc) + chi tiết kỹ thuật.
 * Mọi mã lỗi API được diễn giải qua errors:codes.<code>.
 */
export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const code = error instanceof ApiError ? error.code : 'internal';
  const { title, explain } = describeError(t, code);
  const technical = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert" className="glass neon-border-red flex flex-col gap-2 p-4 md:flex-row md:items-start md:gap-4">
      <AlertTriangle className="size-5 shrink-0 text-brand-red" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text">{title}</p>
        <p className="text-sm text-text-muted">{explain}</p>
        <details className="mt-1 text-xs text-text-dim">
          <summary className="cursor-pointer">{t('errors:technicalDetails')}</summary>
          <code className="break-all">{code} · {technical}</code>
        </details>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={onRetry}>
          {t('errors:generic.retry')}
        </Button>
      ) : null}
    </div>
  );
}

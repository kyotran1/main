import { Loader2 } from 'lucide-react';

/** Trạng thái đang nạp dữ liệu của một trang: thông điệp tiếng Việt + khung xương. */
export function PageLoading({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" role="status">
      <div className="glass flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
        <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
        <span>{message}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-[84px]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="skeleton h-[380px] xl:col-span-2" />
        <div className="skeleton h-[380px]" />
      </div>
    </div>
  );
}

import { useEffect, useRef, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  /** Nhãn a11y cho hộp thoại (đã dịch). */
  label: string;
  /** Nhãn nút đóng (đã dịch). */
  closeLabel: string;
  /** Vùng tiêu đề cố định phía trên. */
  header: ReactNode;
  /** Màu viền phát sáng bên trái theo ngữ cảnh (CSS var). */
  accent?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Vỏ ngăn trượt từ phải dùng chung cho ngăn chi tiết nhân sự AI và công việc.
 * Đóng bằng nút, phím Esc hoặc bấm nền mờ; khóa cuộn trang khi mở; focus vào ngăn khi mở.
 */
/**
 * Ngăn xếp các ngăn đang mở (ngăn nhân sự có thể mở ngăn công việc chồng lên).
 * Khóa cuộn trang theo kiểu đếm tham chiếu: chỉ khóa khi ngăn đầu tiên mở và chỉ mở khóa khi ngăn cuối cùng đóng;
 * phím Esc chỉ đóng ngăn trên cùng.
 */
const openDrawers: symbol[] = [];
let savedBodyOverflow: string | null = null;

function pushDrawer(id: symbol) {
  if (openDrawers.length === 0) {
    savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  openDrawers.push(id);
}

function popDrawer(id: symbol) {
  const idx = openDrawers.indexOf(id);
  if (idx !== -1) openDrawers.splice(idx, 1);
  if (openDrawers.length === 0 && savedBodyOverflow !== null) {
    document.body.style.overflow = savedBodyOverflow;
    savedBodyOverflow = null;
  }
}

const isTopDrawer = (id: symbol) => openDrawers[openDrawers.length - 1] === id;

export function DrawerShell({ open, onClose, label, closeLabel, header, accent = 'var(--color-brand-cyan)', children, className }: DrawerShellProps) {
  const panelRef = useRef<HTMLElement>(null);
  const idRef = useRef<symbol>(Symbol('drawer'));

  useEffect(() => {
    if (!open) return;
    const id = idRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTopDrawer(id)) onClose();
    };
    window.addEventListener('keydown', onKey);
    pushDrawer(id);
    // Đưa tiêu điểm vào ngăn để bàn phím/đọc màn hình bắt đầu từ đây.
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      popDrawer(id);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-bg-base/70 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={clsx(
          'glass-strong relative flex h-full w-full max-w-[520px] flex-col rounded-none border-y-0 border-r-0 outline-none',
          'animate-[drawer-in_260ms_cubic-bezier(0.2,0.8,0.2,1)]',
          className,
        )}
        style={{ boxShadow: `inset 3px 0 0 ${accent}, -24px 0 60px rgba(2, 6, 23, 0.6)` }}
      >
        <style>{`@keyframes drawer-in{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}`}</style>
        <div className="flex items-start gap-3 border-b border-line px-4 py-4 md:px-5">
          <div className="min-w-0 flex-1">{header}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-text-muted transition hover:bg-white/[0.08] hover:text-text focus-visible:focus-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-5">{children}</div>
      </aside>
    </div>
  );
}

/** Tiêu đề mục trong ngăn: nhãn tiếng Việt đậm + thuật ngữ tiếng Anh nhỏ, có tooltip song ngữ. */
export function DrawerSection({ label, secondary, action, children, className }: { label: string; secondary: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx('mt-5 first:mt-0', className)} aria-label={`${label} – ${secondary}`}>
      <div className="mb-2 flex items-end justify-between gap-2">
        <h3 className="term-stack" title={`${secondary} – ${label}`}>
          <span className="term-primary text-[13px]">{label}</span>
          <span className="term-secondary">{secondary}</span>
        </h3>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** Ô số liệu nhỏ trong ngăn (giá trị to + nhãn song ngữ). */
export function DrawerStat({ value, label, secondary, color = 'var(--color-brand-cyan)' }: { value: ReactNode; label: string; secondary: string; color?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.03] px-3 py-2.5" title={`${secondary} – ${label}`}>
      <span className="block text-xl font-extrabold leading-none tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="mt-1 block text-xs font-semibold leading-tight text-text">{label}</span>
      <span className="block text-[11px] leading-tight text-text-muted">{secondary}</span>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-8 text-center">
      <span className="text-text-dim">{icon ?? <Inbox className="size-7" />}</span>
      <p className="text-sm font-semibold text-text">{title}</p>
      {description ? <p className="max-w-sm text-xs text-text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

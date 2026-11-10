import { useEffect, useState } from 'react';
import type { KnowledgeSectionId } from './sections';

/**
 * Theo dõi mục đang hiển thị trong khung nhìn để tô sáng mục lục.
 * Dùng IntersectionObserver với vùng quan sát lệch lên trên (bù thanh tiêu đề dính).
 */
export function useActiveSection(ids: readonly KnowledgeSectionId[]): KnowledgeSectionId {
  const [active, setActive] = useState<KnowledgeSectionId>(ids[0] ?? 'intro');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const visible = new Map<KnowledgeSectionId, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as KnowledgeSectionId;
          if (entry.isIntersecting) visible.set(id, entry.boundingClientRect.top);
          else visible.delete(id);
        }
        if (visible.size === 0) return;
        // Mục gần đỉnh khung nhìn nhất là mục đang đọc.
        let best: KnowledgeSectionId | null = null;
        let bestTop = Number.POSITIVE_INFINITY;
        for (const [id, top] of visible) {
          if (Math.abs(top) < bestTop) {
            bestTop = Math.abs(top);
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: '-96px 0px -55% 0px', threshold: [0, 0.1, 0.5] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

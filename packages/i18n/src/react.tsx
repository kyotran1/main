import { createElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Locale } from '@ads-nolimit/shared';
import { bilingual, bilingualSafe, normalizeLocale, type BilingualLabel } from './index.js';

/** Hook lấy locale hiện tại đã chuẩn hóa về vi-VN | en-US. */
export function useLocale(): Locale {
  const { i18n } = useTranslation();
  return normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
}

/** Hook lấy nhãn song ngữ cho một id thuật ngữ. */
export function useTerm(id: string): BilingualLabel {
  const locale = useLocale();
  return bilingual(id, locale);
}

/** Hook trả về hàm tra cứu nhiều thuật ngữ (tiện cho bảng/danh sách). */
export function useTerms(): (id: string) => BilingualLabel {
  const locale = useLocale();
  return (id: string) => bilingualSafe(id, locale);
}

export type TermFormat = 'inline' | 'stacked' | 'primary' | 'short' | 'secondary';

export interface TermProps {
  /** Id thuật ngữ, vd: "module.dashboard". */
  id: string;
  /**
   * inline   → "Dashboard – Bảng điều khiển" (một dòng)
   * stacked  → nhãn chính + dòng phụ (mặc định cho menu/thẻ)
   * primary  → chỉ nhãn chính (tooltip luôn mang đủ song ngữ)
   * short    → dạng rút gọn (chip, nhãn 3D) – tooltip song ngữ
   * secondary→ chỉ nhãn phụ
   */
  format?: TermFormat;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  /** Phần tử bao ngoài (mặc định span; dùng 'div' cho stacked). */
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'label';
  /** Nội dung chèn thêm sau nhãn chính (icon, badge). */
  suffix?: ReactNode;
}

/**
 * Component hiển thị thuật ngữ song ngữ theo chuẩn ngôn ngữ dự án.
 * Mọi dạng rút gọn đều có `title` (tooltip) chứa "EN – VI" để nghĩa luôn truy cập được.
 */
export function Term({
  id,
  format = 'stacked',
  className,
  primaryClassName,
  secondaryClassName,
  as = 'span',
  suffix,
}: TermProps) {
  const label = useTerm(id);
  const tooltip = `${label.term} – ${label.meaning}`;

  if (format === 'inline') {
    return createElement(as, { className, title: tooltip, lang: undefined }, label.inline, suffix);
  }
  if (format === 'primary') {
    return createElement(as, { className, title: tooltip }, label.primary, suffix);
  }
  if (format === 'short') {
    return createElement(as, { className, title: tooltip }, label.short, suffix);
  }
  if (format === 'secondary') {
    return createElement(as, { className, title: tooltip }, label.secondary);
  }
  // stacked
  return createElement(
    as === 'span' ? 'span' : as,
    { className, title: tooltip, 'data-term': id },
    createElement('span', { className: primaryClassName, 'data-term-primary': true }, label.primary, suffix),
    createElement('span', { className: secondaryClassName, 'data-term-secondary': true }, label.secondary),
  );
}

export interface BilingualTextProps {
  primary: string;
  secondary?: string;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
}

/** Cặp nhãn song ngữ tự do (dùng cho khóa i18n có sẵn label/secondary). */
export function BilingualText({
  primary,
  secondary,
  className,
  primaryClassName,
  secondaryClassName,
  as = 'span',
}: BilingualTextProps) {
  return createElement(
    as,
    { className, title: secondary ? `${primary} – ${secondary}` : primary },
    createElement('span', { className: primaryClassName, 'data-term-primary': true }, primary),
    secondary
      ? createElement('span', { className: secondaryClassName, 'data-term-secondary': true }, secondary)
      : null,
  );
}

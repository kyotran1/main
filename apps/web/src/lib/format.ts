import type { TFunction } from 'i18next';
import type { Locale } from '@ads-nolimit/shared';

/** Định dạng số theo vi-VN (dấu chấm phân cách hàng nghìn). */
export function formatNumber(value: number, locale: Locale = 'vi-VN', options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCompact(value: number, locale: Locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, locale: Locale = 'vi-VN', digits = 0): string {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)}%`;
}

export function formatSignedPercent(value: number, locale: Locale = 'vi-VN'): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatPercent(value, locale)}`;
}

export function formatVnd(value: number, locale: Locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(iso: string, locale: Locale = 'vi-VN'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export function formatDateShort(iso: string, locale: Locale = 'vi-VN'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(new Date(iso));
}

export function formatTime(iso: string, locale: Locale = 'vi-VN'): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function formatLongDate(iso: string, locale: Locale = 'vi-VN'): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(iso),
  );
}

/** "Vừa xong", "2 phút trước", "3 giờ trước" – dùng khóa common:time.* */
export function formatRelative(iso: string, t: TFunction, now: number = Date.now()): string {
  const diffMs = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t('common:time.justNow');
  if (minutes < 60) return t('common:time.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('common:time.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('common:time.daysAgo', { count: days });
}

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function initialsFromRole(role: string): string {
  const parts = role.replace(/^ai_/, '').split('_');
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2);
}

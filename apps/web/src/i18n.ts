import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  initI18n,
  normalizeLocale,
} from '@ads-nolimit/i18n';
import type { Locale } from '@ads-nolimit/shared';

/**
 * Khởi tạo i18n cho Web. Tiếng Việt (vi-VN) là mặc định; chỉ đổi khi người dùng
 * chủ động chọn trong Cài đặt (lưu localStorage). Không tự suy ra từ trình duyệt.
 */
export const i18n = i18next.createInstance();

export async function setupI18n(): Promise<typeof i18n> {
  i18n.use(LanguageDetector).use(initReactI18next);
  // Đọc lựa chọn đã lưu trước khi khởi tạo: i18next ưu tiên `lng` tường minh hơn bộ dò, nên phải truyền đúng giá trị đã lưu.
  await initI18n({
    instance: i18n,
    lng: readSavedLocale(),
    overrides: {
      detection: {
        order: ['localStorage'],
        lookupLocalStorage: LOCALE_STORAGE_KEY,
        caches: ['localStorage'],
      },
      supportedLngs: [...SUPPORTED_LOCALES],
      fallbackLng: DEFAULT_LOCALE,
      nonExplicitSupportedLngs: false,
    },
  });
  const current = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  if (current !== i18n.language) await i18n.changeLanguage(current);
  applyDocumentLocale(current);
  i18n.on('languageChanged', (lng) => applyDocumentLocale(normalizeLocale(lng)));
  return i18n;
}

export async function changeLocale(locale: Locale): Promise<void> {
  await i18n.changeLanguage(locale);
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* localStorage có thể bị chặn – bỏ qua */
  }
}

function readSavedLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return saved ? normalizeLocale(saved) : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale === 'vi-VN' ? 'vi' : 'en';
}

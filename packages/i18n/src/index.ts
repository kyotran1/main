import i18next, { type i18n as I18nInstance, type InitOptions, type TFunction } from 'i18next';
import type {
  AgentRole,
  AgentStatus,
  ApprovalStatus,
  ApprovalType,
  DepartmentId,
  ExecutionMode,
  Locale,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  WorkflowStage,
} from '@ads-nolimit/shared';
import { getGlossaryEntry, type GlossaryEntry } from './glossary.js';
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  NAMESPACES,
  SUPPORTED_LOCALES,
  resources,
  type Namespace,
} from './resources.js';

export { GLOSSARY, getGlossaryEntry, listGlossary, englishTermSet, buildGlossaryResources } from './glossary.js';
export type { GlossaryEntry, GlossaryCategory, GlossaryId } from './glossary.js';
export { DEFAULT_LOCALE, FALLBACK_LOCALE, NAMESPACES, SUPPORTED_LOCALES, resources } from './resources.js';
export type { Namespace } from './resources.js';

export const LOCALE_STORAGE_KEY = 'ads-nolimit.locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: unknown): Locale {
  if (isLocale(value)) return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower.startsWith('vi')) return 'vi-VN';
    if (lower.startsWith('en')) return 'en-US';
  }
  return DEFAULT_LOCALE;
}

export interface InitI18nOptions {
  /** Ngôn ngữ khởi tạo – mặc định vi-VN. */
  lng?: Locale;
  /** Dùng instance có sẵn (vd: đã gắn initReactI18next). */
  instance?: I18nInstance;
  /** Tùy chọn i18next bổ sung (ghi đè an toàn). */
  overrides?: Partial<InitOptions>;
}

/**
 * Khởi tạo i18next với toàn bộ từ điển dùng chung. Dùng cho Web (kèm react-i18next)
 * và Desktop (tiến trình chính Electron – menu, hộp thoại).
 */
export async function initI18n(options: InitI18nOptions = {}): Promise<I18nInstance> {
  const instance = options.instance ?? i18next.createInstance();
  if (instance.isInitialized) return instance;
  await instance.init({
    lng: options.lng ?? DEFAULT_LOCALE,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    ns: [...NAMESPACES],
    defaultNS: 'common',
    resources,
    load: 'currentOnly',
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
    saveMissing: false,
    ...options.overrides,
  });
  return instance;
}

export interface BilingualLabel {
  /** Nhãn chính (vi-VN: nghĩa tiếng Việt; en-US: thuật ngữ tiếng Anh). */
  primary: string;
  /** Nhãn phụ (vi-VN: thuật ngữ tiếng Anh; en-US: nghĩa tiếng Việt). */
  secondary: string;
  /** Dạng một dòng: vi-VN → "EN – VI", en-US → "EN". */
  inline: string;
  /** Dạng rút gọn cho không gian hẹp. */
  short: string;
  /** Giải thích thêm (tooltip). */
  note: string;
  /** Thuật ngữ gốc tiếng Anh – không bao giờ dịch. */
  term: string;
  /** Nghĩa tiếng Việt chuẩn. */
  meaning: string;
}

/** Dấu gạch nối chuẩn giữa thuật ngữ và nghĩa (en dash có khoảng trắng). */
export const TERM_SEPARATOR = ' – ';

/** Tạo nhãn song ngữ trực tiếp từ bảng thuật ngữ (không cần i18next – dùng được ở backend/desktop). */
export function bilingualFromEntry(entry: GlossaryEntry, locale: Locale): BilingualLabel {
  const isVi = locale === 'vi-VN';
  return {
    primary: isVi ? entry.vi : entry.en,
    secondary: isVi ? entry.en : entry.vi,
    inline: isVi ? `${entry.en}${TERM_SEPARATOR}${entry.vi}` : entry.en,
    short: isVi ? (entry.viShort ?? entry.vi) : entry.en,
    note: entry.noteVi ?? '',
    term: entry.en,
    meaning: entry.vi,
  };
}

/**
 * Lấy nhãn song ngữ theo id thuật ngữ (vd: 'module.dashboard', 'role.ai_ceo').
 * Ném lỗi khi id không tồn tại để phát hiện sớm trong kiểm thử.
 */
export function bilingual(id: string, locale: Locale = DEFAULT_LOCALE): BilingualLabel {
  const entry = getGlossaryEntry(id);
  if (!entry) {
    throw new Error(`[i18n] Glossary term not found: "${id}". Add it to packages/i18n/src/glossary.ts`);
  }
  return bilingualFromEntry(entry, locale);
}

/** Phiên bản an toàn: trả về id khi thiếu (chỉ dùng cho hiển thị không quan trọng). */
export function bilingualSafe(id: string, locale: Locale = DEFAULT_LOCALE): BilingualLabel {
  const entry = getGlossaryEntry(id);
  if (!entry) {
    return { primary: id, secondary: '', inline: id, short: id, note: '', term: id, meaning: id };
  }
  return bilingualFromEntry(entry, locale);
}

// ──────────────── Ánh xạ enum miền → id thuật ngữ ────────────────
export const termIdForRole = (role: AgentRole): string => `role.${role}`;
export const termIdForDepartment = (id: DepartmentId): string => `department.${id}`;
export const termIdForTaskStatus = (s: TaskStatus): string => `task_status.${s}`;
export const termIdForAgentStatus = (s: AgentStatus): string => `agent_status.${s}`;
export const termIdForPriority = (p: TaskPriority): string => `priority.${p}`;
export const termIdForStage = (s: WorkflowStage): string => `stage.${s}`;
export const termIdForApprovalType = (t: ApprovalType): string => `approval_type.${t}`;
export const termIdForApprovalStatus = (s: ApprovalStatus): string => `approval_status.${s}`;
export const termIdForProjectStatus = (s: ProjectStatus): string => `project_status.${s}`;
export const termIdForExecutionMode = (m: ExecutionMode): string => `execution_mode.${m}`;

/** Tên hiển thị chức vụ: "AI CEO – Giám đốc điều hành AI" (vi) hoặc "AI CEO" (en). */
export function roleTitle(role: AgentRole, locale: Locale = DEFAULT_LOCALE): string {
  return bilingual(termIdForRole(role), locale).inline;
}

/**
 * Diễn giải mã lỗi API sang tiêu đề + giải thích tiếng Việt.
 * `code` là định danh kỹ thuật; không dịch mã, chỉ dịch phần hiển thị.
 */
export function describeError(t: TFunction, code: string): { title: string; explain: string } {
  const key = `errors:codes.${code}`;
  const title = t(`${key}.title`, { defaultValue: '' });
  if (!title) {
    return {
      title: t('errors:codes.internal.title'),
      explain: `${t('errors:codes.internal.explain')} (${code})`,
    };
  }
  return { title, explain: t(`${key}.explain`) };
}

export type { Locale, Namespace as I18nNamespace };

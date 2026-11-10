import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCALE_STORAGE_KEY } from '@ads-nolimit/i18n';

/** Lựa chọn ngôn ngữ đã lưu phải được tôn trọng khi tải lại; mặc định vẫn là tiếng Việt. */
describe('setupI18n – ngôn ngữ đã lưu', () => {
  beforeEach(() => {
    vi.resetModules(); // mỗi ca tạo instance i18n mới
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it('không có lựa chọn → vi-VN', async () => {
    const { setupI18n } = await import('./i18n');
    const i18n = await setupI18n();
    expect(i18n.language).toBe('vi-VN');
    expect(document.documentElement.lang).toBe('vi');
  });

  it('đã lưu en-US → khởi tạo bằng en-US', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'en-US');
    const { setupI18n } = await import('./i18n');
    const i18n = await setupI18n();
    expect(i18n.language).toBe('en-US');
    expect(document.documentElement.lang).toBe('en');
  });
});

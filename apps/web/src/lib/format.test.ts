import { beforeAll, describe, expect, it } from 'vitest';
import type { TFunction, i18n as I18nInstance } from 'i18next';
import { initI18n } from '@ads-nolimit/i18n';
import {
  clampPercent,
  formatCompact,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelative,
  formatSignedPercent,
  formatVnd,
  initialsFromRole,
} from './format';

/** Kiểm thử hàm định dạng theo vi-VN và thời gian tương đối với i18n thật (không mock). */

let i18n: I18nInstance;
let t: TFunction;
const NOW = Date.parse('2026-11-10T12:00:00.000Z');
const agoIso = (ms: number) => new Date(NOW - ms).toISOString();

beforeAll(async () => {
  i18n = await initI18n({ lng: 'vi-VN' });
  t = i18n.t.bind(i18n) as TFunction;
});

describe('formatRelative (common:time.*)', () => {
  it('dưới 1 phút → "Vừa xong"', () => {
    expect(formatRelative(agoIso(20_000), t, NOW)).toBe('Vừa xong');
  });
  it('2 phút trước', () => {
    expect(formatRelative(agoIso(2 * 60_000), t, NOW)).toBe('2 phút trước');
  });
  it('3 giờ trước', () => {
    expect(formatRelative(agoIso(3 * 3_600_000 + 5 * 60_000), t, NOW)).toBe('3 giờ trước');
  });
  it('2 ngày trước', () => {
    expect(formatRelative(agoIso(2 * 86_400_000 + 3_600_000), t, NOW)).toBe('2 ngày trước');
  });
  it('mốc thời gian trong tương lai không âm → "Vừa xong"', () => {
    expect(formatRelative(new Date(NOW + 60_000).toISOString(), t, NOW)).toBe('Vừa xong');
  });
  it('bản en-US có dự phòng đầy đủ', async () => {
    const en = await initI18n({ lng: 'en-US' });
    const ten = en.t.bind(en) as TFunction;
    const text = formatRelative(agoIso(2 * 60_000), ten, NOW);
    expect(text).toMatch(/2/);
    expect(text).not.toContain('phút');
  });
});

describe('định dạng số theo vi-VN', () => {
  it('formatNumber dùng dấu chấm ngăn cách hàng nghìn', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
    expect(formatNumber(1234.5, 'en-US')).toBe('1,234.5');
  });
  it('formatVnd có ký hiệu ₫ và không có phần thập phân', () => {
    const text = formatVnd(1500000);
    expect(text).toContain('1.500.000');
    expect(text).toContain('₫');
    expect(text).not.toMatch(/,\d/);
  });
  it('formatPercent / formatSignedPercent', () => {
    expect(formatPercent(42.6)).toBe('43%');
    expect(formatPercent(42.65, 'vi-VN', 1)).toBe('42,7%');
    expect(formatSignedPercent(12)).toBe('+12%');
    expect(formatSignedPercent(-8)).toBe('-8%');
    expect(formatSignedPercent(0)).toBe('0%');
  });
  it('formatCompact rút gọn số lớn', () => {
    const text = formatCompact(12500);
    // vi-VN: "12,5 N" (nghìn); chỉ cần đảm bảo rút gọn, không in đủ chữ số.
    expect(text).not.toContain('12.500');
    expect(text.length).toBeLessThan(8);
  });
  it('formatDate theo ngày/tháng/năm', () => {
    expect(formatDate('2026-11-10T05:00:00.000Z')).toMatch(/^\d{2}\/\d{2}\/2026$/);
  });
});

describe('clampPercent', () => {
  it('giới hạn trong [0, 100] và làm tròn', () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(49.5)).toBe(50);
    expect(clampPercent(33.3)).toBe(33);
  });
});

describe('initialsFromRole', () => {
  it('bỏ tiền tố ai_ và lấy tối đa 2 chữ cái đầu', () => {
    expect(initialsFromRole('ai_ceo')).toBe('C');
    expect(initialsFromRole('ai_project_manager')).toBe('PM');
    expect(initialsFromRole('ai_qa_reviewer')).toBe('QR');
    expect(initialsFromRole('ai_specialist')).toBe('S');
  });
});

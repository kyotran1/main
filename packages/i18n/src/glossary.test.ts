import { describe, expect, it } from 'vitest';
import { GLOSSARY, buildGlossaryResources } from './glossary.js';
import { bilingual, initI18n, roleTitle, describeError } from './index.js';
import { resources, NAMESPACES } from './resources.js';

const VIETNAMESE_DIACRITICS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

describe('bảng thuật ngữ dùng chung', () => {
  it('không có id trùng lặp', () => {
    const ids = GLOSSARY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('mỗi thuật ngữ tiếng Anh chỉ có một bản dịch tiếng Việt trong cùng nhóm', () => {
    const seen = new Map<string, string>();
    for (const e of GLOSSARY) {
      const key = `${e.category}:${e.en.toLowerCase()}`;
      const prev = seen.get(key);
      if (prev) expect(prev).toBe(e.vi);
      seen.set(key, e.vi);
    }
  });

  it('nghĩa tiếng Việt phải thực sự là tiếng Việt (có dấu) hoặc là từ viết tắt được giữ nguyên', () => {
    const allowedAscii = new Set(['ROI', 'Marketing', 'Pantry', 'CRM', 'Cao']);
    for (const e of GLOSSARY) {
      const ok = VIETNAMESE_DIACRITICS.test(e.vi) || allowedAscii.has(e.vi);
      expect(ok, `"${e.id}" → "${e.vi}" chưa phải tiếng Việt`).toBe(true);
    }
  });

  it('tài nguyên glossary cho vi-VN có dạng "EN – VI"', () => {
    const vi = buildGlossaryResources('vi-VN') as Record<string, Record<string, { inline: string }>>;
    expect(vi.module?.dashboard?.inline).toBe('Dashboard – Bảng điều khiển');
    expect(vi.role?.ai_ceo?.inline).toBe('AI CEO – Giám đốc điều hành AI');
  });
});

describe('từ điển giao diện', () => {
  it('vi-VN và en-US có cùng tập khóa ở mọi namespace', () => {
    const flatten = (obj: unknown, prefix = ''): string[] => {
      if (obj === null || typeof obj !== 'object') return [prefix];
      return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
        flatten(v, prefix ? `${prefix}.${k}` : k),
      );
    };
    for (const ns of NAMESPACES) {
      const vi = flatten(resources['vi-VN'][ns]).sort();
      const en = flatten(resources['en-US'][ns]).sort();
      expect(vi, `namespace "${ns}" lệch khóa`).toEqual(en);
    }
  });

  it('khởi tạo i18next với vi-VN mặc định và dịch được chuỗi', async () => {
    const i18n = await initI18n();
    expect(i18n.language).toBe('vi-VN');
    expect(i18n.t('common:app.subtitle')).toBe('Trung tâm điều hành công ty AI');
    expect(i18n.t('glossary:module.approval_center.inline')).toBe('Approval Center – Trung tâm phê duyệt');
    expect(i18n.t('common:time.minutesAgo', { count: 2 })).toBe('2 phút trước');
  });

  it('nhãn song ngữ và tên chức vụ', () => {
    expect(roleTitle('ai_qa_reviewer')).toBe('AI QA Reviewer – Nhân viên kiểm định chất lượng AI');
    expect(bilingual('module.kpi', 'vi-VN').primary).toBe('Chỉ số đánh giá hiệu suất');
    expect(bilingual('module.kpi', 'en-US').inline).toBe('KPI');
    expect(() => bilingual('module.khong_ton_tai')).toThrow();
  });

  it('mã lỗi API được diễn giải bằng tiếng Việt', async () => {
    const i18n = await initI18n();
    const known = describeError(i18n.t.bind(i18n), 'agent_paused');
    expect(known.title).toBe('Nhân sự AI đang tạm dừng');
    expect(known.explain).toContain('Agent Paused');
    const unknown = describeError(i18n.t.bind(i18n), 'weird_code');
    expect(unknown.explain).toContain('weird_code');
  });
});

/**
 * KIỂM TRA CHUẨN NGÔN NGỮ GIAO DIỆN (docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md)
 *
 * 1. Mọi namespace có cùng tập khóa ở vi-VN và en-US.
 * 2. Trong vi-VN: không có giá trị chỉ là thuật ngữ tiếng Anh chuyên ngành (có trong bảng thuật ngữ)
 *    mà thiếu nghĩa tiếng Việt – trừ các khóa *.secondary / *Secondary / *.term (đó là dòng phụ đi kèm nhãn chính).
 * 3. Trong vi-VN: cảnh báo giá trị dài (>= 3 từ) hoàn toàn không có dấu tiếng Việt (nghi là tiếng Anh chưa dịch),
 *    trừ khi có từ trong danh sách cho phép (tên thương hiệu, định danh kỹ thuật).
 * 4. Mã nguồn giao diện (apps/web/src, apps/desktop/src): không hard-code chuỗi hiển thị trong JSX
 *    (văn bản giữa các thẻ hoặc thuộc tính title/placeholder/aria-label là chuỗi cố định có chữ cái).
 *    Cho phép: tên thương hiệu/định danh kỹ thuật được liệt kê, biểu tượng, số, đường dẫn.
 * 5. Mỗi khóa `t('ns:key')` dùng trong mã phải tồn tại trong vi-VN (phát hiện khóa chết hoặc gõ sai).
 *
 * Chạy: pnpm lint:i18n   (thoát mã 1 khi có lỗi; cảnh báo không chặn)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { GLOSSARY } from '../packages/i18n/src/glossary.ts';
import { NAMESPACES, resources } from '../packages/i18n/src/resources.ts';

const ROOT = resolve(import.meta.dirname ?? '.', '..');
const errors: string[] = [];
const warnings: string[] = [];

const VI_DIACRITICS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const BRAND_ALLOW = [
  'ADS-NOLIMIT',
  'AI OFFICE',
  'Meta Ads',
  'Google Ads',
  'TikTok Ads',
  'Google Drive',
  'Google Analytics',
  'Zalo',
  'HubSpot',
  'Canva',
  'Ollama',
  'Anthropic',
  'Claude',
  'Facebook',
  'TikTok',
  'Google',
  'Owner',
  'Ctrl',
  'KPI',
  'ROI',
  'CRM',
  'API',
  'MVP',
  'Local',
  'Cloud',
  'Hybrid',
];

function flatten(obj: unknown, prefix = ''): Record<string, string> {
  if (obj === null || typeof obj !== 'object') return { [prefix]: String(obj) };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

// ───────── 1. Khớp khóa giữa hai ngôn ngữ ─────────
const viFlat: Record<string, string> = {};
for (const ns of NAMESPACES) {
  const vi = flatten(resources['vi-VN'][ns]);
  const en = flatten(resources['en-US'][ns]);
  for (const k of Object.keys(vi)) {
    viFlat[`${ns}:${k}`] = vi[k]!;
    if (!(k in en)) errors.push(`[parity] ${ns}:${k} có trong vi-VN nhưng thiếu trong en-US`);
  }
  for (const k of Object.keys(en)) if (!(k in vi)) errors.push(`[parity] ${ns}:${k} có trong en-US nhưng thiếu trong vi-VN`);
}

// ───────── 2 & 3. Giá trị vi-VN phải là tiếng Việt / có nghĩa tiếng Việt ─────────
const englishTerms = new Set(GLOSSARY.map((g) => g.en.toLowerCase()));
const isSecondaryKey = (k: string) => /(^|\.)(secondary|term|short|inline|shortcut|en|id|key)$|secondary$/i.test(k) || /\.(en|term)$/.test(k);
for (const [fullKey, value] of Object.entries(viFlat)) {
  if (fullKey.startsWith('glossary:')) continue;
  const text = value.trim();
  if (!text) continue;
  const stripped = text.replace(/\{\{[^}]+\}\}/g, '').trim();
  if (!stripped) continue;
  if (isSecondaryKey(fullKey)) continue;
  if (englishTerms.has(stripped.toLowerCase())) {
    errors.push(`[vi-only-term] ${fullKey} = "${text}" là thuật ngữ tiếng Anh chuyên ngành nhưng không kèm nghĩa tiếng Việt`);
    continue;
  }
  const hasLetters = /[A-Za-zÀ-ỹ]/.test(stripped);
  const words = stripped.split(/\s+/).filter((w) => /[A-Za-zÀ-ỹ]/.test(w));
  const brandOnly = BRAND_ALLOW.some((b) => stripped.includes(b)) && words.length <= 4;
  if (hasLetters && words.length >= 3 && !VI_DIACRITICS.test(stripped) && !brandOnly) {
    warnings.push(`[vi-suspect] ${fullKey} = "${text}" không có dấu tiếng Việt – kiểm tra lại bản dịch`);
  }
}

// ───────── 4 & 5. Quét mã nguồn giao diện ─────────
function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      walk(full, acc);
    } else if (/\.(tsx|ts)$/.test(entry) && !/\.test\.tsx?$/.test(entry) && !/\.d\.ts$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const sourceDirs = ['apps/web/src', 'apps/desktop/src'].map((d) => resolve(ROOT, d)).filter((d) => {
  try {
    return statSync(d).isDirectory();
  } catch {
    return false;
  }
});

const JSX_TEXT = />[ \t]*([^<>{}\n][^<>{}\n]*?)[ \t]*</g;
const JSX_ATTR = /\b(title|placeholder|aria-label|alt|label)=("|')([^"'{}]*[A-Za-zÀ-ỹ]{3,}[^"'{}]*)\2/g;
const T_CALL = /\bt\(\s*(['"`])([a-zA-Z0-9_]+:[a-zA-Z0-9_.\-]+)\1/g;
const ALLOWED_INLINE = /^[\s\d.,:%/–\-·•+()|\u2026]*$/;

for (const dir of sourceDirs) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file);
    if (src.includes('i18n-lint-ignore-file')) continue;
    const isTsx = file.endsWith('.tsx');
    if (isTsx) {
      for (const m of src.matchAll(JSX_TEXT)) {
        const idx = m.index ?? 0;
        const before = src[idx - 1];
        if (before === '=' || before === '-') continue; // mũi tên =>, -> không phải JSX
        const text = (m[1] ?? '').trim();
        if (!text || ALLOWED_INLINE.test(text)) continue;
        if (!/[A-Za-zÀ-ỹ]{2,}/.test(text)) continue;
        if (/^[A-Za-z_$][\w$]*(\.[\w$]+)*(\(.*\))?;?$/.test(text)) continue; // biểu thức mã, không phải chữ
        if (BRAND_ALLOW.some((b) => text === b || text.startsWith(`${b} `) || text.endsWith(` ${b}`))) continue;
        if (/^[A-Z0-9_\-./:]+$/.test(text)) continue; // mã kỹ thuật như "ADS-NOLIMIT", "MVP", đường dẫn
        const lineText = src.split('\n')[src.slice(0, idx).split('\n').length - 1] ?? '';
        if (!/<\/?[A-Za-z]/.test(lineText)) continue; // dòng không chứa thẻ JSX
        const line = src.slice(0, idx).split('\n').length;
        errors.push(`[hardcoded-jsx] ${rel}:${line} chuỗi hiển thị cố định "${text}" – hãy dùng t() hoặc <Term/>`);
      }
      for (const m of src.matchAll(JSX_ATTR)) {
        const text = (m[3] ?? '').trim();
        if (BRAND_ALLOW.some((b) => text.includes(b))) continue;
        const line = src.slice(0, m.index).split('\n').length;
        errors.push(`[hardcoded-attr] ${rel}:${line} thuộc tính ${m[1]}="${text}" cố định – hãy dùng t()`);
      }
    }
    for (const m of src.matchAll(T_CALL)) {
      const key = m[2]!;
      const base = key.replace(/_(one|other)$/, '');
      const exists =
        base in viFlat ||
        `${base}_one` in viFlat ||
        `${base}_other` in viFlat ||
        Object.keys(viFlat).some((k) => k.startsWith(`${base}.`)) ||
        base.startsWith('glossary:');
      if (!exists) {
        const line = src.slice(0, m.index).split('\n').length;
        errors.push(`[missing-key] ${rel}:${line} khóa "${key}" không tồn tại trong vi-VN`);
      }
    }
  }
}

for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖  ${e}`);
  console.error(`\n✖  ${errors.length} lỗi chuẩn ngôn ngữ giao diện (i18n lint failed)`);
  process.exit(1);
}
console.log(`✔  Chuẩn ngôn ngữ giao diện đạt: ${Object.keys(viFlat).length} khóa vi-VN, ${GLOSSARY.length} thuật ngữ, ${warnings.length} cảnh báo.`);

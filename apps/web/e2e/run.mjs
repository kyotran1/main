#!/usr/bin/env node
/**
 * KIỂM THỬ E2E – ADS-NOLIMIT AI OFFICE (Playwright, không dùng @playwright/test).
 *
 * Chạy:  pnpm --filter @ads-nolimit/web e2e   (hoặc node apps/web/e2e/run.mjs)
 *
 * Biến môi trường (định danh kỹ thuật – không dịch):
 *   E2E_BASE_URL   Có → dùng máy chủ đang chạy (vd http://localhost:5173). Không → tự khởi động
 *                  backend (PORT=4100, SEED_RESET=1, SIMULATION=off, DATA_FILE tạm) và vite preview.
 *   E2E_ROUTES     Giới hạn tuyến đường, phân tách bằng dấu phẩy (vd "/,/tasks").
 *   E2E_BUILD=1    Buộc dựng lại apps/web/dist trước khi preview (mặc định chỉ dựng khi chưa có dist).
 *   E2E_API_PORT / E2E_WEB_PORT   Cổng tạm (mặc định 4100 / 4173).
 *   E2E_HEADLESS=0 Hiện trình duyệt.
 *   E2E_TIMEOUT_MS Thời gian chờ mỗi trang (mặc định 45000).
 *
 * Kiểm tra mỗi tuyến đường ở 1440x900 và 390x844:
 *   (a) không lỗi console / pageerror        (b) không cuộn ngang
 *   (c) h1 có chữ                            (d) [data-term] có đủ primary + secondary
 *   (e) không có chữ chỉ là thuật ngữ tiếng Anh trong bảng thuật ngữ mà thiếu nghĩa tiếng Việt
 *   (f) html[lang]="vi"                      (g) ảnh chụp e2e/__screenshots__/<route>-<w>.png
 *   (h) tương tác tối thiểu: /approvals có nút Duyệt, /ceo có ô nhập, /office có canvas
 * Thoát mã 1 khi có lỗi.
 */
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '..');
const repoRoot = resolve(webRoot, '..', '..');
const apiRoot = resolve(repoRoot, 'apps', 'api');
const shotDir = join(here, '__screenshots__');

const TIMEOUT_MS = Number(process.env.E2E_TIMEOUT_MS ?? 45_000);
const API_PORT = Number(process.env.E2E_API_PORT ?? 4100);
const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 4173);
const HEADLESS = process.env.E2E_HEADLESS !== '0';
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

// Tuyến đường dự phòng nếu không đọc được routes.ts (giữ đồng bộ với apps/web/src/app/routes.ts).
const FALLBACK_ROUTES = [
  '/', '/dashboard', '/office', '/ceo', '/tasks', '/agents', '/workflow', '/approvals',
  '/connectors', '/org-chart', '/projects', '/activity', '/reports', '/knowledge', '/settings',
];

// ───────────────────────── Tiện ích ─────────────────────────
const log = (...args) => console.log('[e2e]', ...args);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Nạp Playwright: ưu tiên resolve chuẩn (NODE_PATH), sau đó các vị trí cài toàn cục quen thuộc. */
function loadPlaywright() {
  const candidates = ['playwright'];
  const globalRoot = spawnSync('npm', ['root', '-g'], { encoding: 'utf8' }).stdout?.trim();
  if (globalRoot) candidates.push(join(globalRoot, 'playwright'));
  candidates.push('/opt/node-tools/node_modules/playwright', '/usr/local/lib/node_modules/playwright');
  for (const c of candidates) {
    try {
      return require(c);
    } catch {
      /* thử ứng viên tiếp theo */
    }
  }
  throw new Error('Không tìm thấy gói "playwright". Cài toàn cục: npm i -g playwright && npx playwright install chromium');
}

/** Đọc danh sách đường dẫn từ routes.ts bằng regex (không cần biên dịch TS). */
function readRoutes() {
  try {
    const src = readFileSync(resolve(webRoot, 'src', 'app', 'routes.ts'), 'utf8');
    const paths = [...src.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
    const unique = [...new Set(paths)].filter((p) => p.startsWith('/') && !p.includes(':'));
    if (unique.length) return unique;
  } catch {
    /* dùng danh sách dự phòng */
  }
  return FALLBACK_ROUTES;
}

/**
 * Lấy bảng thuật ngữ: chạy tsx để import GLOSSARY thật; nếu thất bại → trích regex từ glossary.ts.
 * Trả về Map<en (chữ thường), vi>.
 */
function loadGlossary() {
  const glossaryPath = resolve(repoRoot, 'packages', 'i18n', 'src', 'glossary.ts');
  const terms = new Map();
  const script = `import { GLOSSARY } from ${JSON.stringify(glossaryPath)}; console.log(JSON.stringify(GLOSSARY));`;
  const res = spawnSync('pnpm', ['exec', 'tsx', '-e', script], { cwd: repoRoot, encoding: 'utf8' });
  if (res.status === 0 && res.stdout) {
    try {
      const line = res.stdout.trim().split('\n').pop();
      for (const e of JSON.parse(line)) {
        // Dạng rút gọn tiếng Việt trùng tiếng Anh (vd department.marketing → "Marketing") thì không cần kèm nghĩa.
        if (e.viShort && String(e.viShort).toLowerCase() === String(e.en).toLowerCase()) continue;
        terms.set(String(e.en).toLowerCase(), String(e.vi));
      }
    } catch {
      /* rơi xuống regex */
    }
  }
  if (terms.size === 0) {
    const src = readFileSync(glossaryPath, 'utf8');
    const re = /g\(\s*'[a-z_]+'\s*,\s*'[a-z0-9_]+'\s*,\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*,\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
    for (const m of src.matchAll(re)) {
      const en = (m[1] ?? m[2] ?? '').replace(/\\(.)/g, '$1');
      const vi = (m[3] ?? m[4] ?? '').replace(/\\(.)/g, '$1');
      if (en) terms.set(en.toLowerCase(), vi);
    }
  }
  // Thuật ngữ có nghĩa tiếng Việt trùng tiếng Anh (vd "Marketing", "ROI") không cần kèm nghĩa.
  for (const [en, vi] of [...terms]) if (en === vi.toLowerCase()) terms.delete(en);
  return terms;
}

async function waitForHttp(url, { timeoutMs = 60_000, accept = (r) => r.ok } = {}) {
  const started = Date.now();
  let lastErr = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (accept(res)) return;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    await sleep(500);
  }
  throw new Error(`Hết thời gian chờ ${url}: ${lastErr?.message ?? 'không rõ'}`);
}

// ───────────────────────── Khởi động máy chủ ─────────────────────────
const children = [];
let tmpDataDir = null;

function spawnChild(cmd, args, opts) {
  const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32', ...opts });
  const tag = opts.tag ?? cmd;
  child.stdout.on('data', (d) => { if (process.env.E2E_VERBOSE) process.stdout.write(`[${tag}] ${d}`); });
  child.stderr.on('data', (d) => { if (process.env.E2E_VERBOSE) process.stderr.write(`[${tag}] ${d}`); });
  children.push(child);
  return child;
}

function killChildren() {
  for (const child of children) {
    if (child.exitCode !== null) continue;
    try {
      if (process.platform !== 'win32') process.kill(-child.pid, 'SIGTERM');
      else child.kill();
    } catch {
      try { child.kill('SIGTERM'); } catch { /* đã thoát */ }
    }
  }
  if (tmpDataDir) {
    try { rmSync(tmpDataDir, { recursive: true, force: true }); } catch { /* bỏ qua */ }
  }
}

process.on('exit', killChildren);
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => { killChildren(); process.exit(130); });
}

async function startServers() {
  tmpDataDir = mkdtempSync(join(tmpdir(), 'ads-nolimit-e2e-'));
  const apiEnv = {
    ...process.env,
    PORT: String(API_PORT),
    HOST: '127.0.0.1',
    SEED_RESET: '1',
    SIMULATION: 'off',
    AI_PROVIDER: 'mock',
    DATA_FILE: join(tmpDataDir, 'office-state.json'),
  };
  const apiDist = resolve(apiRoot, 'dist', 'server.js');
  if (existsSync(apiDist)) {
    log(`Khởi động backend từ dist (cổng ${API_PORT})`);
    spawnChild('node', [apiDist], { cwd: apiRoot, env: apiEnv, tag: 'api' });
  } else {
    log(`Khởi động backend bằng tsx (cổng ${API_PORT})`);
    spawnChild('pnpm', ['exec', 'tsx', 'src/server.ts'], { cwd: apiRoot, env: apiEnv, tag: 'api' });
  }
  await waitForHttp(`http://127.0.0.1:${API_PORT}/api/health`);
  log('Backend sẵn sàng');

  const webDist = resolve(webRoot, 'dist', 'index.html');
  if (!existsSync(webDist) || process.env.E2E_BUILD === '1') {
    log('Dựng giao diện web (vite build)…');
    const build = spawnSync('pnpm', ['exec', 'vite', 'build'], { cwd: webRoot, stdio: 'inherit', env: process.env });
    if (build.status !== 0) throw new Error('vite build thất bại');
  }
  log(`Khởi động vite preview (cổng ${WEB_PORT}) → proxy /api tới http://127.0.0.1:${API_PORT}`);
  spawnChild(
    'pnpm',
    ['exec', 'vite', 'preview', '--port', String(WEB_PORT), '--strictPort', '--host', '127.0.0.1'],
    { cwd: webRoot, env: { ...process.env, VITE_API_PROXY_TARGET: `http://127.0.0.1:${API_PORT}` }, tag: 'web' },
  );
  const base = `http://127.0.0.1:${WEB_PORT}`;
  await waitForHttp(`${base}/`);
  await waitForHttp(`${base}/api/health`);
  log('Giao diện web sẵn sàng');
  return base;
}

// ───────────────────────── Kiểm tra trong trang ─────────────────────────
/** Hàm chạy trong trình duyệt: trả về các số liệu/lỗi cấu trúc DOM. */
function inspectPage(termsEntries) {
  const terms = new Map(termsEntries);
  const issues = [];
  const doc = document;
  const root = doc.documentElement;

  const lang = root.getAttribute('lang');
  const scrollX = root.scrollWidth > root.clientWidth + 1 || doc.body.scrollWidth > root.clientWidth + 1;

  const h1 = doc.querySelector('h1');
  const h1Text = (h1?.textContent ?? '').replace(/\s+/g, ' ').trim();

  // (d) Thuật ngữ xếp chồng phải đủ 2 dòng.
  for (const el of doc.querySelectorAll('[data-term]')) {
    const p = el.querySelector('[data-term-primary]');
    const s = el.querySelector('[data-term-secondary]');
    if (!p || !p.textContent.trim() || !s || !s.textContent.trim()) {
      issues.push({ kind: 'term-structure', text: `data-term="${el.getAttribute('data-term')}" thiếu primary/secondary` });
    }
  }

  // (e) Chữ hiển thị trùng thuật ngữ tiếng Anh mà không kèm nghĩa tiếng Việt.
  const isVisible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    return el.getClientRects().length > 0;
  };
  const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  const hasBilingualTitle = (node) => {
    const title = node.getAttribute('title') ?? node.getAttribute('aria-label') ?? '';
    return title.includes(' – ') || title.includes(' - ');
  };
  const isTermPair = (node) =>
    node.hasAttribute('data-term-secondary') ||
    node.hasAttribute('data-term-primary') ||
    /term-secondary|term-primary/.test(String(node.className ?? '')) ||
    !!node.querySelector('[data-term-secondary], [data-term-primary], [class*="term-secondary"], [class*="term-primary"]');
  /**
   * Nghĩa tiếng Việt được coi là "có mặt" khi: phần tử hoặc tổ tiên gần có title "EN – VI" / data-term;
   * hoặc một anh em ruột (ở bất kỳ cấp tổ tiên nào trong 6 cấp) là dòng phụ song ngữ (data-term-secondary /
   * class term-secondary), mang title song ngữ, hoặc có nội dung đúng bằng nghĩa tiếng Việt trong bảng thuật ngữ.
   */
  const hasMeaningNearby = (el, meaning) => {
    let node = el;
    for (let depth = 0; node && node !== doc.body && depth < 6; depth += 1, node = node.parentElement) {
      if (hasBilingualTitle(node)) return true;
      if (node.hasAttribute('data-term')) return true;
      if (node.hasAttribute('data-term-secondary')) return true; // chính nó là dòng phụ của nhãn song ngữ
      const parent = node.parentElement;
      if (parent) {
        for (const sib of parent.children) {
          if (sib === node) continue;
          if (isTermPair(sib) || hasBilingualTitle(sib)) return true;
          if (meaning && norm(sib.textContent) === norm(meaning)) return true;
        }
      }
    }
    return false;
  };
  const seen = new Set();
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  let el = walker.nextNode();
  while (el) {
    const tag = el.tagName.toLowerCase();
    // Trong SVG (biểu đồ): xét cả phần tử <text> (nhãn trục có thể bị tách thành nhiều <tspan>), bỏ qua <tspan> lẻ.
    const isLeaf = tag === 'text' || (tag !== 'tspan' && el.children.length === 0);
    if (!['script', 'style', 'noscript', 'svg', 'canvas'].includes(tag) && isLeaf) {
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      const key = text.toLowerCase();
      if (text && terms.has(key) && isVisible(el) && !hasMeaningNearby(el, terms.get(key))) {
        const sig = `${key}|${el.tagName}`;
        if (!seen.has(sig)) {
          seen.add(sig);
          issues.push({ kind: 'english-only', text: `"${text}" (thiếu nghĩa: ${terms.get(key)})`, tag: el.tagName.toLowerCase(), cls: String(el.className ?? '').slice(0, 80) });
        }
      }
    }
    el = walker.nextNode();
  }

  return {
    lang,
    scrollX,
    scrollWidth: Math.max(root.scrollWidth, doc.body.scrollWidth),
    clientWidth: root.clientWidth,
    h1Text,
    termCount: doc.querySelectorAll('[data-term]').length,
    issues,
  };
}

/** Kiểm tra tương tác tối thiểu theo tuyến đường. */
async function checkInteractions(page, route) {
  const problems = [];
  if (route === '/approvals') {
    const approveButtons = await page.locator('button', { hasText: /Duyệt/ }).count();
    if (approveButtons === 0) problems.push('Trang /approvals không có nút "Duyệt"');
  }
  if (route === '/ceo') {
    const inputs = await page.locator('textarea:visible, input[type="text"]:visible, input:not([type]):visible, [contenteditable="true"]:visible').count();
    if (inputs === 0) problems.push('Trang /ceo không có ô nhập yêu cầu');
  }
  if (route === '/office') {
    const canvases = await page.locator('canvas').count();
    if (canvases === 0) problems.push('Trang /office không có canvas 3D');
  }
  return problems;
}

const slug = (route) => (route === '/' ? 'overview' : route.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '-'));

async function runRoute(browser, base, route, viewport, terms) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, locale: 'vi-VN' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`console: ${m.text()}`);
  });
  const errors = [];
  let shot = null;
  try {
    await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: TIMEOUT_MS });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await page.waitForSelector('h1', { timeout: 15_000 }).catch(() => {});
    // Chờ dữ liệu hydrate + hiệu ứng ổn định.
    await page.waitForTimeout(1500);

    const info = await page.evaluate(inspectPage, [...terms.entries()]);

    if (info.lang !== 'vi') errors.push(`html[lang]="${info.lang}" (mong đợi "vi")`);
    if (info.scrollX) errors.push(`Cuộn ngang: scrollWidth ${info.scrollWidth} > clientWidth ${info.clientWidth}`);
    if (!info.h1Text) errors.push('Không có tiêu đề trang (h1) hoặc h1 rỗng');
    for (const issue of info.issues) {
      errors.push(issue.kind === 'english-only' ? `Chỉ tiếng Anh: ${issue.text} <${issue.tag} class="${issue.cls}">` : issue.text);
    }
    errors.push(...(await checkInteractions(page, route)));

    mkdirSync(shotDir, { recursive: true });
    shot = join(shotDir, `${slug(route)}-${viewport.width}.png`);
    await page.screenshot({ path: shot, fullPage: false });
  } catch (err) {
    errors.push(`Lỗi khi tải trang: ${err.message}`);
  }
  // Bỏ qua lỗi tải tài nguyên do server đóng kết nối khi ta thoát trang.
  const ignorable = /net::ERR_ABORTED|Failed to load resource.*(404|Not Found).*favicon/i;
  for (const e of consoleErrors) if (!ignorable.test(e)) errors.push(e);
  await context.close();
  return { route, viewport: viewport.name, width: viewport.width, errors, shot };
}

// ───────────────────────── Chạy ─────────────────────────
async function main() {
  const { chromium } = loadPlaywright();
  let routes = readRoutes();
  if (process.env.E2E_ROUTES) {
    const wanted = process.env.E2E_ROUTES.split(',').map((r) => r.trim()).filter(Boolean);
    routes = wanted.map((r) => (r.startsWith('/') ? r : `/${r}`));
  }
  const terms = loadGlossary();
  log(`${routes.length} tuyến đường, ${terms.size} thuật ngữ tiếng Anh cần kèm nghĩa`);

  const base = process.env.E2E_BASE_URL ? process.env.E2E_BASE_URL.replace(/\/$/, '') : await startServers();
  log(`Base URL: ${base}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: HEADLESS });
  } catch (err) {
    log(`Không mở được Chromium mặc định (${err.message}); thử /opt/pw-browsers/chromium`);
    const fallback = '/opt/pw-browsers/chromium';
    browser = await chromium.launch({ headless: HEADLESS, executablePath: existsSync(fallback) ? fallback : undefined });
  }

  const results = [];
  for (const route of routes) {
    for (const vp of VIEWPORTS) {
      const r = await runRoute(browser, base, route, vp, terms);
      results.push(r);
      log(`${r.errors.length ? 'LỖI ' : 'OK  '} ${route.padEnd(12)} ${String(vp.width).padStart(4)}px  ${r.errors.length} vấn đề`);
    }
  }
  await browser.close();

  // Bảng tóm tắt
  console.log('\n┌──────────────┬────────┬────────┬─────────┐');
  console.log('│ Tuyến đường  │ Rộng   │ Kết quả│ Vấn đề  │');
  console.log('├──────────────┼────────┼────────┼─────────┤');
  for (const r of results) {
    console.log(`│ ${r.route.padEnd(12)} │ ${String(r.width).padStart(4)}px │ ${(r.errors.length ? 'LỖI' : 'ĐẠT').padEnd(6)} │ ${String(r.errors.length).padStart(7)} │`);
  }
  console.log('└──────────────┴────────┴────────┴─────────┘');

  const failed = results.filter((r) => r.errors.length);
  if (failed.length) {
    console.log('\nCHI TIẾT LỖI:');
    for (const r of failed) {
      console.log(`\n● ${r.route} @ ${r.width}px`);
      for (const e of r.errors) console.log(`   - ${e}`);
    }
  }
  console.log(`\nẢnh chụp: ${shotDir}`);
  console.log(`Tổng: ${results.length - failed.length}/${results.length} đạt.`);
  process.exitCode = failed.length ? 1 : 0;
}

main()
  .catch((err) => {
    console.error('[e2e] Thất bại:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    killChildren();
    // Đảm bảo thoát ngay cả khi tiến trình con giữ event loop.
    setTimeout(() => process.exit(process.exitCode ?? 0), 300).unref();
  });

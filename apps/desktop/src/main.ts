import { app, BrowserWindow, Menu, dialog, ipcMain, shell, type MenuItemConstructorOptions } from 'electron';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Locale } from '@ads-nolimit/shared';
import { initI18n, normalizeLocale, bilingual } from '@ads-nolimit/i18n';

/**
 * Tiến trình chính Electron – ỨNG DỤNG MÁY TÍNH (Desktop App).
 * - Tải giao diện Web (dev: ADS_NOLIMIT_WEB_URL; prod: apps/web/dist).
 * - Menu, hộp thoại dùng CÙNG từ điển @ads-nolimit/i18n với bản Web (vi-VN mặc định).
 */
let mainWindow: BrowserWindow | null = null;
let locale: Locale = 'vi-VN';
let i18n: Awaited<ReturnType<typeof initI18n>>;

const WEB_URL = process.env.ADS_NOLIMIT_WEB_URL;
const WEB_DIST_INDEX = resolve(__dirname, '..', '..', 'web', 'dist', 'index.html');

function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, { lng: locale, ...options }) as string;
}

/** Nhãn menu song ngữ: "Cài đặt hệ thống – Settings". */
function termLabel(id: string): string {
  const b = bilingual(id, locale);
  return locale === 'vi-VN' ? `${b.primary} – ${b.secondary}` : b.primary;
}

function buildMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: t('desktop:menu.app'),
      submenu: [
        { label: t('desktop:menu.about'), click: () => void showAbout() },
        { type: 'separator' },
        { label: t('desktop:menu.quit'), role: 'quit' },
      ],
    },
    {
      label: t('desktop:menu.navigate'),
      submenu: [
        { label: termLabel('module.overview'), click: () => navigate('/') },
        { label: termLabel('module.dashboard'), click: () => navigate('/dashboard') },
        { label: termLabel('module.virtual_office_3d'), click: () => navigate('/office') },
        { label: termLabel('module.ceo_command_center'), click: () => navigate('/ceo') },
        { label: termLabel('module.task_management'), click: () => navigate('/tasks') },
        { label: termLabel('module.approval_center'), click: () => navigate('/approvals') },
        { type: 'separator' },
        { label: termLabel('module.settings'), click: () => navigate('/settings') },
      ],
    },
    {
      label: t('desktop:menu.view'),
      submenu: [
        { label: t('desktop:menu.reload'), role: 'reload' },
        { label: t('desktop:menu.fullscreen'), role: 'togglefullscreen' },
        { label: t('desktop:menu.devtools'), role: 'toggleDevTools' },
      ],
    },
    {
      label: t('desktop:menu.language'),
      submenu: [
        { label: t('common:language.vi-VN'), type: 'radio', checked: locale === 'vi-VN', click: () => void setLocale('vi-VN') },
        { label: t('common:language.en-US'), type: 'radio', checked: locale === 'en-US', click: () => void setLocale('en-US') },
      ],
    },
    {
      label: t('desktop:menu.help'),
      submenu: [{ label: t('desktop:menu.docs'), click: () => void shell.openExternal('https://github.com/kyotran1/main') }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function navigate(path: string): void {
  if (!mainWindow) return;
  if (WEB_URL) {
    void mainWindow.loadURL(`${WEB_URL.replace(/\/$/, '')}${path}`);
  } else {
    void mainWindow.loadFile(WEB_DIST_INDEX, { hash: path });
  }
}

async function showAbout(): Promise<void> {
  await dialog.showMessageBox({
    type: 'info',
    title: t('common:app.name'),
    message: `${t('common:app.name')} – ${t('common:app.subtitle')}`,
    detail: `${t('desktop:about.detail')}\n${t('common:labels.version', { version: app.getVersion() })}`,
    buttons: [t('common:labels.close')],
  });
}

async function setLocale(next: Locale): Promise<void> {
  locale = next;
  buildMenu();
  mainWindow?.webContents.send('desktop:locale-changed', locale);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#070b1f',
    title: `${t('common:app.name')} – ${t('common:app.subtitle')}`,
    webPreferences: {
      preload: resolve(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.on('closed', () => (mainWindow = null));
  if (WEB_URL) {
    void mainWindow.loadURL(WEB_URL);
  } else if (existsSync(WEB_DIST_INDEX)) {
    void mainWindow.loadFile(WEB_DIST_INDEX);
  } else {
    void dialog.showErrorBox(t('desktop:errors.webMissing.title'), t('desktop:errors.webMissing.explain'));
  }
}

app.whenReady().then(async () => {
  i18n = await initI18n({ lng: locale });
  locale = normalizeLocale(i18n.language);
  ipcMain.handle('desktop:get-locale', () => locale);
  ipcMain.handle('desktop:set-locale', (_e, next: string) => setLocale(normalizeLocale(next)));
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

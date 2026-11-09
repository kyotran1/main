import { contextBridge, ipcRenderer } from 'electron';

/**
 * Cầu nối an toàn giữa giao diện Web và tiến trình chính.
 * Giao diện dùng chung mã nguồn với bản Web; chỉ bổ sung thông tin nền tảng.
 */
contextBridge.exposeInMainWorld('adsNolimitDesktop', {
  platform: process.platform,
  version: process.env.npm_package_version ?? '0.1.0',
  getLocale: (): Promise<string> => ipcRenderer.invoke('desktop:get-locale'),
  setLocale: (locale: string): Promise<void> => ipcRenderer.invoke('desktop:set-locale', locale),
});

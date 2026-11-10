/**
 * Nhận diện môi trường chạy và địa chỉ backend.
 * - Web (http/https): dùng VITE_API_BASE_URL nếu có, mặc định cùng origin (Vite proxy /api).
 * - Desktop (Electron tải bản build qua file://): không có origin HTTP nên trỏ thẳng tới Local Runtime.
 */
export const isFileProtocol = (): boolean => typeof window !== 'undefined' && window.location.protocol === 'file:';

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (isFileProtocol()) return 'http://127.0.0.1:4000';
  return '';
}

/** URL cho socket.io: rỗng → cùng origin. */
export function getSocketUrl(): string {
  return getApiBaseUrl() || '/';
}

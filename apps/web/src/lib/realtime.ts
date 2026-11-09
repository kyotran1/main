import { io, type Socket } from 'socket.io-client';
import { SOCKET_EVENT_NAME, SOCKET_HELLO_NAME, type OfficeEvent } from '@ads-nolimit/shared';
import { useOfficeStore } from '@/store/officeStore';
import { api } from './api';

/**
 * Kết nối thời gian thực với backend. Backend là nguồn dữ liệu duy nhất:
 * - Khi kết nối: nhận snapshot đầy đủ → hydrate store.
 * - Sau đó: áp dụng từng sự kiện lên store.
 * - Mất kết nối: chuyển trạng thái, tự thử lại; đồng thời polling dự phòng mỗi 15s.
 */
let socket: Socket | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

export function startRealtime(): void {
  if (socket) return;
  const store = useOfficeStore.getState();
  store.setConnection('connecting');

  void api
    .getState()
    .then((snapshot) => useOfficeStore.getState().hydrate(snapshot))
    .catch((err: Error) => useOfficeStore.getState().setConnection('offline', err.message));

  socket = io(import.meta.env.VITE_API_BASE_URL ?? '/', {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });

  socket.on('connect', () => {
    useOfficeStore.getState().setConnection('live');
    socket?.emit(SOCKET_HELLO_NAME, { client: 'web', revision: useOfficeStore.getState().revision });
    stopPolling();
  });
  socket.on(SOCKET_EVENT_NAME, (event: OfficeEvent) => useOfficeStore.getState().applyEvent(event));
  socket.on('disconnect', () => {
    useOfficeStore.getState().setConnection('reconnecting', 'websocket_disconnected');
    startPolling();
  });
  socket.io.on('reconnect_attempt', () => useOfficeStore.getState().setConnection('reconnecting'));
  socket.on('connect_error', (err) => {
    useOfficeStore.getState().setConnection('offline', err.message);
    startPolling();
  });
}

function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    void api
      .getState()
      .then((snapshot) => {
        const s = useOfficeStore.getState();
        if (snapshot.revision !== s.revision) s.hydrate(snapshot);
      })
      .catch(() => {
        /* giữ trạng thái offline */
      });
  }, 15_000);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function stopRealtime(): void {
  stopPolling();
  socket?.disconnect();
  socket = null;
}

/** Làm mới toàn bộ snapshot theo yêu cầu (nút "Làm mới"). */
export async function refreshSnapshot(): Promise<void> {
  const snapshot = await api.getState();
  useOfficeStore.getState().hydrate(snapshot);
}

import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { SOCKET_EVENT_NAME, SOCKET_HELLO_NAME, type OfficeEvent } from '@ads-nolimit/shared';
import type { OfficeStore } from '../store/OfficeStore.js';

/**
 * Phát sự kiện realtime cho mọi client (Web, Desktop). Khi client kết nối sẽ nhận
 * snapshot đầy đủ để đồng bộ trạng thái, sau đó nhận từng sự kiện gia tăng.
 */
export function attachRealtime(httpServer: HttpServer, store: OfficeStore, corsOrigin: string | string[] | boolean) {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
    serveClient: false,
  });

  io.on('connection', (socket) => {
    const hello: OfficeEvent = { type: 'snapshot', snapshot: store.getSnapshot() };
    socket.emit(SOCKET_EVENT_NAME, hello);
    socket.on(SOCKET_HELLO_NAME, (payload: { revision?: number } | undefined) => {
      if (typeof payload?.revision === 'number' && payload.revision !== store.revision) {
        socket.emit(SOCKET_EVENT_NAME, { type: 'snapshot', snapshot: store.getSnapshot() } satisfies OfficeEvent);
      }
    });
  });

  const forward = (event: OfficeEvent) => io.emit(SOCKET_EVENT_NAME, event);
  store.on('event', forward);

  return {
    io,
    close: async () => {
      store.off('event', forward);
      await io.close();
    },
  };
}

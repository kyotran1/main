import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@ads-nolimit/shared';
import { ApiError } from './errors.js';
import type { OfficeStore } from './store/OfficeStore.js';
import { registerReadRoutes } from './routes/read.js';
import { registerCommandRoutes } from './routes/commands.js';
import type { OfficeEngine } from './engine/OfficeEngine.js';

export interface BuildAppOptions {
  store: OfficeStore;
  engine: OfficeEngine;
  corsOrigin?: string | string[] | boolean;
  logger?: boolean;
  /** Thư mục bản build giao diện Web (apps/web/dist) để Local Runtime phục vụ qua HTTP – dùng cho Desktop/triển khai một tiến trình. */
  webDist?: string;
}

/** Tạo ứng dụng Fastify với xử lý lỗi chuẩn hóa (code kỹ thuật + thông điệp kỹ thuật). */
export async function buildApp({ store, engine, corsOrigin = true, logger = false, webDist }: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger });
  await app.register(cors, { origin: corsOrigin });

  // Phục vụ giao diện Web đã build (nếu có) trên cùng origin với API → Electron tải http://127.0.0.1:4000
  // thay vì file:// (Chromium chặn module script qua file://). Các đường dẫn SPA trả về index.html.
  const webIndex = webDist && existsSync(join(webDist, 'index.html')) ? join(webDist, 'index.html') : null;
  if (webDist && webIndex) {
    await app.register(fastifyStatic, { root: webDist, prefix: '/', wildcard: false, index: ['index.html'] });
  }

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ApiError) {
      const body: ApiErrorBody = { code: err.code, message: err.message, details: err.details };
      return reply.status(err.statusCode).send(body);
    }
    if (err instanceof ZodError) {
      const body: ApiErrorBody = { code: 'validation_failed', message: 'Request body failed validation', details: err.issues };
      return reply.status(400).send(body);
    }
    const anyErr = err as { statusCode?: number; validation?: unknown; message?: string };
    if (anyErr.validation) {
      const body: ApiErrorBody = { code: 'validation_failed', message: anyErr.message ?? 'Validation failed', details: anyErr.validation };
      return reply.status(400).send(body);
    }
    app.log.error(err);
    const body: ApiErrorBody = { code: 'internal', message: anyErr.message ?? 'Internal error' };
    return reply.status(anyErr.statusCode && anyErr.statusCode >= 400 ? anyErr.statusCode : 500).send(body);
  });

  app.setNotFoundHandler((req, reply) => {
    const wantsHtml = req.method === 'GET' && !req.url.startsWith('/api') && !req.url.startsWith('/socket.io');
    if (webIndex && wantsHtml) {
      return reply.type('text/html; charset=utf-8').send(readFileSync(webIndex, 'utf8'));
    }
    const body: ApiErrorBody = { code: 'not_found', message: 'Route not found' };
    return reply.status(404).send(body);
  });

  await registerReadRoutes(app, store);
  await registerCommandRoutes(app, store, engine);
  return app;
}

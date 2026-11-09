import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
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
}

/** Tạo ứng dụng Fastify với xử lý lỗi chuẩn hóa (code kỹ thuật + thông điệp kỹ thuật). */
export async function buildApp({ store, engine, corsOrigin = true, logger = false }: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger });
  await app.register(cors, { origin: corsOrigin });

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

  app.setNotFoundHandler((_req, reply) => {
    const body: ApiErrorBody = { code: 'not_found', message: 'Route not found' };
    return reply.status(404).send(body);
  });

  await registerReadRoutes(app, store);
  await registerCommandRoutes(app, store, engine);
  return app;
}

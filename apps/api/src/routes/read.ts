import type { FastifyInstance } from 'fastify';
import { API_ROUTES } from '@ads-nolimit/shared';
import type { OfficeStore } from '../store/OfficeStore.js';

/** Các route đọc – trả dữ liệu từ nguồn duy nhất. */
export async function registerReadRoutes(app: FastifyInstance, store: OfficeStore) {
  app.get(API_ROUTES.health, async () => ({
    ok: true,
    revision: store.revision,
    executionMode: store.getSnapshot().company.executionMode,
    updatedAt: store.getSnapshot().updatedAt,
  }));
  app.get(API_ROUTES.state, async () => store.getSnapshot());
  app.get(API_ROUTES.agents, async () => store.getSnapshot().agents);
  app.get(API_ROUTES.tasks, async () => store.getSnapshot().tasks);
  app.get(API_ROUTES.approvals, async () => store.getSnapshot().approvals);
  app.get(API_ROUTES.activities, async (req) => {
    const limit = Number((req.query as { limit?: string }).limit ?? 100);
    return store.getSnapshot().activities.slice(0, Math.max(1, Math.min(500, limit)));
  });
  app.get(API_ROUTES.projects, async () => store.getSnapshot().projects);
  app.get(API_ROUTES.connectors, async () => store.getSnapshot().connectors);
  app.get(API_ROUTES.kpis, async () => store.getSnapshot().kpis);
}

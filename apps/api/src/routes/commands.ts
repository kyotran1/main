import type { FastifyInstance } from 'fastify';
import {
  API_ROUTES,
  createCeoRequestSchema,
  createTaskSchema,
  decideApprovalSchema,
  sendAgentMessageSchema,
  updateSettingsSchema,
  updateTaskSchema,
} from '@ads-nolimit/shared';
import type { OfficeStore } from '../store/OfficeStore.js';
import type { OfficeEngine } from '../engine/OfficeEngine.js';
import { createSeedSnapshot } from '../seed.js';

/** Các route lệnh (ghi) – thân yêu cầu được kiểm tra bằng zod, lỗi trả về mã kỹ thuật chuẩn hóa. */
export async function registerCommandRoutes(app: FastifyInstance, store: OfficeStore, engine: OfficeEngine) {
  app.post(API_ROUTES.ceoRequests, async (req, reply) => {
    const body = createCeoRequestSchema.parse(req.body);
    const result = await engine.handleOwnerRequest(body.text, body.priority ?? 'high');
    return reply.status(201).send(result);
  });

  app.post(API_ROUTES.tasks, async (req, reply) => {
    const body = createTaskSchema.parse(req.body);
    return reply.status(201).send(engine.createTask(body));
  });

  app.patch<{ Params: { taskId: string } }>('/api/tasks/:taskId', async (req) => {
    const body = updateTaskSchema.parse(req.body);
    return engine.updateTask(req.params.taskId, body);
  });

  app.post<{ Params: { approvalId: string } }>('/api/approvals/:approvalId/approve', async (req) => {
    const body = decideApprovalSchema.parse(req.body ?? {});
    return engine.decideApproval(req.params.approvalId, 'approve', body.note);
  });

  app.post<{ Params: { approvalId: string } }>('/api/approvals/:approvalId/reject', async (req) => {
    const body = decideApprovalSchema.parse(req.body ?? {});
    return engine.decideApproval(req.params.approvalId, 'reject', body.note);
  });

  app.post<{ Params: { agentId: string } }>('/api/agents/:agentId/pause', async (req) => engine.pauseAgent(req.params.agentId));
  app.post<{ Params: { agentId: string } }>('/api/agents/:agentId/resume', async (req) => engine.resumeAgent(req.params.agentId));

  app.post<{ Params: { agentId: string } }>('/api/agents/:agentId/messages', async (req, reply) => {
    const body = sendAgentMessageSchema.parse(req.body);
    const result = await engine.sendMessage(req.params.agentId, body.text);
    return reply.status(201).send(result);
  });

  app.patch(API_ROUTES.settings, async (req) => {
    const body = updateSettingsSchema.parse(req.body);
    return engine.updateSettings(body);
  });

  /** Đặt lại dữ liệu mẫu (chỉ dùng khi phát triển/demo). */
  app.post('/api/admin/reset', async () => {
    store.replace(createSeedSnapshot());
    return { ok: true, revision: store.revision };
  });

  /** Kích hoạt một nhịp mô phỏng thủ công (phục vụ demo/kiểm thử). */
  app.post('/api/admin/tick', async () => {
    await engine.tick();
    return { ok: true, revision: store.revision };
  });
}

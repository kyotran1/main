import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { ApiErrorBody, Approval, OfficeSnapshot, Task } from '@ads-nolimit/shared';
import { buildApp } from './app.js';
import { OfficeStore } from './store/OfficeStore.js';
import { createSeedSnapshot } from './seed.js';
import { OfficeEngine } from './engine/OfficeEngine.js';
import { MockBrain } from './engine/providers/mock.js';

/**
 * Kiểm thử route HTTP bằng app.inject (không mở cổng). Dữ liệu mẫu được dựng mới cho mỗi test,
 * mô phỏng tắt để kết quả xác định.
 */

let app: FastifyInstance;
let store: OfficeStore;

beforeEach(async () => {
  store = new OfficeStore(createSeedSnapshot());
  const engine = new OfficeEngine(store, { provider: new MockBrain(), simulation: false });
  app = await buildApp({ store, engine });
});

afterEach(async () => {
  await app.close();
});

/** Lỗi API phải có dạng {code, message} với code là định danh kỹ thuật. */
function expectErrorBody(body: unknown, code: string): ApiErrorBody {
  const err = body as ApiErrorBody;
  expect(err.code).toBe(code);
  expect(typeof err.message).toBe('string');
  expect(err.message.length).toBeGreaterThan(0);
  return err;
}

describe('route đọc', () => {
  it('GET /api/health trả ok, revision và chế độ vận hành', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json<{ ok: boolean; revision: number; executionMode: string }>();
    expect(body.ok).toBe(true);
    expect(body.revision).toBe(store.revision);
    expect(['local', 'cloud', 'hybrid']).toContain(body.executionMode);
  });

  it('GET /api/state trả toàn bộ snapshot (revision, nhân sự, công việc)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/state' });
    expect(res.statusCode).toBe(200);
    const snap = res.json<OfficeSnapshot>();
    expect(snap.revision).toBe(store.revision);
    expect(snap.agents.length).toBe(10);
    expect(snap.agents.some((a) => a.role === 'ai_ceo')).toBe(true);
    expect(snap.tasks.length).toBeGreaterThan(0);
    expect(snap.departments.length).toBeGreaterThan(0);
  });

  it('GET /api/activities?limit=2 giới hạn số bản ghi', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/activities?limit=2' });
    expect(res.statusCode).toBe(200);
    expect(res.json<unknown[]>()).toHaveLength(2);
  });
});

describe('POST /api/ceo/requests', () => {
  it('yêu cầu hợp lệ → 201 với kế hoạch, phê duyệt và phản hồi của AI CEO', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/ceo/requests',
      payload: { text: 'Xây dựng kế hoạch marketing 30 ngày, tăng 30% khách hàng tiềm năng.', priority: 'high' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json<{ planTask: Task; approval?: Approval; reply: { from: string; text: string } }>();
    expect(body.planTask.status).toBe('needs_approval');
    expect(body.approval?.status).toBe('pending');
    expect(body.reply.from).toBe('agent');
    expect(body.reply.text.length).toBeGreaterThan(20);
  });

  it('thiếu/ngắn text → 400 validation_failed', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/ceo/requests', payload: { text: 'ab' } });
    expect(res.statusCode).toBe(400);
    const err = expectErrorBody(res.json(), 'validation_failed');
    expect(err.details).toBeDefined();
  });

  it('priority không hợp lệ → 400 validation_failed', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/ceo/requests', payload: { text: 'Kế hoạch mới', priority: 'urgent' } });
    expect(res.statusCode).toBe(400);
    expectErrorBody(res.json(), 'validation_failed');
  });
});

describe('PATCH /api/tasks/:taskId', () => {
  it('cập nhật công việc có sẵn → 200 với dữ liệu mới', async () => {
    const res = await app.inject({ method: 'PATCH', url: '/api/tasks/task_plan_q4', payload: { progress: 90, focus: false } });
    expect(res.statusCode).toBe(200);
    const task = res.json<Task>();
    expect(task.id).toBe('task_plan_q4');
    expect(task.progress).toBe(90);
    expect(task.focus).toBe(false);
    expect(store.getTask('task_plan_q4')?.progress).toBe(90);
  });

  it('id lạ → 404 not_found', async () => {
    const res = await app.inject({ method: 'PATCH', url: '/api/tasks/task_khong_ton_tai', payload: { progress: 10 } });
    expect(res.statusCode).toBe(404);
    expectErrorBody(res.json(), 'not_found');
  });

  it('progress ngoài [0,100] → 400 validation_failed', async () => {
    const res = await app.inject({ method: 'PATCH', url: '/api/tasks/task_plan_q4', payload: { progress: 150 } });
    expect(res.statusCode).toBe(400);
    expectErrorBody(res.json(), 'validation_failed');
  });
});

describe('POST /api/approvals/:approvalId/approve|reject', () => {
  it('duyệt lần đầu → 200; duyệt lại → 409 approval_already_decided', async () => {
    const first = await app.inject({ method: 'POST', url: '/api/approvals/appr_plan_q4/approve', payload: { note: 'Đồng ý' } });
    expect(first.statusCode).toBe(200);
    const approval = first.json<Approval>();
    expect(approval.status).toBe('approved');
    expect(approval.decisionNote).toBe('Đồng ý');

    const second = await app.inject({ method: 'POST', url: '/api/approvals/appr_plan_q4/approve', payload: {} });
    expect(second.statusCode).toBe(409);
    expectErrorBody(second.json(), 'approval_already_decided');
  });

  it('từ chối với body rỗng (không gửi payload) vẫn hợp lệ', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/approvals/appr_budget_split/reject' });
    expect(res.statusCode).toBe(200);
    expect(res.json<Approval>().status).toBe('rejected');
  });

  it('id lạ → 404 not_found', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/approvals/appr_x/approve', payload: {} });
    expect(res.statusCode).toBe(404);
    expectErrorBody(res.json(), 'not_found');
  });
});

describe('nhân sự AI: tạm dừng, giao việc, nhắn tin', () => {
  it('tạm dừng rồi giao việc cho nhân sự đó → 409 agent_paused; tiếp tục thì giao được (201)', async () => {
    const pause = await app.inject({ method: 'POST', url: '/api/agents/agent_spec_marketing/pause', payload: {} });
    expect(pause.statusCode).toBe(200);
    expect(pause.json<{ status: string }>().status).toBe('paused');

    const blocked = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: { title: 'Chạy quảng cáo tuần này', assigneeId: 'agent_spec_marketing', priority: 'high' },
    });
    expect(blocked.statusCode).toBe(409);
    expectErrorBody(blocked.json(), 'agent_paused');

    const resume = await app.inject({ method: 'POST', url: '/api/agents/agent_spec_marketing/resume', payload: {} });
    expect(resume.statusCode).toBe(200);

    const created = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: { title: 'Chạy quảng cáo tuần này', assigneeId: 'agent_spec_marketing', priority: 'high' },
    });
    expect(created.statusCode).toBe(201);
    const task = created.json<Task>();
    expect(task.assigneeId).toBe('agent_spec_marketing');
    expect(task.status).toBe('in_progress');
    expect(task.departmentId).toBe('marketing');
  });

  it('POST /api/tasks không có người phụ trách → 201, trạng thái chưa bắt đầu', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/tasks', payload: { title: 'Việc chờ phân công' } });
    expect(res.statusCode).toBe(201);
    expect(res.json<Task>().status).toBe('not_started');
  });

  it('POST /api/tasks với tiêu đề quá ngắn → 400 validation_failed', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/tasks', payload: { title: 'a' } });
    expect(res.statusCode).toBe(400);
    expectErrorBody(res.json(), 'validation_failed');
  });

  it('POST /api/agents/:id/pause với id lạ → 404 not_found', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/agents/agent_x/pause', payload: {} });
    expect(res.statusCode).toBe(404);
    expectErrorBody(res.json(), 'not_found');
  });

  it('POST /api/agents/:id/messages → 201, phản hồi từ nhân sự AI', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/agents/agent_pm/messages', payload: { text: 'Cho tôi biết tiến độ hiện tại' } });
    expect(res.statusCode).toBe(201);
    const body = res.json<{ owner: { from: string; text: string }; reply: { from: string; agentId: string; text: string } }>();
    expect(body.owner.from).toBe('owner');
    expect(body.owner.text).toBe('Cho tôi biết tiến độ hiện tại');
    expect(body.reply.from).toBe('agent');
    expect(body.reply.agentId).toBe('agent_pm');
    expect(body.reply.text.length).toBeGreaterThan(0);
  });

  it('nhắn tin với text rỗng → 400 validation_failed', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/agents/agent_pm/messages', payload: { text: '   ' } });
    expect(res.statusCode).toBe(400);
    expectErrorBody(res.json(), 'validation_failed');
  });
});

describe('PATCH /api/settings', () => {
  it('đổi chế độ vận hành và tên chủ doanh nghiệp', async () => {
    const res = await app.inject({ method: 'PATCH', url: '/api/settings', payload: { executionMode: 'local', ownerName: 'Anh Minh' } });
    expect(res.statusCode).toBe(200);
    const company = res.json<{ executionMode: string; ownerName: string }>();
    expect(company.executionMode).toBe('local');
    expect(company.ownerName).toBe('Anh Minh');
  });

  it('chế độ vận hành không hợp lệ → 400 validation_failed', async () => {
    const res = await app.inject({ method: 'PATCH', url: '/api/settings', payload: { executionMode: 'offline' } });
    expect(res.statusCode).toBe(400);
    expectErrorBody(res.json(), 'validation_failed');
  });
});

describe('route lạ', () => {
  it('GET đường dẫn không tồn tại → 404 với body {code: not_found, message}', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/khong-ton-tai' });
    expect(res.statusCode).toBe(404);
    const err = expectErrorBody(res.json(), 'not_found');
    expect(Object.keys(err)).toEqual(expect.arrayContaining(['code', 'message']));
  });
});

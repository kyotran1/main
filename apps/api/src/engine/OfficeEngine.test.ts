import { describe, expect, it } from 'vitest';
import { OfficeStore } from '../store/OfficeStore.js';
import { createSeedSnapshot } from '../seed.js';
import { OfficeEngine } from './OfficeEngine.js';
import { MockBrain } from './providers/mock.js';
import { ApiError } from '../errors.js';

function setup(random = () => 0.5) {
  const store = new OfficeStore(createSeedSnapshot());
  const engine = new OfficeEngine(store, { provider: new MockBrain(), simulation: false, random });
  return { store, engine };
}

describe('OfficeEngine – mô hình AI CEO', () => {
  it('yêu cầu của Owner tạo kế hoạch, công việc con, yêu cầu phê duyệt và phản hồi tiếng Việt', async () => {
    const { store, engine } = setup();
    const events: string[] = [];
    store.on('event', (e: { type: string }) => events.push(e.type));
    const result = await engine.handleOwnerRequest(
      'Xây dựng kế hoạch marketing 30 ngày, mục tiêu tăng 30% khách hàng tiềm năng, triển khai quảng cáo và nội dung video.',
    );
    expect(result.planTask.assigneeId).toBe('agent_ceo');
    expect(result.planTask.status).toBe('needs_approval');
    expect(result.approval?.type).toBe('plan');
    expect(result.approval?.title).toMatch(/^Phê duyệt kế hoạch: Xây dựng/);
    expect(result.reply.text).toMatch(/Trung tâm phê duyệt/);
    const children = store.getSnapshot().tasks.filter((t) => t.parentId === result.planTask.id);
    expect(children.length).toBeGreaterThanOrEqual(4);
    expect(children.every((t) => t.status === 'pending' && t.assigneeId)).toBe(true);
    expect(children.some((t) => t.departmentId === 'creative_media')).toBe(true);
    expect(events).toContain('task.upserted');
    expect(events).toContain('approval.upserted');
    expect(events).toContain('activity.created');
    expect(events).toContain('message.created');
  });

  it('phê duyệt kế hoạch kích hoạt công việc con và cập nhật trạng thái nhân sự', async () => {
    const { store, engine } = setup();
    const { planTask, approval } = await engine.handleOwnerRequest('Lập kế hoạch quảng cáo 14 ngày cho sản phẩm mới.');
    const decided = engine.decideApproval(approval!.id, 'approve', 'Đồng ý triển khai');
    expect(decided.status).toBe('approved');
    expect(store.getTask(planTask.id)?.status).toBe('completed');
    const children = store.getSnapshot().tasks.filter((t) => t.parentId === planTask.id);
    expect(children.some((t) => t.status === 'in_progress')).toBe(true);
    const running = children.find((t) => t.status === 'in_progress')!;
    expect(store.getAgent(running.assigneeId!)?.status).toBe('running');
    expect(() => engine.decideApproval(approval!.id, 'approve')).toThrowError(ApiError);
  });

  it('từ chối kế hoạch chặn công việc con và AI CEO phản hồi Owner', async () => {
    const { store, engine } = setup();
    const { planTask, approval } = await engine.handleOwnerRequest('Chiến dịch truyền thông cộng đồng trên Zalo.');
    engine.decideApproval(approval!.id, 'reject', 'Ngân sách chưa phù hợp');
    expect(store.getTask(planTask.id)?.status).toBe('pending');
    const children = store.getSnapshot().tasks.filter((t) => t.parentId === planTask.id);
    expect(children.every((t) => t.status === 'blocked')).toBe(true);
    const last = store.getSnapshot().messages.at(-1)!;
    expect(last.from).toBe('agent');
    expect(last.text).toMatch(/Ngân sách chưa phù hợp/);
  });

  it('mô phỏng tiến độ: thực thi → kiểm định (QA di chuyển tới phòng ban) → hoàn thành', async () => {
    const { store, engine } = setup(() => 0.99);
    const task = engine.createTask({ title: 'Viết 3 bài giới thiệu dịch vụ', assigneeId: 'agent_spec_content', priority: 'high' });
    expect(task.status).toBe('in_progress');
    for (let i = 0; i < 12; i++) await engine.tick();
    const reviewed = store.getTask(task.id)!;
    expect(['in_review', 'completed']).toContain(reviewed.status);
    if (reviewed.status === 'in_review') {
      const qa = store.getAgent('agent_qa')!;
      const reviewing = store.getSnapshot().tasks.filter((t) => t.status === 'in_review');
      expect(qa.location.kind).toBe('department');
      expect(reviewing.map((t) => t.departmentId)).toContain((qa.location as { departmentId: string }).departmentId);
      expect(reviewing.map((t) => t.id)).toContain(qa.currentTaskId);
    }
    const engine2 = new OfficeEngine(store, { provider: new MockBrain(), simulation: false, random: () => 0.1 });
    for (let i = 0; i < 6; i++) await engine2.tick();
    expect(store.getTask(task.id)?.status).toBe('completed');
    expect(store.getSnapshot().activities.some((a) => a.kind === 'review_passed' && a.taskId === task.id)).toBe(true);
  });

  it('tạm dừng nhân sự chuyển công việc về chờ, tiếp tục thì khởi động lại; giao việc cho nhân sự tạm dừng bị từ chối', () => {
    const { store, engine } = setup();
    engine.pauseAgent('agent_spec_marketing');
    expect(store.getAgent('agent_spec_marketing')?.status).toBe('paused');
    expect(store.getSnapshot().tasks.filter((t) => t.assigneeId === 'agent_spec_marketing' && t.status === 'in_progress')).toHaveLength(0);
    expect(() => engine.createTask({ title: 'Việc mới', assigneeId: 'agent_spec_marketing' })).toThrowError(/paused/);
    engine.resumeAgent('agent_spec_marketing');
    expect(store.getAgent('agent_spec_marketing')?.status).toBe('running');
  });

  it('cập nhật công việc kiểm tra tồn tại và tính lại tiến độ dự án', () => {
    const { store, engine } = setup();
    expect(() => engine.updateTask('task_khong_co', { status: 'completed' })).toThrowError(ApiError);
    const before = store.getProject('proj_q4_launch')!.progress;
    engine.updateTask('task_content_batch', { status: 'completed' });
    expect(store.getTask('task_content_batch')?.progress).toBe(100);
    expect(store.getProject('proj_q4_launch')!.progress).toBeGreaterThan(before);
  });

  it('nhắn tin cho nhân sự AI nhận phản hồi tiếng Việt', async () => {
    const { engine } = setup();
    const { reply } = await engine.sendMessage('agent_pm', 'Cho tôi biết tiến độ hiện tại');
    expect(reply.from).toBe('agent');
    expect(reply.text).toMatch(/công việc/);
  });
});

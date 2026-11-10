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
    for (let i = 0; i < 30; i++) await engine.tick();
    const reviewed = store.getTask(task.id)!;
    expect(['in_review', 'completed']).toContain(reviewed.status);
    if (reviewed.status === 'in_review') {
      const qa = store.getAgent('agent_qa')!;
      const reviewing = store.getSnapshot().tasks.filter((t) => t.status === 'in_review');
      expect(qa.location.kind).toBe('department');
      expect(reviewing.map((t) => t.departmentId)).toContain((qa.location as { departmentId: string }).departmentId);
      expect(reviewing.map((t) => t.id)).toContain(qa.currentTaskId);
    }
    // Kiểm định luôn đạt để kết quả xác định (MockBrain.reviewTask dùng Math.random để mô phỏng tỷ lệ đạt).
    const alwaysPass = new MockBrain();
    alwaysPass.reviewTask = async () => ({ passed: true, note: 'Đạt yêu cầu' });
    const engine2 = new OfficeEngine(store, { provider: alwaysPass, simulation: false, random: () => 0.1 });
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

describe('OfficeEngine – phản hồi review: đồng thời, hàng đợi, chế độ vận hành', () => {
  it('hai nhịp mô phỏng chồng nhau không chạy song song (chỉ một lần kiểm định cho cùng công việc)', async () => {
    const store = new OfficeStore(createSeedSnapshot());
    let reviews = 0;
    let release: (() => void) | undefined;
    const slow = new MockBrain();
    slow.reviewTask = () => {
      reviews += 1;
      return new Promise((r) => { release = () => r({ passed: true, note: 'ok' }); });
    };
    const engine = new OfficeEngine(store, { provider: slow, simulation: false, random: () => 0.01 });
    const first = engine.tick();
    const second = engine.tick(); // bị bỏ qua vì nhịp trước chưa xong
    release!();
    await Promise.all([first, second]);
    expect(reviews).toBe(1);
    expect(store.getTask('task_qa_landing')?.status).toBe('completed');
  });

  it('kiểm định không ghi đè khi công việc đã đổi trạng thái trong lúc chờ bộ não', async () => {
    const store = new OfficeStore(createSeedSnapshot());
    let release: (() => void) | undefined;
    const slow = new MockBrain();
    slow.reviewTask = () => new Promise((r) => { release = () => r({ passed: true, note: 'ok' }); });
    const engine = new OfficeEngine(store, { provider: slow, simulation: false, random: () => 0.01 });
    const task = store.getTask('task_qa_landing')!;
    expect(task.status).toBe('in_review');
    const pending = engine.tick();
    // Owner hoàn thành thủ công trong lúc QA đang chờ mô hình.
    engine.updateTask(task.id, { status: 'in_progress' });
    release!();
    await pending;
    expect(store.getTask(task.id)?.status).toBe('in_progress');
    expect(store.getSnapshot().activities.filter((a) => a.kind === 'review_passed' && a.taskId === task.id)).toHaveLength(0);
  });

  it('việc chờ vì hết chỗ được khởi động ở nhịp sau khi nhân sự rảnh', async () => {
    const { store, engine } = setup(() => 0.99);
    // Chuyên viên nội dung đã có 1 việc đang chạy trong seed; thêm 2 việc nữa → 1 việc phải chờ (giới hạn 2).
    engine.createTask({ title: 'Việc B', assigneeId: 'agent_spec_content' });
    const c = engine.createTask({ title: 'Việc C', assigneeId: 'agent_spec_content' });
    const { approval } = await engine.handleOwnerRequest('Lập kế hoạch nội dung video và bài viết cho tháng tới.');
    engine.decideApproval(approval!.id, 'approve');
    const waiting = store.getSnapshot().tasks.filter((t) => t.assigneeId === 'agent_spec_content' && t.status === 'pending' && t.stage === 'assign');
    expect(waiting.length).toBeGreaterThan(0);
    // Giải phóng chỗ bằng cách hoàn thành việc đang chạy.
    for (const t of store.getSnapshot().tasks.filter((x) => x.assigneeId === 'agent_spec_content' && x.status === 'in_progress')) {
      engine.updateTask(t.id, { status: 'completed' });
    }
    await engine.tick();
    const started = store.getSnapshot().tasks.filter((t) => waiting.some((w) => w.id === t.id) && t.status === 'in_progress');
    expect(started.length).toBeGreaterThan(0);
    void c;
  });

  it('việc con của kế hoạch chưa duyệt KHÔNG được khởi động dù nhân sự rảnh', async () => {
    const { store, engine } = setup(() => 0.99);
    const { planTask } = await engine.handleOwnerRequest('Chiến dịch quảng cáo mùa lễ hội.');
    await engine.tick();
    const children = store.getSnapshot().tasks.filter((t) => t.parentId === planTask.id);
    expect(children.every((t) => t.status === 'pending')).toBe(true);
  });

  it('chế độ Local không gọi mô hình đám mây', async () => {
    const store = new OfficeStore(createSeedSnapshot());
    let cloudCalls = 0;
    const cloud = new MockBrain();
    Object.defineProperty(cloud, 'mode', { value: 'cloud' });
    const originalReply = cloud.replyToOwner.bind(cloud);
    cloud.replyToOwner = (...args) => { cloudCalls += 1; return originalReply(...args); };
    const engine = new OfficeEngine(store, { provider: cloud, simulation: false });
    engine.updateSettings({ executionMode: 'local' });
    await engine.sendMessage('agent_pm', 'Tiến độ thế nào?');
    expect(cloudCalls).toBe(0);
    expect(engine.activeBrain()).not.toBe(cloud);
    engine.updateSettings({ executionMode: 'hybrid' });
    await engine.sendMessage('agent_pm', 'Tiến độ thế nào?');
    expect(cloudCalls).toBe(1);
  });
});

describe('OfficeEngine – vòng review 2: hàng đợi quá hạn, đọc lại công việc, giao việc, .env', () => {
  it('việc con quá hạn khi kế hoạch chưa duyệt vẫn được khởi động sau khi duyệt', async () => {
    const { store, engine } = setup(() => 0.99);
    const { planTask, approval } = await engine.handleOwnerRequest('Kế hoạch quảng cáo ngắn hạn.');
    // Đẩy hạn của mọi việc con về quá khứ rồi chạy một nhịp → chúng bị đánh dấu quá hạn.
    for (const c of store.getSnapshot().tasks.filter((t) => t.parentId === planTask.id)) {
      store.upsertTask({ ...c, dueAt: new Date(Date.now() - 3_600_000).toISOString() });
    }
    await engine.tick();
    const children = () => store.getSnapshot().tasks.filter((t) => t.parentId === planTask.id);
    expect(children().some((t) => t.status === 'overdue')).toBe(true);
    engine.decideApproval(approval!.id, 'approve');
    await engine.tick();
    expect(children().some((t) => t.status === 'in_progress')).toBe(true);
  });

  it('lệnh của Owner trong lúc chờ kiểm định không bị nhịp mô phỏng ghi đè', async () => {
    const store = new OfficeStore(createSeedSnapshot());
    let release: (() => void) | undefined;
    const slow = new MockBrain();
    slow.reviewTask = () => new Promise((r) => { release = () => r({ passed: true, note: 'ok' }); });
    const engine = new OfficeEngine(store, { provider: slow, simulation: false, random: () => 0.01 });
    const pending = engine.tick();
    engine.updateTask('task_crm_flow', { status: 'completed' });
    release!();
    await pending;
    expect(store.getTask('task_crm_flow')?.status).toBe('completed');
    expect(store.getTask('task_crm_flow')?.progress).toBe(100);
  });

  it('giao người phụ trách cho việc chưa bắt đầu đưa việc vào hàng đợi và được khởi động', async () => {
    const { store, engine } = setup(() => 0.99);
    // Không chọn người phụ trách → AI PM tự phân công và đưa vào hàng đợi (không còn ở giai đoạn receive).
    const task = engine.createTask({ title: 'Việc chưa có người phụ trách' });
    expect(task.assigneeId).toBeDefined();
    expect(task.stage).not.toBe('receive');
    // Owner đổi người phụ trách thủ công → việc vẫn trong hàng đợi và được khởi động.
    engine.updateTask(task.id, { assigneeId: 'agent_spec_data', status: 'not_started' });
    expect(store.getTask(task.id)?.stage).not.toBe('receive');
    await engine.tick();
    expect(store.getTask(task.id)?.status).toBe('in_progress');
  });
});

describe('OfficeEngine – vòng review 3: QA tạm dừng, đếm việc hoàn thành, dự án mở lại', () => {
  it('tạm dừng QA thì không kiểm định và không gọi bộ não', async () => {
    const store = new OfficeStore(createSeedSnapshot());
    let reviews = 0;
    const brain = new MockBrain();
    brain.reviewTask = async () => { reviews += 1; return { passed: true, note: 'ok' }; };
    const engine = new OfficeEngine(store, { provider: brain, simulation: false, random: () => 0.01 });
    engine.pauseAgent('agent_qa');
    await engine.tick();
    expect(reviews).toBe(0);
    expect(store.getTask('task_qa_landing')?.status).toBe('in_review');
    engine.resumeAgent('agent_qa');
    await engine.tick();
    expect(reviews).toBe(1);
  });

  it('hoàn thành thủ công cộng đúng một lần vào tasksCompleted của người phụ trách', () => {
    const { store, engine } = setup();
    const before = store.getAgent('agent_spec_content')!.tasksCompleted;
    const task = engine.createTask({ title: 'Bài viết giới thiệu', assigneeId: 'agent_spec_content' });
    engine.updateTask(task.id, { status: 'completed' });
    engine.updateTask(task.id, { status: 'completed' });
    expect(store.getAgent('agent_spec_content')!.tasksCompleted).toBe(before + 1);
  });

  it('dự án đã hoàn thành quay lại đang triển khai khi một việc được mở lại', () => {
    const { store, engine } = setup();
    const tasks = store.getSnapshot().tasks.filter((t) => t.projectId === 'proj_q4_launch');
    for (const t of tasks) if (t.status !== 'completed') engine.updateTask(t.id, { status: 'completed' });
    expect(store.getProject('proj_q4_launch')!.status).toBe('completed');
    engine.updateTask('task_content_batch', { status: 'in_progress' });
    expect(store.getProject('proj_q4_launch')!.status).toBe('active');
  });
});

describe('OfficeEngine – vòng review 4: kết nối phát sự kiện, QA tạm dừng xếp hàng, tự phân công', () => {
  it('duyệt cấp quyền kết nối phát sự kiện connectors.updated', () => {
    const { store, engine } = setup();
    const events: string[] = [];
    store.on('event', (e: { type: string }) => events.push(e.type));
    const appr = store.upsertApproval({ ...store.getApproval('appr_connector_webhook')!, id: 'appr_conn_2', status: 'pending', decidedAt: undefined });
    engine.decideApproval(appr.id, 'approve');
    expect(events).toContain('connectors.updated');
    expect(store.getSnapshot().connectors.find((c) => c.id === 'ollama_local')?.connected).toBe(true);
  });

  it('QA tạm dừng: việc đạt 100% xếp hàng kiểm định thay vì hoàn thành ngay', async () => {
    const { store, engine } = setup(() => 0.99);
    engine.pauseAgent('agent_qa');
    const task = engine.createTask({ title: 'Việc gần xong', assigneeId: 'agent_spec_content' });
    engine.updateTask(task.id, { progress: 99 });
    await engine.tick();
    expect(store.getTask(task.id)?.status).toBe('in_review');
    expect(store.getAgent('agent_qa')?.status).toBe('paused');
  });

  it('tạo việc không chọn người phụ trách → AI PM tự phân công theo nội dung', async () => {
    const { store, engine } = setup(() => 0.99);
    const task = engine.createTask({ title: 'Phân tích dữ liệu chuyển đổi tuần này và cập nhật báo cáo KPI' });
    expect(task.assigneeId).toBe('agent_spec_data');
    expect(task.departmentId).toBe('data_analytics');
    expect(task.requesterId).toBe('agent_pm');
    expect(['in_progress', 'pending']).toContain(task.status);
    await engine.tick();
    expect(store.getTask(task.id)?.status).not.toBe('not_started');
  });
});

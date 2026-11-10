import type {
  ActivityEvent,
  Agent,
  AgentLocation,
  AgentStatus,
  Approval,
  ChatMessage,
  CreateCeoRequestResponse,
  CreateTaskBody,
  DepartmentId,
  Task,
  TaskPriority,
  UpdateSettingsBody,
  UpdateTaskBody,
} from '@ads-nolimit/shared';
import { ApiError, notFound } from '../errors.js';
import { daysFromNow, newId, nowIso } from '../ids.js';
import type { OfficeStore } from '../store/OfficeStore.js';
import type { AgentBrain, BrainContext } from './brain.js';
import { MockBrain } from './providers/mock.js';

export interface OfficeEngineOptions {
  provider: AgentBrain;
  /** Bật mô phỏng tiến độ tự động (tắt trong kiểm thử để kết quả xác định). */
  simulation?: boolean;
  tickMs?: number;
  /** Hàm ngẫu nhiên có thể thay thế trong kiểm thử. */
  random?: () => number;
}

const OWNER_ID = 'owner';
const MAX_CONCURRENT_PER_AGENT = 2;

/** Mẫu công việc thường kỳ của công ty marketing (dữ liệu tiếng Việt do PM tạo – không phải bản dịch giao diện). */
const ROUTINE_TASKS: ReadonlyArray<{ title: string; description: string; departmentId: DepartmentId; priority: TaskPriority }> = [
  { title: 'Tối ưu bộ quảng cáo đang chạy theo chi phí trên mỗi khách hàng tiềm năng', description: 'Rà soát CPL (chi phí trên mỗi khách hàng tiềm năng) từng nhóm quảng cáo, tắt nhóm kém hiệu quả, tăng ngân sách nhóm tốt.', departmentId: 'marketing', priority: 'high' },
  { title: 'Soạn 5 bài đăng cho lịch nội dung tuần tới', description: 'Bám theo thông điệp chủ đạo của chiến dịch và hướng dẫn giọng điệu thương hiệu.', departmentId: 'creative_media', priority: 'medium' },
  { title: 'Phản hồi bình luận và tin nhắn khách hàng trên các kênh mạng xã hội', description: 'Phân loại câu hỏi, chuyển khách hàng tiềm năng sang CRM, ghi nhận phản hồi tiêu cực.', departmentId: 'social_community', priority: 'medium' },
  { title: 'Cập nhật bảng theo dõi KPI tuần và phát hiện bất thường', description: 'So sánh với tuần trước, đánh dấu chỉ số lệch trên 15% để báo cáo AI COO.', departmentId: 'data_analytics', priority: 'medium' },
  { title: 'Chấm điểm và phân loại khách hàng tiềm năng mới trong CRM', description: 'Áp dụng tiêu chí chấm điểm, giao khách hàng nóng cho kịch bản tư vấn.', departmentId: 'sales_crm', priority: 'high' },
  { title: 'Kiểm tra tình trạng các kết nối tự động và webhook', description: 'Chạy kiểm tra sức khỏe, xử lý lỗi đồng bộ, ghi nhật ký kỹ thuật.', departmentId: 'tech_automation', priority: 'low' },
  { title: 'Dựng kịch bản video ngắn giới thiệu dịch vụ mới', description: 'Kịch bản 30 giây, 3 phiên bản thông điệp để thử nghiệm A/B.', departmentId: 'creative_media', priority: 'medium' },
  { title: 'Phân tích đối thủ: thông điệp và ưu đãi trong tuần', description: 'Tổng hợp 5 đối thủ chính, đề xuất phản ứng cho chiến dịch hiện tại.', departmentId: 'marketing', priority: 'low' },
];

/**
 * ENGINE ĐIỀU PHỐI CÔNG TY AI.
 * Thực thi mô hình AI CEO và quy trình: Tiếp nhận → Lập kế hoạch → Phân công → Thực thi → Kiểm định → Báo cáo.
 * Mọi thay đổi đều đi qua OfficeStore → phát realtime → Dashboard, Sơ đồ tổ chức và Văn phòng 3D đồng bộ.
 */
export class OfficeEngine {
  private timer: NodeJS.Timeout | null = null;
  private tickCount = 0;
  /** Chặn hai nhịp mô phỏng chạy chồng khi bộ não AI phản hồi chậm hơn chu kỳ. */
  private ticking = false;
  /** Bộ não cục bộ dự phòng – dùng khi Owner chọn chế độ Local mà provider đang là đám mây. */
  private readonly localFallback: AgentBrain = new MockBrain();
  private readonly provider: AgentBrain;
  private readonly simulation: boolean;
  private readonly tickMs: number;
  private readonly random: () => number;

  constructor(
    private readonly store: OfficeStore,
    options: OfficeEngineOptions,
  ) {
    this.provider = options.provider;
    this.simulation = options.simulation ?? true;
    this.tickMs = options.tickMs ?? 5000;
    this.random = options.random ?? Math.random;
  }

  // ───────────────────────── Vòng đời ─────────────────────────
  start(): void {
    if (!this.simulation || this.timer) return;
    this.timer = setInterval(() => void this.tick(), this.tickMs);
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  get providerName(): string {
    return this.provider.name;
  }

  /**
   * Bộ não đang có hiệu lực theo Chế độ vận hành (Execution Mode) Owner đã chọn:
   * - local  → KHÔNG gọi mô hình đám mây; nếu provider là cloud thì dùng bộ não cục bộ dự phòng.
   * - cloud / hybrid → dùng provider đã cấu hình (tự quay về mock khi không khả dụng).
   * Đảm bảo lời hứa "không gửi dữ liệu ra ngoài ở chế độ Local" trong Cài đặt.
   */
  activeBrain(): AgentBrain {
    const mode = this.store.getSnapshot().company.executionMode;
    if (mode === 'local' && this.provider.mode === 'cloud') return this.localFallback;
    return this.provider;
  }

  // ───────────────────────── Lệnh từ Owner ─────────────────────────

  /** Owner giao yêu cầu cho AI CEO → kế hoạch + công việc con + yêu cầu phê duyệt. */
  async handleOwnerRequest(text: string, priority: TaskPriority = 'high'): Promise<CreateCeoRequestResponse> {
    const ceo = this.requireRoleAgent('ai_ceo');
    this.assertNotPaused(ceo);
    const pm = this.store.agentsByRole('ai_project_manager')[0] ?? ceo;

    const ownerMsg = this.store.addMessage({ id: newId('msg'), agentId: ceo.id, from: 'owner', text, createdAt: nowIso() });
    this.activity({ agentId: ceo.id, kind: 'owner_request', templateKey: 'owner_request', params: { agent: ceo.id } });

    // CEO và PM vào phòng họp trong lúc lập kế hoạch.
    this.setAgentState(ceo.id, { status: 'running', location: { kind: 'meeting_room' } });
    this.setAgentState(pm.id, { status: 'running', location: { kind: 'meeting_room' } });

    const draft = await this.activeBrain().planRequest({ text, priority }, this.brainContext());
    const now = nowIso();

    const project = this.store.upsertProject({
      id: newId('proj'),
      name: draft.title.replace(/^Kế hoạch:\s*/i, ''),
      objective: text,
      status: 'planning',
      ownerAgentId: ceo.id,
      departmentIds: Array.from(new Set(draft.subtasks.map((s) => s.departmentId))),
      progress: 0,
      startAt: now,
      endAt: daysFromNow(30),
    });

    const planTask = this.store.upsertTask({
      id: newId('task'),
      projectId: project.id,
      title: draft.title,
      description: `${draft.summary}\n\n${draft.outline.map((o, i) => `${i + 1}. ${o}`).join('\n')}`,
      status: draft.approvalRequired ? 'needs_approval' : 'in_progress',
      stage: 'plan',
      priority,
      assigneeId: ceo.id,
      requesterId: OWNER_ID,
      departmentId: 'executive',
      progress: 100,
      dueAt: daysFromNow(1),
      startedAt: now,
      createdAt: now,
      updatedAt: now,
      tags: ['kế hoạch'],
      focus: true,
    });
    this.activity({ agentId: ceo.id, taskId: planTask.id, kind: 'plan_created', templateKey: 'plan_created', params: { agent: ceo.id, title: planTask.title } });

    // PM phân rã công việc con, giao cho chuyên viên theo phòng ban.
    const children: Task[] = draft.subtasks.map((s, idx) => {
      const assignee = this.pickAssignee(s.departmentId, s.role ?? 'ai_specialist') ?? pm;
      return this.store.upsertTask({
        id: newId('task'),
        projectId: project.id,
        parentId: planTask.id,
        title: s.title,
        status: draft.approvalRequired ? 'pending' : 'not_started',
        stage: 'assign',
        priority: s.priority,
        assigneeId: assignee.id,
        requesterId: pm.id,
        departmentId: s.departmentId,
        progress: 0,
        dueAt: daysFromNow(3 + idx * 2),
        createdAt: now,
        updatedAt: now,
        tags: [],
      });
    });
    this.activity({ agentId: pm.id, taskId: planTask.id, kind: 'tasks_created', templateKey: 'tasks_created', params: { agent: pm.id, title: planTask.title, count: children.length } });

    let approval: Approval | undefined;
    if (draft.approvalRequired) {
      approval = this.store.upsertApproval({
        id: newId('appr'),
        type: 'plan',
        title: draft.approvalTitle,
        summary: draft.summary,
        requestedBy: ceo.id,
        taskId: planTask.id,
        projectId: project.id,
        status: 'pending',
        createdAt: now,
      });
      this.activity({ agentId: ceo.id, approvalId: approval.id, kind: 'approval_requested', templateKey: 'approval_requested', params: { agent: ceo.id, title: approval.title } });
    } else {
      this.startQueuedTasks(children.map((c) => c.id));
    }

    const reply = this.store.addMessage({
      id: newId('msg'),
      agentId: ceo.id,
      from: 'agent',
      text: draft.replyToOwner,
      createdAt: nowIso(),
      relatedTaskIds: [planTask.id, ...children.map((c) => c.id)],
    });
    this.activity({ agentId: ceo.id, kind: 'agent_message', templateKey: 'agent_message', params: { agent: ceo.id } });

    // Về bàn làm việc, cập nhật trạng thái theo khối lượng công việc.
    this.setAgentState(ceo.id, { location: { kind: 'desk' } });
    this.setAgentState(pm.id, { location: { kind: 'desk' } });
    this.refreshAgent(ceo.id);
    this.refreshAgent(pm.id);
    for (const c of children) if (c.assigneeId) this.refreshAgent(c.assigneeId);
    void ownerMsg;
    return { planTask, approval, reply };
  }

  createTask(body: CreateTaskBody): Task {
    const assignee = body.assigneeId ? this.requireAgent(body.assigneeId) : undefined;
    if (assignee) this.assertNotPaused(assignee);
    const departmentId: DepartmentId = body.departmentId ?? assignee?.departmentId ?? 'executive';
    const now = nowIso();
    const task = this.store.upsertTask({
      id: newId('task'),
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      status: assignee ? 'in_progress' : 'not_started',
      stage: assignee ? 'execute' : 'receive',
      priority: body.priority ?? 'medium',
      assigneeId: assignee?.id,
      requesterId: OWNER_ID,
      departmentId,
      progress: 0,
      dueAt: body.dueAt,
      startedAt: assignee ? now : undefined,
      createdAt: now,
      updatedAt: now,
      tags: [],
    });
    if (assignee) {
      this.activity({ agentId: assignee.id, taskId: task.id, kind: 'task_started', templateKey: 'task_started', params: { agent: assignee.id, title: task.title } });
      this.refreshAgent(assignee.id);
    }
    return task;
  }

  updateTask(taskId: string, patch: UpdateTaskBody): Task {
    const task = this.store.getTask(taskId);
    if (!task) throw notFound('Task', taskId);
    const next: Task = { ...task };
    if (patch.assigneeId !== undefined) {
      if (patch.assigneeId === null) {
        next.assigneeId = undefined;
      } else {
        const agent = this.requireAgent(patch.assigneeId);
        this.assertNotPaused(agent);
        next.assigneeId = agent.id;
        next.departmentId = agent.departmentId;
        // Việc mới được giao mà chưa bắt đầu → đưa vào hàng đợi phân công để nhịp mô phỏng khởi động.
        if (next.stage === 'receive' && (next.status === 'not_started' || next.status === 'pending')) next.stage = 'assign';
      }
    }
    if (patch.priority) next.priority = patch.priority;
    if (patch.focus !== undefined) next.focus = patch.focus;
    if (patch.dueAt !== undefined) next.dueAt = patch.dueAt ?? undefined;
    if (patch.progress !== undefined) next.progress = Math.max(0, Math.min(100, Math.round(patch.progress)));
    if (patch.status) this.applyStatus(next, patch.status);
    const saved = this.store.upsertTask(next);
    if (patch.status === 'completed' && task.status !== 'completed') this.creditCompletion(saved);
    if (patch.status === 'completed' && saved.assigneeId) {
      this.activity({ agentId: saved.assigneeId, taskId: saved.id, kind: 'task_completed', templateKey: 'task_completed', params: { agent: saved.assigneeId, title: saved.title } });
    } else if (patch.status === 'in_progress' && saved.assigneeId && task.status !== 'in_progress') {
      this.activity({ agentId: saved.assigneeId, taskId: saved.id, kind: 'task_started', templateKey: 'task_started', params: { agent: saved.assigneeId, title: saved.title } });
    }
    if (task.assigneeId && task.assigneeId !== saved.assigneeId) this.refreshAgent(task.assigneeId);
    if (saved.assigneeId) this.refreshAgent(saved.assigneeId);
    this.refreshProjectProgress(saved.projectId);
    return saved;
  }

  decideApproval(approvalId: string, decision: 'approve' | 'reject', note?: string): Approval {
    const approval = this.store.getApproval(approvalId);
    if (!approval) throw notFound('Approval', approvalId);
    if (approval.status !== 'pending') {
      throw new ApiError('approval_already_decided', `Approval "${approvalId}" is already ${approval.status}`);
    }
    const decided = this.store.upsertApproval({
      ...approval,
      status: decision === 'approve' ? 'approved' : 'rejected',
      decidedAt: nowIso(),
      decisionNote: note,
    });
    this.activity({
      agentId: approval.requestedBy,
      approvalId: approval.id,
      taskId: approval.taskId,
      kind: 'approval_decided',
      templateKey: decision === 'approve' ? 'approval_approved' : 'approval_rejected',
      params: { agent: approval.requestedBy, title: approval.title },
    });

    const task = approval.taskId ? this.store.getTask(approval.taskId) : undefined;
    if (decision === 'approve') {
      if (task) {
        if (approval.type === 'plan') {
          this.store.upsertTask({ ...task, status: 'completed', stage: 'assign', progress: 100, completedAt: nowIso() });
          const children = this.store.getSnapshot().tasks.filter((t) => t.parentId === task.id);
          this.startQueuedTasks(children.map((c) => c.id));
          if (task.projectId) {
            const project = this.store.getProject(task.projectId);
            if (project) this.store.upsertProject({ ...project, status: 'active' });
          }
        } else if (approval.type === 'connector') {
          this.store.upsertTask({ ...task, status: 'in_progress', stage: 'execute', startedAt: task.startedAt ?? nowIso() });
          const connectorIds = this.store.getAgent(task.assigneeId ?? '')?.connectorIds ?? [];
          const snapshot = this.store.getSnapshot();
          snapshot.connectors = snapshot.connectors.map((c) => (connectorIds.includes(c.id) ? { ...c, connected: true, lastSyncAt: nowIso() } : c));
        } else {
          const done = this.store.upsertTask({ ...task, status: 'completed', stage: 'report', progress: 100, completedAt: nowIso() });
          if (task.status !== 'completed') this.creditCompletion(done);
        }
      }
      this.notifyOwnerFromCeo(`Cảm ơn bạn đã duyệt "${approval.title}". Tôi đã kích hoạt các công việc liên quan và sẽ báo cáo tiến độ định kỳ.`);
    } else if (task) {
      this.store.upsertTask({ ...task, status: 'pending', stage: 'plan', focus: true });
      const children = this.store.getSnapshot().tasks.filter((t) => t.parentId === task.id);
      for (const c of children) this.store.upsertTask({ ...c, status: 'blocked' });
      this.notifyOwnerFromCeo(
        `Tôi đã ghi nhận việc từ chối "${approval.title}"${note ? ` với ghi chú: "${note}"` : ''}. Tôi sẽ điều chỉnh kế hoạch và gửi lại phương án mới để bạn xem xét.`,
      );
    }
    if (task?.assigneeId) this.refreshAgent(task.assigneeId);
    this.refreshAgent(approval.requestedBy);
    this.refreshProjectProgress(task?.projectId);
    return decided;
  }

  pauseAgent(agentId: string): Agent {
    const agent = this.requireAgent(agentId);
    const updated = this.store.upsertAgent({ ...agent, status: 'paused', currentTaskId: undefined, location: { kind: 'pantry' } });
    for (const t of this.store.getSnapshot().tasks) {
      if (t.assigneeId === agentId && t.status === 'in_progress') this.store.upsertTask({ ...t, status: 'pending' });
    }
    this.activity({ agentId, kind: 'agent_paused', templateKey: 'agent_paused', params: { agent: agentId } });
    return updated;
  }

  resumeAgent(agentId: string): Agent {
    const agent = this.requireAgent(agentId);
    this.store.upsertAgent({ ...agent, status: 'idle', location: { kind: 'desk' } });
    const queued = this.store
      .getSnapshot()
      .tasks.filter((t) => t.assigneeId === agentId && (t.status === 'pending' || t.status === 'overdue') && (t.stage === 'execute' || t.stage === 'assign') && !this.awaitsPlanApproval(t))
      .map((t) => t.id);
    this.startQueuedTasks(queued);
    this.activity({ agentId, kind: 'agent_resumed', templateKey: 'agent_resumed', params: { agent: agentId } });
    return this.refreshAgent(agentId);
  }

  async sendMessage(agentId: string, text: string): Promise<{ owner: ChatMessage; reply: ChatMessage }> {
    const agent = this.requireAgent(agentId);
    const owner = this.store.addMessage({ id: newId('msg'), agentId, from: 'owner', text, createdAt: nowIso() });
    const agentTasks = this.store.getSnapshot().tasks.filter((t) => t.assigneeId === agentId);
    const replyText =
      agent.status === 'paused'
        ? 'Tôi đang ở trạng thái tạm dừng (Paused) theo yêu cầu của bạn. Hãy chọn "Tiếp tục" để tôi quay lại xử lý công việc và trả lời chi tiết.'
        : await this.activeBrain().replyToOwner(agent, text, { ...this.brainContext(), agentTasks });
    const reply = this.store.addMessage({ id: newId('msg'), agentId, from: 'agent', text: replyText, createdAt: nowIso() });
    this.activity({ agentId, kind: 'agent_message', templateKey: 'agent_message', params: { agent: agentId } });
    return { owner, reply };
  }

  updateSettings(patch: UpdateSettingsBody) {
    return this.store.updateCompany({
      ...(patch.executionMode ? { executionMode: patch.executionMode } : {}),
      ...(patch.ownerName ? { ownerName: patch.ownerName } : {}),
      ...(patch.companyName ? { name: patch.companyName } : {}),
    });
  }

  // ───────────────────────── Mô phỏng tiến độ ─────────────────────────

  /** Một nhịp mô phỏng: chuyên viên tiến hành công việc, QA kiểm định, báo cáo hoàn tất. */
  async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    try {
      await this.runTick();
    } finally {
      this.ticking = false;
    }
  }

  private async runTick(): Promise<void> {
    this.tickCount += 1;
    const snapshot = this.store.getSnapshot();
    const now = Date.now();

    // Đọc lại từng công việc theo id ở mỗi vòng: lệnh của Owner có thể đã thay đổi nó trong lúc chờ bộ não kiểm định.
    for (const taskId of snapshot.tasks.map((t) => t.id)) {
      const task = this.store.getTask(taskId);
      if (!task) continue;
      if (task.status === 'in_progress' && task.assigneeId) {
        const agent = this.store.getAgent(task.assigneeId);
        if (!agent || agent.status === 'paused' || agent.status === 'error') continue;
        // Bước tiến chậm (1–4%/nhịp) để văn phòng luôn có việc đang chạy; ưu tiên cao nhanh hơn một chút.
        const step = 1 + Math.floor(this.random() * (task.priority === 'high' ? 4 : 3));
        const progress = Math.min(100, task.progress + step);
        if (progress >= 100) {
          this.moveToReview(task);
        } else {
          const updated = this.store.upsertTask({ ...task, progress, stage: 'execute' });
          if (this.tickCount % 12 === 0 && this.random() < 0.3) {
            this.activity({ agentId: agent.id, taskId: task.id, kind: 'task_progress', templateKey: 'task_progress', params: { agent: agent.id, title: updated.title, progress } });
          }
        }
      } else if (task.status === 'in_review') {
        // Chỉ kiểm định khi có QA Reviewer sẵn sàng – tạm dừng QA thì việc kiểm định cũng dừng.
        const qaAvailable = this.store.agentsByRole('ai_qa_reviewer').some((a) => a.status !== 'paused' && a.status !== 'error');
        if (qaAvailable && this.random() < 0.12) await this.completeReview(task);
      } else if (task.status !== 'completed' && task.dueAt && new Date(task.dueAt).getTime() < now && task.status !== 'overdue' && task.status !== 'needs_approval' && task.status !== 'blocked') {
        this.store.upsertTask({ ...task, status: 'overdue' });
      }
    }

    // Khởi động công việc đang xếp hàng khi chuyên viên rảnh.
    // Khởi động việc đang xếp hàng: chưa bắt đầu, hoặc đang chờ vì hết chỗ (pending/assign) nhưng kế hoạch cha đã được duyệt.
    const queued = this.store
      .getSnapshot()
      .tasks.filter(
        (t) =>
          t.assigneeId &&
          t.stage !== 'receive' &&
          (t.status === 'not_started' ||
            ((t.status === 'pending' || t.status === 'overdue') &&
              (t.stage === 'assign' || t.stage === 'execute') &&
              !this.awaitsPlanApproval(t))),
      );
    this.startQueuedTasks(queued.map((t) => t.id));

    this.generateRoutineWork();

    for (const agent of this.store.getSnapshot().agents) this.refreshAgent(agent.id);
    for (const project of this.store.getSnapshot().projects) this.refreshProjectProgress(project.id);
  }

  /**
   * Sinh công việc thường kỳ khi khối lượng việc đang chạy xuống thấp – mô phỏng một công ty
   * marketing luôn có việc (lịch đăng, tối ưu quảng cáo, báo cáo tuần…). Chỉ chạy ở chế độ mô phỏng,
   * tối đa một việc mỗi 12 nhịp (~1 phút) và chỉ khi còn dưới 3 việc đang thực hiện.
   */
  private generateRoutineWork(): void {
    if (!this.simulation || this.tickCount % 12 !== 0) return;
    const tasks = this.store.getSnapshot().tasks;
    const running = tasks.filter((t) => t.status === 'in_progress').length;
    if (running >= 3) return;
    const pm = this.store.agentsByRole('ai_project_manager').find((a) => a.status !== 'paused');
    if (!pm) return;
    const template = ROUTINE_TASKS[Math.floor(this.random() * ROUTINE_TASKS.length)]!;
    if (tasks.some((t) => t.title === template.title && t.status !== 'completed')) return;
    const assignee = this.pickAssignee(template.departmentId, 'ai_specialist');
    if (!assignee) return;
    const now = nowIso();
    const task = this.store.upsertTask({
      id: newId('task'),
      title: template.title,
      description: template.description,
      status: 'not_started',
      stage: 'assign',
      priority: template.priority,
      assigneeId: assignee.id,
      requesterId: pm.id,
      departmentId: template.departmentId,
      progress: 0,
      dueAt: daysFromNow(2 + Math.floor(this.random() * 5)),
      createdAt: now,
      updatedAt: now,
      tags: ['thường kỳ'],
    });
    this.activity({ agentId: pm.id, taskId: task.id, kind: 'tasks_created', templateKey: 'tasks_created', params: { agent: pm.id, title: task.title, count: 1 } });
  }

  private moveToReview(task: Task): void {
    const qa = this.store.agentsByRole('ai_qa_reviewer').find((a) => a.status !== 'paused');
    const updated = this.store.upsertTask({ ...task, progress: 100, status: qa ? 'in_review' : 'completed', stage: qa ? 'review' : 'report', completedAt: qa ? undefined : nowIso() });
    if (task.assigneeId) {
      this.activity({ agentId: task.assigneeId, taskId: task.id, kind: 'task_completed', templateKey: 'task_completed', params: { agent: task.assigneeId, title: updated.title } });
    }
    if (qa) {
      // QA đi tới phòng ban của công việc để kiểm định – văn phòng 3D hiển thị di chuyển này.
      this.setAgentState(qa.id, { status: 'running', currentTaskId: task.id, location: { kind: 'department', departmentId: task.departmentId } });
    }
  }

  private async completeReview(task: Task): Promise<void> {
    const qa = this.store.agentsByRole('ai_qa_reviewer')[0];
    const verdict = await this.activeBrain().reviewTask(task, this.brainContext());
    // Kiểm tra lại trạng thái sau khi chờ bộ não: công việc có thể đã được xử lý/đổi bởi lệnh khác.
    const current = this.store.getTask(task.id);
    if (!current || current.status !== 'in_review') return;
    task = current;
    if (verdict.passed) {
      const done = this.store.upsertTask({ ...task, status: 'completed', stage: 'report', progress: 100, completedAt: nowIso() });
      if (qa) this.activity({ agentId: qa.id, taskId: task.id, kind: 'review_passed', templateKey: 'review_passed', params: { agent: qa.id, title: done.title } });
      this.creditCompletion(done);
    } else {
      const redo = this.store.upsertTask({ ...task, status: 'in_progress', stage: 'execute', progress: Math.max(40, task.progress - 35) });
      if (qa) this.activity({ agentId: qa.id, taskId: task.id, kind: 'review_failed', templateKey: 'review_failed', params: { agent: qa.id, title: redo.title } });
    }
    if (qa) {
      const stillReviewing = this.store.getSnapshot().tasks.find((t) => t.status === 'in_review' && t.id !== task.id);
      this.setAgentState(qa.id, {
        currentTaskId: stillReviewing?.id,
        location: stillReviewing ? { kind: 'department', departmentId: stillReviewing.departmentId } : { kind: 'desk' },
      });
      this.refreshAgent(qa.id);
    }
  }

  /** Đưa công việc đang chờ vào thực thi, tối đa MAX_CONCURRENT_PER_AGENT mỗi nhân sự. */
  private startQueuedTasks(taskIds: string[]): void {
    for (const id of taskIds) {
      const task = this.store.getTask(id);
      if (!task || !task.assigneeId) continue;
      // Việc quá hạn mà chưa chạy vẫn được khởi động (độ trễ thể hiện qua dueAt), không bị kẹt vĩnh viễn.
      if (!['not_started', 'pending', 'overdue'].includes(task.status)) continue;
      const agent = this.store.getAgent(task.assigneeId);
      if (!agent || agent.status === 'paused' || agent.status === 'error') continue;
      const running = this.store.getSnapshot().tasks.filter((t) => t.assigneeId === agent.id && t.status === 'in_progress').length;
      if (running >= MAX_CONCURRENT_PER_AGENT) {
        if (task.status === 'not_started') this.store.upsertTask({ ...task, status: 'pending', stage: 'assign' });
        continue;
      }
      const started = this.store.upsertTask({ ...task, status: 'in_progress', stage: 'execute', startedAt: task.startedAt ?? nowIso() });
      this.activity({ agentId: agent.id, taskId: started.id, kind: 'task_started', templateKey: 'task_started', params: { agent: agent.id, title: started.title } });
      this.refreshAgent(agent.id);
    }
  }

  // ───────────────────────── Trạng thái nhân sự ─────────────────────────

  /** Suy ra trạng thái & công việc hiện tại của nhân sự từ dữ liệu công việc (nguồn duy nhất). */
  refreshAgent(agentId: string): Agent {
    const agent = this.requireAgent(agentId);
    if (agent.status === 'paused' || agent.status === 'error') return agent;
    const tasks = this.store.getSnapshot().tasks.filter((t) => t.assigneeId === agentId);
    const running = tasks.find((t) => t.status === 'in_progress');
    const reviewing = agent.role === 'ai_qa_reviewer' ? this.store.getSnapshot().tasks.find((t) => t.status === 'in_review') : undefined;
    const waiting = tasks.find((t) => t.status === 'needs_approval' || t.status === 'pending' || t.status === 'blocked');
    let status: AgentStatus;
    let currentTaskId: string | undefined;
    if (running) {
      status = 'running';
      currentTaskId = running.id;
    } else if (reviewing) {
      status = 'running';
      currentTaskId = reviewing.id;
    } else if (waiting) {
      status = 'waiting';
      currentTaskId = waiting.id;
    } else if (agent.role === 'ai_ceo' || agent.role === 'ai_coo' || agent.role === 'ai_project_manager') {
      status = 'active';
    } else {
      status = 'idle';
    }
    const location: AgentLocation = agent.location.kind === 'meeting_room' || agent.location.kind === 'department' ? agent.location : { kind: 'desk' };
    if (status === agent.status && currentTaskId === agent.currentTaskId && location.kind === agent.location.kind) return agent;
    return this.store.upsertAgent({ ...agent, status, currentTaskId, location });
  }

  private setAgentState(agentId: string, patch: Partial<Pick<Agent, 'status' | 'currentTaskId' | 'location'>>): void {
    const agent = this.store.getAgent(agentId);
    if (!agent) return;
    if (agent.status === 'paused' && patch.status && patch.status !== 'paused') return;
    this.store.upsertAgent({ ...agent, ...patch });
  }

  private refreshProjectProgress(projectId?: string): void {
    if (!projectId) return;
    const project = this.store.getProject(projectId);
    if (!project) return;
    const tasks = this.store.getSnapshot().tasks.filter((t) => t.projectId === projectId);
    if (!tasks.length) return;
    const progress = Math.round(tasks.reduce((sum, t) => sum + (t.status === 'completed' ? 100 : t.progress), 0) / tasks.length);
    const allDone = tasks.every((t) => t.status === 'completed');
    // Dự án đã hoàn thành nhưng có việc được mở lại → quay về đang triển khai.
    const status = allDone
      ? 'completed'
      : project.status === 'completed' || (project.status === 'planning' && tasks.some((t) => t.status === 'in_progress'))
        ? 'active'
        : project.status;
    if (progress !== project.progress || status !== project.status) this.store.upsertProject({ ...project, progress, status });
  }

  // ───────────────────────── Tiện ích ─────────────────────────

  private applyStatus(task: Task, status: Task['status']): void {
    task.status = status;
    const now = nowIso();
    switch (status) {
      case 'in_progress':
        task.stage = task.stage === 'review' ? 'execute' : task.stage === 'receive' || task.stage === 'plan' || task.stage === 'assign' ? 'execute' : task.stage;
        task.startedAt = task.startedAt ?? now;
        task.completedAt = undefined;
        break;
      case 'completed':
        task.progress = 100;
        task.stage = 'report';
        task.completedAt = now;
        break;
      case 'in_review':
        task.stage = 'review';
        break;
      case 'not_started':
        task.progress = 0;
        task.completedAt = undefined;
        break;
      default:
        break;
    }
  }

  /** Cộng một việc hoàn thành cho người phụ trách (gọi đúng một lần tại thời điểm chuyển sang completed). */
  private creditCompletion(task: Task): void {
    if (!task.assigneeId) return;
    const assignee = this.store.getAgent(task.assigneeId);
    if (assignee) this.store.upsertAgent({ ...assignee, tasksCompleted: assignee.tasksCompleted + 1 });
  }

  /** Công việc con còn chờ Owner duyệt kế hoạch cha thì chưa được khởi động. */
  private awaitsPlanApproval(task: Task): boolean {
    if (!task.parentId) return false;
    const parent = this.store.getTask(task.parentId);
    return !!parent && (parent.status === 'needs_approval' || parent.status === 'pending' || parent.status === 'blocked');
  }

  private pickAssignee(departmentId: DepartmentId, role: Agent['role']): Agent | undefined {
    const agents = this.store.getSnapshot().agents.filter((a) => a.status !== 'paused' && a.status !== 'error');
    const byDept = agents.filter((a) => a.departmentId === departmentId && a.role === role);
    if (byDept.length) return this.leastLoaded(byDept);
    const byRole = agents.filter((a) => a.role === role);
    if (byRole.length) return this.leastLoaded(byRole);
    return agents.find((a) => a.departmentId === departmentId);
  }

  private leastLoaded(agents: Agent[]): Agent {
    const tasks = this.store.getSnapshot().tasks;
    const load = (a: Agent) => tasks.filter((t) => t.assigneeId === a.id && t.status !== 'completed').length;
    return [...agents].sort((a, b) => load(a) - load(b))[0]!;
  }

  private notifyOwnerFromCeo(text: string): void {
    const ceo = this.store.agentsByRole('ai_ceo')[0];
    if (!ceo) return;
    this.store.addMessage({ id: newId('msg'), agentId: ceo.id, from: 'agent', text, createdAt: nowIso() });
  }

  private activity(partial: Omit<ActivityEvent, 'id' | 'createdAt'>): ActivityEvent {
    return this.store.addActivity({ id: newId('act'), createdAt: nowIso(), ...partial });
  }

  private brainContext(): BrainContext {
    const s = this.store.getSnapshot();
    return { departments: s.departments, agents: s.agents, tasks: s.tasks, companyName: s.company.name };
  }

  private requireAgent(id: string): Agent {
    const agent = this.store.getAgent(id);
    if (!agent) throw notFound('Agent', id);
    return agent;
  }

  private requireRoleAgent(role: Agent['role']): Agent {
    const agent = this.store.agentsByRole(role)[0];
    if (!agent) throw new ApiError('not_found', `No agent with role "${role}"`);
    return agent;
  }

  private assertNotPaused(agent: Agent): void {
    if (agent.status === 'paused') throw new ApiError('agent_paused', `Agent "${agent.id}" is paused`);
  }
}

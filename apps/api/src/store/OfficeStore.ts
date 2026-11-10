import { EventEmitter } from 'node:events';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  ActivityEvent,
  Agent,
  Approval,
  ChatMessage,
  CompanyInfo,
  Connector,
  KpiSummary,
  OfficeEvent,
  OfficeSnapshot,
  Project,
  Task,
} from '@ads-nolimit/shared';
import { nowIso } from '../ids.js';

/**
 * NGUỒN DỮ LIỆU DUY NHẤT phía backend (Local Runtime).
 * Mọi thay đổi đi qua các phương thức upsert* để: tăng revision, cập nhật updatedAt,
 * phát sự kiện realtime và lưu xuống đĩa (debounce). Không module nào sửa snapshot trực tiếp.
 */
export interface OfficeStoreOptions {
  persistPath?: string;
  persistDebounceMs?: number;
}

export class OfficeStore extends EventEmitter {
  private snapshot: OfficeSnapshot;
  private persistTimer: NodeJS.Timeout | null = null;
  private readonly persistPath: string | undefined;
  private readonly persistDebounceMs: number;

  constructor(initial: OfficeSnapshot, options: OfficeStoreOptions = {}) {
    super();
    this.snapshot = initial;
    this.persistPath = options.persistPath;
    this.persistDebounceMs = options.persistDebounceMs ?? 400;
  }

  static loadOrSeed(seed: () => OfficeSnapshot, persistPath?: string, reset = false): OfficeStore {
    if (persistPath && !reset && existsSync(persistPath)) {
      try {
        const raw = JSON.parse(readFileSync(persistPath, 'utf8')) as OfficeSnapshot;
        if (raw && Array.isArray(raw.agents) && Array.isArray(raw.tasks)) {
          return new OfficeStore(raw, { persistPath });
        }
      } catch {
        /* file hỏng → dựng lại từ seed */
      }
    }
    return new OfficeStore(seed(), { persistPath });
  }

  getSnapshot(): OfficeSnapshot {
    return this.snapshot;
  }

  get revision(): number {
    return this.snapshot.revision;
  }

  // ───────────── Truy vấn ─────────────
  getAgent(id: string): Agent | undefined {
    return this.snapshot.agents.find((a) => a.id === id);
  }
  getTask(id: string): Task | undefined {
    return this.snapshot.tasks.find((t) => t.id === id);
  }
  getApproval(id: string): Approval | undefined {
    return this.snapshot.approvals.find((a) => a.id === id);
  }
  getProject(id: string): Project | undefined {
    return this.snapshot.projects.find((p) => p.id === id);
  }
  agentsByRole(role: Agent['role']): Agent[] {
    return this.snapshot.agents.filter((a) => a.role === role);
  }

  // ───────────── Ghi (đều phát sự kiện) ─────────────
  upsertTask(task: Task): Task {
    const next = { ...task, updatedAt: nowIso() };
    this.snapshot.tasks = upsert(this.snapshot.tasks, next);
    this.commit({ type: 'task.upserted', task: next, revision: 0 });
    return next;
  }

  removeTask(taskId: string): void {
    this.snapshot.tasks = this.snapshot.tasks.filter((t) => t.id !== taskId);
    this.commit({ type: 'task.removed', taskId, revision: 0 });
  }

  upsertAgent(agent: Agent): Agent {
    const next = { ...agent, updatedAt: nowIso() };
    this.snapshot.agents = upsert(this.snapshot.agents, next);
    this.commit({ type: 'agent.upserted', agent: next, revision: 0 });
    return next;
  }

  upsertApproval(approval: Approval): Approval {
    this.snapshot.approvals = upsert(this.snapshot.approvals, approval);
    this.commit({ type: 'approval.upserted', approval, revision: 0 });
    return approval;
  }

  addActivity(activity: ActivityEvent): ActivityEvent {
    this.snapshot.activities = [activity, ...this.snapshot.activities].slice(0, 500);
    this.commit({ type: 'activity.created', activity, revision: 0 });
    return activity;
  }

  upsertProject(project: Project): Project {
    this.snapshot.projects = upsert(this.snapshot.projects, project);
    this.commit({ type: 'project.upserted', project, revision: 0 });
    return project;
  }

  setKpis(kpis: KpiSummary): void {
    this.snapshot.kpis = kpis;
    this.commit({ type: 'kpi.updated', kpis, revision: 0 });
  }

  setConnectors(connectors: Connector[]): void {
    this.snapshot.connectors = connectors;
    this.commit({ type: 'connectors.updated', connectors, revision: 0 });
  }

  addMessage(message: ChatMessage): ChatMessage {
    this.snapshot.messages = [...this.snapshot.messages, message].slice(-1000);
    this.commit({ type: 'message.created', message, revision: 0 });
    return message;
  }

  updateCompany(patch: Partial<CompanyInfo>): CompanyInfo {
    this.snapshot.company = { ...this.snapshot.company, ...patch };
    this.bump();
    this.emit('event', { type: 'snapshot', snapshot: this.snapshot } satisfies OfficeEvent);
    this.schedulePersist();
    return this.snapshot.company;
  }

  /** Thay toàn bộ snapshot (vd: đặt lại dữ liệu mẫu). */
  replace(snapshot: OfficeSnapshot): void {
    this.snapshot = { ...snapshot, revision: this.snapshot.revision + 1, updatedAt: nowIso() };
    this.emit('event', { type: 'snapshot', snapshot: this.snapshot } satisfies OfficeEvent);
    this.schedulePersist();
  }

  // ───────────── Nội bộ ─────────────
  private bump(): number {
    this.snapshot.revision += 1;
    this.snapshot.updatedAt = nowIso();
    return this.snapshot.revision;
  }

  private commit(event: Exclude<OfficeEvent, { type: 'snapshot' }>): void {
    const revision = this.bump();
    this.emit('event', { ...event, revision } as OfficeEvent);
    this.schedulePersist();
  }

  private schedulePersist(): void {
    if (!this.persistPath) return;
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => this.persistNow(), this.persistDebounceMs);
  }

  persistNow(): void {
    if (!this.persistPath) return;
    try {
      mkdirSync(dirname(this.persistPath), { recursive: true });
      writeFileSync(this.persistPath, JSON.stringify(this.snapshot, null, 2), 'utf8');
    } catch (err) {
      this.emit('persist_error', err);
    }
  }
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const copy = list.slice();
  copy[idx] = item;
  return copy;
}

import type { Agent, Task, TaskPriority } from '@ads-nolimit/shared';
import { DEPARTMENT_IDS } from '@ads-nolimit/shared';
import type { AgentBrain, BrainContext, PlanDraft, ReviewVerdict } from '../brain.js';
import { MockBrain } from './mock.js';

/** Giao diện tối thiểu của một mô hình ngôn ngữ (cục bộ hoặc đám mây). */
export interface LlmClient {
  readonly name: string;
  readonly mode: 'local' | 'cloud';
  complete(system: string, prompt: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}

const SYSTEM_VI = `Bạn là nhân sự AI của công ty ADS-NOLIMIT (Truyền thông & Marketing). Luôn trả lời Owner bằng tiếng Việt.
Khi dùng thuật ngữ chuyên ngành tiếng Anh, hãy kèm nghĩa tiếng Việt trong ngoặc, ví dụ: KPI (chỉ số đánh giá hiệu suất).
Không dịch định danh kỹ thuật (departmentId, role, id, JSON keys). Khi được yêu cầu JSON, chỉ trả về JSON hợp lệ, không giải thích thêm.`;

function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in model output');
  return JSON.parse(text.slice(start, end + 1));
}

/**
 * Bộ não dùng mô hình ngôn ngữ thật; tự động quay về MockBrain khi mô hình không khả dụng
 * hoặc đầu ra không hợp lệ – đảm bảo hệ thống luôn vận hành (Hybrid Local + Cloud).
 */
export class LlmBrain implements AgentBrain {
  readonly name: string;
  readonly mode: 'local' | 'cloud' | 'hybrid';
  private readonly fallback: AgentBrain = new MockBrain();

  constructor(private readonly client: LlmClient) {
    this.name = client.name;
    this.mode = client.mode;
  }

  isAvailable(): Promise<boolean> {
    return this.client.isAvailable();
  }

  async planRequest(input: { text: string; priority: TaskPriority }, ctx: BrainContext): Promise<PlanDraft> {
    const draft = await this.fallback.planRequest(input, ctx);
    try {
      const prompt = `Yêu cầu của Owner: """${input.text}"""
Mức ưu tiên: ${input.priority}. Các phòng ban hợp lệ (departmentId): ${DEPARTMENT_IDS.join(', ')}.
Hãy lập kế hoạch và trả về JSON theo đúng cấu trúc:
{"title": string, "summary": string, "outline": string[], "subtasks": [{"title": string, "departmentId": string, "priority": "high"|"medium"|"low", "estimateHours": number}], "replyToOwner": string}
Tối đa 8 subtasks; luôn có một công việc kiểm định chất lượng với departmentId "strategy".`;
      const raw = await this.client.complete(SYSTEM_VI, prompt);
      const json = extractJson(raw) as Partial<PlanDraft>;
      const subtasks = Array.isArray(json.subtasks)
        ? json.subtasks
            .filter((s) => s && typeof s.title === 'string' && (DEPARTMENT_IDS as readonly string[]).includes(String(s.departmentId)))
            .slice(0, 8)
            .map((s) => ({
              title: s.title,
              departmentId: s.departmentId,
              priority: (['high', 'medium', 'low'] as const).includes(s.priority as never) ? s.priority : input.priority,
              estimateHours: typeof s.estimateHours === 'number' ? s.estimateHours : undefined,
              role: s.departmentId === 'strategy' ? ('ai_qa_reviewer' as const) : undefined,
            }))
        : [];
      if (!subtasks.length) return draft;
      return {
        ...draft,
        title: typeof json.title === 'string' && json.title.trim() ? json.title.trim() : draft.title,
        summary: typeof json.summary === 'string' ? json.summary : draft.summary,
        outline: Array.isArray(json.outline) && json.outline.length ? json.outline.map(String) : draft.outline,
        subtasks,
        replyToOwner: typeof json.replyToOwner === 'string' ? json.replyToOwner : draft.replyToOwner,
      };
    } catch {
      return draft;
    }
  }

  async replyToOwner(agent: Agent, text: string, ctx: BrainContext & { agentTasks: Task[] }): Promise<string> {
    try {
      const taskLines = ctx.agentTasks
        .slice(0, 8)
        .map((t) => `- [${t.status}] ${t.title} (${t.progress}%)`)
        .join('\n');
      const prompt = `Bạn đang đóng vai ${agent.role}${agent.displayName ? ` tên "${agent.displayName}"` : ''}.
Công việc bạn phụ trách:\n${taskLines || '- (chưa có)'}\n
Owner nhắn: """${text}"""\nHãy trả lời ngắn gọn (tối đa 120 từ) bằng tiếng Việt.`;
      const raw = await this.client.complete(SYSTEM_VI, prompt);
      return raw.trim() || (await this.fallback.replyToOwner(agent, text, ctx));
    } catch {
      return this.fallback.replyToOwner(agent, text, ctx);
    }
  }

  async reviewTask(task: Task, ctx: BrainContext): Promise<ReviewVerdict> {
    try {
      const prompt = `Đánh giá chất lượng công việc: "${task.title}". Mô tả: ${task.description ?? '(không có)'}.
Trả về JSON: {"passed": boolean, "note": string} với note bằng tiếng Việt.`;
      const raw = await this.client.complete(SYSTEM_VI, prompt);
      const json = extractJson(raw) as Partial<ReviewVerdict>;
      if (typeof json.passed === 'boolean') return { passed: json.passed, note: String(json.note ?? '') };
      return this.fallback.reviewTask(task, ctx);
    } catch {
      return this.fallback.reviewTask(task, ctx);
    }
  }
}

/** Mô hình cục bộ qua Ollama (http://localhost:11434). */
export class OllamaClient implements LlmClient {
  readonly name = 'ollama';
  readonly mode = 'local' as const;
  constructor(
    private readonly baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
    private readonly model = process.env.OLLAMA_MODEL ?? 'qwen2.5:14b',
  ) {}

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async complete(system: string, prompt: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, system, prompt, stream: false }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = (await res.json()) as { response?: string };
    return data.response ?? '';
  }
}

import type { Agent, DepartmentId, Task, TaskPriority } from '@ads-nolimit/shared';
import type { AgentBrain, BrainContext, PlanDraft, PlanSubtaskDraft, ReviewVerdict } from '../brain.js';

/**
 * Bộ não mô phỏng (không cần mô hình AI thật) – dùng cho phát triển, demo, kiểm thử.
 * Sinh kế hoạch và phản hồi tiếng Việt theo mẫu, định tuyến phòng ban theo từ khóa.
 */
const KEYWORDS: Array<{ dept: DepartmentId; words: string[] }> = [
  { dept: 'marketing', words: ['quảng cáo', 'ads', 'marketing', 'tiếp thị', 'khách hàng tiềm năng', 'lead', 'chiến dịch', 'google', 'facebook', 'tiktok'] },
  { dept: 'creative_media', words: ['nội dung', 'video', 'bài viết', 'thiết kế', 'hình ảnh', 'kịch bản', 'content', 'media', 'thương hiệu'] },
  { dept: 'social_community', words: ['cộng đồng', 'fanpage', 'zalo', 'mạng xã hội', 'bình luận', 'tin nhắn', 'social', 'cskh'] },
  { dept: 'data_analytics', words: ['dữ liệu', 'phân tích', 'báo cáo', 'đo lường', 'kpi', 'chuyển đổi', 'analytics', 'thống kê'] },
  { dept: 'sales_crm', words: ['bán hàng', 'crm', 'khách hàng', 'chốt', 'doanh thu', 'tư vấn', 'báo giá', 'kinh doanh'] },
  { dept: 'tech_automation', words: ['tự động', 'webhook', 'kết nối', 'tích hợp', 'api', 'kỹ thuật', 'hệ thống', 'website', 'landing'] },
];

function detectDepartments(text: string): DepartmentId[] {
  const lower = text.toLowerCase();
  const hits = KEYWORDS.filter((k) => k.words.some((w) => lower.includes(w))).map((k) => k.dept);
  return hits.length ? Array.from(new Set(hits)) : ['marketing', 'creative_media'];
}

function extractDays(text: string): number | undefined {
  const m = text.match(/(\d{1,3})\s*(ngày|day)/i);
  return m ? Number(m[1]) : undefined;
}

function extractTargetPct(text: string): number | undefined {
  const m = text.match(/(\d{1,3})\s*%/);
  return m ? Number(m[1]) : undefined;
}

function shortTitle(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const firstClause = cleaned.split(/[.,;:!?]/)[0] ?? cleaned;
  const t = firstClause.length > 90 ? `${firstClause.slice(0, 87)}…` : firstClause;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export class MockBrain implements AgentBrain {
  readonly name = 'mock';
  readonly mode = 'local' as const;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async planRequest(input: { text: string; priority: TaskPriority }, ctx: BrainContext): Promise<PlanDraft> {
    const depts = detectDepartments(input.text);
    const days = extractDays(input.text);
    const target = extractTargetPct(input.text);
    const horizon = days ? `${days} ngày` : 'theo giai đoạn';
    const title = `Kế hoạch: ${shortTitle(input.text)}`;

    const subtasks: PlanSubtaskDraft[] = [
      { title: 'Phân tích thị trường và xác định khách hàng mục tiêu', departmentId: 'marketing', priority: 'high', estimateHours: 6 },
    ];
    if (depts.includes('creative_media') || depts.includes('marketing')) {
      subtasks.push({ title: 'Xây dựng thông điệp chủ đạo và bộ nội dung khởi động', departmentId: 'creative_media', priority: input.priority, estimateHours: 10 });
    }
    if (depts.includes('marketing')) {
      subtasks.push({ title: 'Thiết lập chiến dịch quảng cáo đa kênh và ngân sách theo tuần', departmentId: 'marketing', priority: 'high', estimateHours: 8 });
    }
    if (depts.includes('social_community')) {
      subtasks.push({ title: 'Lên lịch đăng và kịch bản tương tác cộng đồng', departmentId: 'social_community', priority: 'medium', estimateHours: 6 });
    }
    if (depts.includes('sales_crm')) {
      subtasks.push({ title: 'Thiết kế quy trình tiếp nhận và chăm sóc khách hàng tiềm năng', departmentId: 'sales_crm', priority: 'medium', estimateHours: 6 });
    }
    if (depts.includes('tech_automation')) {
      subtasks.push({ title: 'Kết nối hệ thống và tự động hóa luồng dữ liệu', departmentId: 'tech_automation', priority: 'medium', estimateHours: 8 });
    }
    subtasks.push({ title: 'Thiết lập đo lường KPI và bảng theo dõi tiến độ', departmentId: 'data_analytics', priority: 'medium', estimateHours: 4 });
    subtasks.push({ title: 'Kiểm định chất lượng đầu ra trước khi triển khai', departmentId: 'strategy', priority: 'high', role: 'ai_qa_reviewer', estimateHours: 3 });

    const outline = [
      'Phân tích thị trường và khách hàng mục tiêu',
      'Chiến lược nội dung và thông điệp',
      `Chiến dịch triển khai đa kênh (${horizon})`,
      'Lịch triển khai và KPI (chỉ số đánh giá hiệu suất) chi tiết',
      'Phân công nhiệm vụ cho các nhân sự AI',
    ];

    const summary = `Kế hoạch ${horizon} gồm ${outline.length} hạng mục, ${subtasks.length} công việc, huy động ${new Set(subtasks.map((s) => s.departmentId)).size} phòng ban${target ? `, mục tiêu tăng ${target}%` : ''}.`;

    const replyToOwner =
      `Tôi đã phân tích yêu cầu và xây dựng kế hoạch tổng thể ${horizon}. ` +
      `Kế hoạch gồm ${outline.length} hạng mục: ${outline.map((o, i) => `(${i + 1}) ${o.toLowerCase()}`).join(', ')}. ` +
      `Tôi đã phân rã thành ${subtasks.length} công việc và giao cho các phòng ban liên quan tại ${ctx.companyName}. ` +
      `Kế hoạch đang chờ bạn phê duyệt tại Trung tâm phê duyệt (Approval Center) trước khi các nhân sự AI bắt đầu thực thi.`;

    return {
      title,
      summary,
      outline,
      subtasks,
      approvalRequired: true,
      approvalTitle: `Phê duyệt kế hoạch: ${shortTitle(input.text)}`,
      replyToOwner,
    };
  }

  async replyToOwner(agent: Agent, text: string, ctx: BrainContext & { agentTasks: Task[] }): Promise<string> {
    const open = ctx.agentTasks.filter((t) => t.status !== 'completed');
    const running = open.filter((t) => t.status === 'in_progress');
    const lower = text.toLowerCase();
    const roleIntro: Record<Agent['role'], string> = {
      ai_ceo: 'Với vai trò Giám đốc điều hành AI (AI CEO)',
      ai_coo: 'Với vai trò Giám đốc vận hành AI (AI COO)',
      ai_project_manager: 'Với vai trò Quản lý dự án AI (AI Project Manager)',
      ai_specialist: 'Với vai trò Chuyên viên thực thi AI (AI Specialist)',
      ai_qa_reviewer: 'Với vai trò Nhân viên kiểm định chất lượng AI (AI QA Reviewer)',
    };
    if (lower.includes('tiến độ') || lower.includes('báo cáo') || lower.includes('tình hình')) {
      const lines = open.slice(0, 4).map((t) => `• ${t.title} – ${t.progress}%`);
      return `${roleIntro[agent.role]}, tôi đang phụ trách ${open.length} công việc, trong đó ${running.length} đang thực hiện.\n${lines.join('\n')}${open.length > 4 ? `\n• … và ${open.length - 4} công việc khác` : ''}\nTôi sẽ cập nhật ngay khi có thay đổi quan trọng.`;
    }
    if (lower.includes('rủi ro') || lower.includes('vấn đề') || lower.includes('chậm')) {
      const risky = open.filter((t) => t.status === 'blocked' || t.status === 'overdue');
      return risky.length
        ? `Hiện có ${risky.length} công việc cần chú ý: ${risky.map((t) => `"${t.title}"`).join(', ')}. Tôi đề xuất ưu tiên xử lý các phụ thuộc bên ngoài (quyền truy cập, dữ liệu đầu vào) và sẽ báo cáo lại trong vòng 24 giờ.`
        : 'Hiện chưa ghi nhận rủi ro đáng kể. Các công việc đang bám sát kế hoạch; tôi sẽ cảnh báo ngay nếu có hạng mục trễ hạn.';
    }
    return `${roleIntro[agent.role]}, tôi đã ghi nhận yêu cầu: "${text.trim()}". Tôi sẽ xử lý và phản hồi kết quả bằng tiếng Việt, kèm giải thích các thuật ngữ chuyên ngành nếu có. Bạn có thể theo dõi tiến độ tại mục Quản lý công việc (Task Management).`;
  }

  async reviewTask(task: Task): Promise<ReviewVerdict> {
    // Xác suất đạt cao; công việc ưu tiên cao được kiểm định kỹ hơn.
    const passed = Math.random() > (task.priority === 'high' ? 0.18 : 0.1);
    return passed
      ? { passed: true, note: 'Đạt yêu cầu về nội dung, nhất quán thương hiệu và số liệu.' }
      : { passed: false, note: 'Cần chỉnh sửa: bổ sung nguồn số liệu và thống nhất giọng điệu thương hiệu.' };
  }
}

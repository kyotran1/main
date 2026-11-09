/**
 * Mô hình dữ liệu dùng chung (single source of truth) cho toàn bộ hệ thống:
 * Dashboard – Bảng điều khiển, Sơ đồ tổ chức và Văn phòng ảo 3D đều đọc từ
 * cùng một `OfficeSnapshot` do backend phát hành.
 *
 * QUY ƯỚC:
 * - Định danh kỹ thuật (id, key, enum) luôn là tiếng Anh/ASCII và KHÔNG được dịch.
 * - Nhãn hiển thị KHÔNG nằm ở đây: giao diện dịch qua gói @ads-nolimit/i18n bằng
 *   các khóa `roleKey`, `departmentId`, `status`, ...
 * - Văn bản do Agent tạo ra (tiêu đề công việc, báo cáo, tin nhắn) là DỮ LIỆU,
 *   được lưu nguyên văn (mặc định tiếng Việt) và tách biệt với bản dịch giao diện.
 */

export type Locale = 'vi-VN' | 'en-US';

/** Phòng ban trong văn phòng ảo – khớp với bố cục 3D. */
export type DepartmentId =
  | 'executive'
  | 'strategy'
  | 'marketing'
  | 'creative_media'
  | 'social_community'
  | 'data_analytics'
  | 'sales_crm'
  | 'tech_automation'
  | 'meeting_room'
  | 'reception'
  | 'pantry';

/** Chức vụ AI Agent – hiển thị song ngữ qua i18n (vd: "AI CEO – Giám đốc điều hành AI"). */
export type AgentRole =
  | 'ai_ceo'
  | 'ai_coo'
  | 'ai_project_manager'
  | 'ai_specialist'
  | 'ai_qa_reviewer';

export type AgentStatus =
  | 'active' // Đang hoạt động (sẵn sàng, đang theo dõi)
  | 'running' // Đang thực hiện công việc
  | 'waiting' // Đang chờ (đầu vào, phê duyệt, phụ thuộc)
  | 'idle' // Rảnh
  | 'paused' // Tạm dừng bởi Owner
  | 'error'; // Lỗi cần xử lý

export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'pending'
  | 'needs_approval'
  | 'in_review'
  | 'completed'
  | 'blocked'
  | 'overdue';

export type TaskPriority = 'high' | 'medium' | 'low';

/** Giai đoạn quy trình vận hành chuẩn của công ty AI. */
export type WorkflowStage =
  | 'receive' // Tiếp nhận yêu cầu
  | 'plan' // Lập kế hoạch
  | 'assign' // Phân công
  | 'execute' // Thực thi
  | 'review' // Kiểm định
  | 'report'; // Báo cáo

export type ApprovalType = 'plan' | 'budget' | 'content' | 'publish' | 'connector';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';

/** Nơi Agent đang đứng trong văn phòng 3D – backend quyết định, frontend chỉ hiển thị. */
export type AgentLocation =
  | { kind: 'desk' }
  | { kind: 'department'; departmentId: DepartmentId }
  | { kind: 'meeting_room' }
  | { kind: 'reception' }
  | { kind: 'pantry' };

export type ExecutionMode = 'local' | 'cloud' | 'hybrid';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Department {
  id: DepartmentId;
  /** Màu điểm nhấn (hex) dùng cho đèn neon của phòng và biểu đồ. */
  accent: string;
  /** Vị trí & kích thước phòng trên mặt bằng 3D (đơn vị mét ảo). */
  bounds: { x: number; z: number; width: number; depth: number };
  /** Phòng chức năng (không có nhân sự cố định). */
  functional?: boolean;
  headAgentId?: string;
  managerAgentId?: string;
}

export interface AgentSkill {
  id: string;
  level: number; // 0..100
}

export interface AgentModelConfig {
  mode: ExecutionMode;
  provider: string; // vd: "ollama", "anthropic", "mock" – định danh kỹ thuật, không dịch
  model: string;
}

export interface Agent {
  id: string;
  role: AgentRole;
  /** Tên hiển thị do Owner đặt (dữ liệu) – có thể rỗng để dùng tên chức vụ song ngữ. */
  displayName?: string;
  departmentId: DepartmentId;
  reportsTo?: string;
  status: AgentStatus;
  currentTaskId?: string;
  /** Hiệu suất 0..100. */
  performance: number;
  skills: AgentSkill[];
  connectorIds: string[];
  model: AgentModelConfig;
  location: AgentLocation;
  /** Vị trí bàn làm việc trong phòng (tọa độ tuyệt đối trên mặt bằng). */
  desk: Vec3;
  avatarSeed: string;
  tasksCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId?: string;
  parentId?: string;
  /** Nội dung do Agent/Owner tạo – dữ liệu, giữ nguyên văn. */
  title: string;
  description?: string;
  status: TaskStatus;
  stage: WorkflowStage;
  priority: TaskPriority;
  assigneeId?: string;
  requesterId?: string;
  departmentId: DepartmentId;
  progress: number; // 0..100
  dueAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  /** Đánh dấu công việc trọng tâm hôm nay. */
  focus?: boolean;
}

export interface Approval {
  id: string;
  type: ApprovalType;
  title: string;
  summary?: string;
  requestedBy: string;
  taskId?: string;
  projectId?: string;
  status: ApprovalStatus;
  amountVnd?: number;
  decidedAt?: string;
  decisionNote?: string;
  createdAt: string;
}

/**
 * Hoạt động hệ thống. `templateKey` tham chiếu bản dịch giao diện (activity:*),
 * `params` cung cấp dữ liệu; `text` là văn bản do Agent tự viết (dữ liệu, không dịch).
 */
export interface ActivityEvent {
  id: string;
  agentId?: string;
  taskId?: string;
  approvalId?: string;
  kind:
    | 'plan_created'
    | 'tasks_created'
    | 'task_started'
    | 'task_progress'
    | 'task_completed'
    | 'review_passed'
    | 'review_failed'
    | 'approval_requested'
    | 'approval_decided'
    | 'agent_message'
    | 'agent_paused'
    | 'agent_resumed'
    | 'owner_request'
    | 'system';
  templateKey: string;
  params: Record<string, string | number>;
  text?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  objective?: string;
  status: ProjectStatus;
  ownerAgentId: string;
  departmentIds: DepartmentId[];
  progress: number;
  startAt: string;
  endAt?: string;
  budgetVnd?: number;
}

export interface KpiPoint {
  label: string; // định danh kỳ, vd: "W1" – giao diện dịch sang "Tuần 1"
  reach: number;
  leads: number;
  conversionRate: number; // %
}

export interface KpiSummary {
  leadsGrowthPct: number;
  conversionGrowthPct: number;
  costPerLeadChangePct: number;
  roi: number; // vd: 3.8 (x)
  period: 'this_month' | 'last_month' | 'quarter';
  series: KpiPoint[];
}

export interface Connector {
  id: string; // định danh kỹ thuật, vd: "meta_ads"
  vendor: string; // tên thương hiệu – không dịch
  category: 'ads' | 'storage' | 'analytics' | 'crm' | 'communication' | 'ai_model';
  connected: boolean;
  mode: ExecutionMode;
  lastSyncAt?: string;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  from: 'owner' | 'agent';
  text: string;
  createdAt: string;
  relatedTaskIds?: string[];
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  ownerName: string;
  executionMode: ExecutionMode;
  version: string;
}

export interface OfficeSnapshot {
  company: CompanyInfo;
  departments: Department[];
  agents: Agent[];
  tasks: Task[];
  approvals: Approval[];
  activities: ActivityEvent[];
  projects: Project[];
  connectors: Connector[];
  kpis: KpiSummary;
  messages: ChatMessage[];
  updatedAt: string;
  revision: number;
}

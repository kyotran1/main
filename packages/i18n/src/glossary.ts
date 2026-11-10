/**
 * BẢNG THUẬT NGỮ CHUYÊN NGÀNH DÙNG CHUNG (Shared Glossary).
 *
 * Nguyên tắc bắt buộc (xem docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md):
 * 1. Một thuật ngữ tiếng Anh chỉ có MỘT bản dịch tiếng Việt chuẩn trên toàn hệ thống.
 * 2. Mọi nhãn chứa thuật ngữ chuyên ngành phải lấy từ bảng này, không gõ tay trong component.
 * 3. `en` là thuật ngữ gốc (giữ nguyên, không dịch), `vi` là nghĩa tiếng Việt hiển thị.
 * 4. `id` là định danh kỹ thuật (không dịch), theo dạng `<nhóm>.<khóa>`.
 *
 * Bảng này được nạp vào i18next dưới namespace `glossary` cho cả vi-VN và en-US,
 * đồng thời là nguồn để sinh docs/GLOSSARY.md (pnpm glossary:docs).
 */

export type GlossaryCategory =
  | 'module'
  | 'role'
  | 'department'
  | 'task_status'
  | 'agent_status'
  | 'priority'
  | 'stage'
  | 'approval_type'
  | 'approval_status'
  | 'project_status'
  | 'metric'
  | 'tech'
  | 'action'
  | 'connector_category'
  | 'execution_mode';

export interface GlossaryEntry {
  /** Định danh kỹ thuật `<nhóm>.<khóa>` – không dịch. */
  id: string;
  category: GlossaryCategory;
  /** Thuật ngữ tiếng Anh gốc. */
  en: string;
  /** Nghĩa tiếng Việt chuẩn. */
  vi: string;
  /** Dạng rút gọn tiếng Việt cho không gian hẹp (tab, chip, nhãn 3D). */
  viShort?: string;
  /** Giải thích thêm bằng tiếng Việt (tooltip / tài liệu). */
  noteVi?: string;
}

const g = (
  category: GlossaryCategory,
  key: string,
  en: string,
  vi: string,
  extra: Partial<Pick<GlossaryEntry, 'viShort' | 'noteVi'>> = {},
): GlossaryEntry => ({ id: `${category}.${key}`, category, en, vi, ...extra });

export const GLOSSARY: readonly GlossaryEntry[] = [
  // ───────────── Chức năng / phân hệ ─────────────
  g('module', 'overview', 'Overview', 'Tổng quan'),
  g('module', 'dashboard', 'Dashboard', 'Bảng điều khiển'),
  g('module', 'virtual_office_3d', 'Virtual Office 3D', 'Văn phòng ảo 3D', { viShort: 'Văn phòng 3D' }),
  g('module', 'ceo_command_center', 'AI CEO Command Center', 'Trung tâm điều hành AI CEO'),
  g('module', 'org_chart', 'Organization Chart', 'Sơ đồ tổ chức'),
  g('module', 'task_management', 'Task Management', 'Quản lý công việc'),
  g('module', 'ai_agents', 'AI Agents', 'Nhân sự AI'),
  g('module', 'agent_registry', 'Agent Registry', 'Danh sách và cấu hình nhân sự AI', {
    viShort: 'Danh sách nhân sự AI',
  }),
  g('module', 'workflow', 'Workflow', 'Quy trình làm việc'),
  g('module', 'approval_center', 'Approval Center', 'Trung tâm phê duyệt'),
  g('module', 'skill_connector', 'Skill & Connector', 'Kỹ năng và công cụ kết nối', {
    viShort: 'Kỹ năng & Kết nối',
  }),
  g('module', 'connectors', 'Connectors', 'Công cụ kết nối'),
  g('module', 'projects_campaigns', 'Projects & Campaigns', 'Dự án & Chiến dịch'),
  g('module', 'reports_analytics', 'Reports & Analytics', 'Báo cáo & Phân tích'),
  g('module', 'activity_log', 'Activity Log', 'Nhật ký hoạt động'),
  g('module', 'knowledge_base', 'Knowledge Base', 'Kho tri thức'),
  g('module', 'settings', 'Settings', 'Cài đặt hệ thống'),
  g('module', 'kpi', 'KPI', 'Chỉ số đánh giá hiệu suất', {
    noteVi: 'Key Performance Indicator – thước đo kết quả then chốt của chiến dịch/công ty.',
  }),
  g('module', 'quick_report', 'Quick Report', 'Báo cáo nhanh'),
  g('module', 'main_functions', 'Main Functions', 'Chức năng chính'),
  g('module', 'task_status', 'Task Status', 'Trạng thái công việc'),
  g('module', 'overall_progress', 'Overall Progress', 'Tiến độ công việc tổng quan', {
    viShort: 'Tiến độ tổng quan',
  }),
  g('module', 'recent_activities', 'Recent AI Activities', 'Hoạt động AI gần đây'),
  g('module', 'todays_key_tasks', "Today's Key Tasks", 'Công việc trọng tâm hôm nay'),
  g('module', 'marketing_performance', 'Marketing Performance', 'Hiệu suất tiếp thị'),
  g('module', 'mini_view', 'Mini View', 'Chế độ thu nhỏ', { viShort: 'Thu nhỏ' }),
  g('module', 'full_screen', 'Full Screen', 'Toàn màn hình'),
  g('module', 'owner', 'Owner', 'Chủ doanh nghiệp'),
  g('module', 'search', 'Search', 'Tìm kiếm'),
  g('module', 'notifications', 'Notifications', 'Thông báo'),
  g('module', 'help', 'Help', 'Trợ giúp'),
  g('module', 'plan_summary', 'Plan Summary', 'Tóm tắt kế hoạch'),
  g('module', 'campaign', 'Campaign', 'Chiến dịch'),
  g('module', 'project', 'Project', 'Dự án'),
  g('module', 'task', 'Task', 'Công việc (nhiệm vụ)', { viShort: 'Công việc' }),
  g('module', 'assignee', 'Assignee', 'Người phụ trách'),
  g('module', 'due_date', 'Due Date', 'Hạn hoàn thành'),
  g('module', 'department', 'Department', 'Phòng ban'),
  g('module', 'language', 'Language', 'Ngôn ngữ'),

  // ───────────── Chức vụ AI Agent ─────────────
  g('role', 'ai_ceo', 'AI CEO', 'Giám đốc điều hành AI'),
  g('role', 'ai_coo', 'AI COO', 'Giám đốc vận hành AI'),
  g('role', 'ai_project_manager', 'AI Project Manager', 'Quản lý dự án AI'),
  g('role', 'ai_specialist', 'AI Specialist', 'Chuyên viên thực thi AI'),
  g('role', 'ai_qa_reviewer', 'AI QA Reviewer', 'Nhân viên kiểm định chất lượng AI', {
    viShort: 'Kiểm định chất lượng AI',
  }),

  // ───────────── Phòng ban (khớp bố cục văn phòng 3D) ─────────────
  g('department', 'executive', 'Executive', 'Ban điều hành'),
  g('department', 'strategy', 'Strategy & Research', 'Phòng Chiến lược & Nghiên cứu', {
    viShort: 'Chiến lược',
  }),
  g('department', 'marketing', 'Marketing', 'Phòng Marketing (Tiếp thị)', { viShort: 'Marketing' }),
  g('department', 'creative_media', 'Creative & Media', 'Phòng Sáng tạo & Media', {
    viShort: 'Sáng tạo & Media',
  }),
  g('department', 'social_community', 'Social & Community', 'Phòng Truyền thông & Cộng đồng', {
    viShort: 'Truyền thông',
  }),
  g('department', 'data_analytics', 'Data & Analytics', 'Phòng Dữ liệu & Phân tích', {
    viShort: 'Dữ liệu & Phân tích',
  }),
  g('department', 'sales_crm', 'Sales & CRM', 'Phòng Kinh doanh & CRM (Quản lý khách hàng)', {
    viShort: 'Kinh doanh & CRM',
  }),
  g('department', 'tech_automation', 'Tech & Automation', 'Phòng Kỹ thuật & Tự động hóa', {
    viShort: 'Kỹ thuật',
  }),
  g('department', 'meeting_room', 'Meeting Room', 'Phòng họp'),
  g('department', 'reception', 'Reception', 'Sảnh chính (Khu tiếp đón)', { viShort: 'Sảnh chính' }),
  g('department', 'pantry', 'Pantry & Lounge', 'Khu giải trí & Pantry', { viShort: 'Pantry' }),

  // ───────────── Trạng thái công việc ─────────────
  g('task_status', 'not_started', 'Not Started', 'Chưa bắt đầu'),
  g('task_status', 'in_progress', 'In Progress', 'Đang thực hiện'),
  g('task_status', 'pending', 'Pending', 'Đang chờ'),
  g('task_status', 'needs_approval', 'Needs Approval', 'Cần phê duyệt'),
  g('task_status', 'in_review', 'In Review', 'Đang kiểm định'),
  g('task_status', 'completed', 'Completed', 'Đã hoàn thành'),
  g('task_status', 'blocked', 'Blocked', 'Bị chặn'),
  g('task_status', 'overdue', 'Overdue', 'Quá hạn'),

  // ───────────── Trạng thái nhân sự AI ─────────────
  g('agent_status', 'active', 'Active', 'Đang hoạt động'),
  g('agent_status', 'running', 'Running', 'Đang thực hiện'),
  g('agent_status', 'waiting', 'Waiting', 'Đang chờ'),
  g('agent_status', 'idle', 'Idle', 'Rảnh'),
  g('agent_status', 'paused', 'Paused', 'Tạm dừng'),
  g('agent_status', 'error', 'Error', 'Lỗi'),

  // ───────────── Mức ưu tiên ─────────────
  g('priority', 'high', 'High', 'Cao'),
  g('priority', 'medium', 'Medium', 'Trung bình'),
  g('priority', 'low', 'Low', 'Thấp'),

  // ───────────── Giai đoạn quy trình ─────────────
  g('stage', 'receive', 'Receive', 'Tiếp nhận yêu cầu', { viShort: 'Tiếp nhận' }),
  g('stage', 'plan', 'Plan', 'Lập kế hoạch'),
  g('stage', 'assign', 'Assign', 'Phân công'),
  g('stage', 'execute', 'Execute', 'Thực thi'),
  g('stage', 'review', 'Review', 'Kiểm định'),
  g('stage', 'report', 'Report', 'Báo cáo'),

  // ───────────── Phê duyệt ─────────────
  g('approval_type', 'plan', 'Plan Approval', 'Phê duyệt kế hoạch'),
  g('approval_type', 'budget', 'Budget Approval', 'Phê duyệt ngân sách'),
  g('approval_type', 'content', 'Content Approval', 'Phê duyệt nội dung'),
  g('approval_type', 'publish', 'Publish Approval', 'Phê duyệt xuất bản'),
  g('approval_type', 'connector', 'Connector Access', 'Cấp quyền kết nối'),
  g('approval_status', 'pending', 'Pending', 'Chờ duyệt'),
  g('approval_status', 'approved', 'Approved', 'Đã duyệt'),
  g('approval_status', 'rejected', 'Rejected', 'Đã từ chối'),

  // ───────────── Trạng thái dự án ─────────────
  g('project_status', 'planning', 'Planning', 'Đang lên kế hoạch'),
  g('project_status', 'active', 'Active', 'Đang triển khai'),
  g('project_status', 'on_hold', 'On Hold', 'Tạm hoãn'),
  g('project_status', 'completed', 'Completed', 'Hoàn thành'),

  // ───────────── Chỉ số ─────────────
  g('metric', 'leads', 'Leads', 'Khách hàng tiềm năng'),
  g('metric', 'conversion_rate', 'Conversion Rate (CR)', 'Tỷ lệ chuyển đổi'),
  g('metric', 'cost_per_lead', 'Cost per Lead (CPL)', 'Chi phí trên mỗi khách hàng tiềm năng', {
    viShort: 'Chi phí/khách hàng',
  }),
  g('metric', 'roi', 'ROI (Return on Investment)', 'Hiệu suất đầu tư', { viShort: 'ROI' }),
  g('metric', 'reach', 'Reach', 'Lượt tiếp cận'),
  g('metric', 'performance', 'Performance', 'Hiệu suất'),
  g('metric', 'progress', 'Progress', 'Tiến độ'),
  g('metric', 'completion_rate', 'Completion Rate', 'Tỷ lệ hoàn thành'),
  g('metric', 'budget', 'Budget', 'Ngân sách'),

  // ───────────── Kỹ thuật ─────────────
  g('tech', 'ai_agent', 'AI Agent', 'Nhân sự AI (tác tử AI)', { viShort: 'Nhân sự AI' }),
  g('tech', 'hybrid_local_cloud', 'Hybrid Local + Cloud', 'Kết hợp cục bộ + đám mây', {
    noteVi: 'Dữ liệu và điều phối chạy trên máy của bạn; mô hình AI có thể chạy cục bộ hoặc gọi lên đám mây.',
  }),
  g('tech', 'execution_mode', 'Execution Mode', 'Chế độ vận hành'),
  g('tech', 'provider', 'Provider', 'Nhà cung cấp mô hình'),
  g('tech', 'model', 'Model', 'Mô hình AI'),
  g('tech', 'connector', 'Connector', 'Công cụ kết nối'),
  g('tech', 'skill', 'Skill', 'Kỹ năng'),
  g('tech', 'api', 'API', 'Giao diện lập trình ứng dụng'),
  g('tech', 'webhook', 'Webhook', 'Móc nối sự kiện web'),
  g('tech', 'realtime_sync', 'Realtime Sync', 'Đồng bộ thời gian thực'),
  g('tech', 'mvp', 'MVP', 'Sản phẩm khả dụng tối thiểu'),
  g('tech', 'backend', 'Backend', 'Hệ thống nền'),
  g('tech', 'frontend', 'Frontend', 'Giao diện người dùng'),
  g('tech', 'desktop_app', 'Desktop App', 'Ứng dụng máy tính'),
  g('tech', 'web_app', 'Web App', 'Ứng dụng web'),
  g('tech', 'prompt', 'Prompt', 'Câu lệnh yêu cầu'),
  g('tech', 'token', 'Token', 'Đơn vị văn bản (token)'),
  g('tech', 'single_source_of_truth', 'Single Source of Truth', 'Nguồn dữ liệu duy nhất'),
  g('tech', 'version', 'Version', 'Phiên bản'),
  g('tech', 'status', 'Status', 'Trạng thái'),
  g('tech', 'online', 'Online', 'Trực tuyến'),
  g('tech', 'offline', 'Offline', 'Ngoại tuyến'),
  g('tech', 'connected', 'Connected', 'Đã kết nối'),
  g('tech', 'disconnected', 'Disconnected', 'Chưa kết nối'),

  g('execution_mode', 'local', 'Local', 'Cục bộ (chạy trên máy)'),
  g('execution_mode', 'cloud', 'Cloud', 'Đám mây'),
  g('execution_mode', 'hybrid', 'Hybrid', 'Kết hợp'),

  // ───────────── Hành động ─────────────
  g('action', 'approve', 'Approve', 'Duyệt'),
  g('action', 'reject', 'Reject', 'Từ chối'),
  g('action', 'assign', 'Assign', 'Giao việc'),
  g('action', 'pause', 'Pause', 'Tạm dừng'),
  g('action', 'resume', 'Resume', 'Tiếp tục'),
  g('action', 'view_all', 'View All', 'Xem tất cả'),
  g('action', 'view_details', 'View Details', 'Xem chi tiết'),
  g('action', 'view_log', 'View Log', 'Xem nhật ký'),
  g('action', 'enter_office', 'Enter 3D Office', 'Vào văn phòng 3D'),
  g('action', 'view_plan', 'View Plan', 'Xem kế hoạch chi tiết'),
  g('action', 'approve_execute', 'Approve & Execute', 'Phê duyệt & triển khai'),
  g('action', 'send', 'Send', 'Gửi'),
  g('action', 'export', 'Export', 'Xuất dữ liệu'),
  g('action', 'filter', 'Filter', 'Lọc'),
  g('action', 'refresh', 'Refresh', 'Làm mới'),
  g('action', 'create_task', 'Create Task', 'Tạo công việc'),
  g('action', 'message_agent', 'Message Agent', 'Nhắn cho nhân sự AI'),
  g('action', 'focus_camera', 'Focus Camera', 'Đưa camera tới'),
  g('action', 'reset_view', 'Reset View', 'Đặt lại góc nhìn'),

  // ───────────── Thuật ngữ bổ sung từ các phân hệ (gộp từ đề xuất của từng gói) ─────────────
  g('module', 'decision_history', 'Decision History', 'Lịch sử quyết định'),
  g('module', 'governance_rules', 'Governance Rules', 'Quy tắc quản trị'),
  g('module', 'pipeline', 'Pipeline', 'Sơ đồ quy trình'),
  g('module', 'recent_flow', 'Recent Flow', 'Luồng gần đây'),
  g('module', 'virtual_office_mini', 'Virtual Office 3D (Mini View)', 'Văn phòng ảo 3D (Thu nhỏ)'),
  g('module', 'progress_by_department', 'Progress by Department', 'Tiến độ theo phòng ban'),
  g('module', 'reporting_period', 'Reporting Period', 'Kỳ báo cáo'),
  g('module', 'department_details', 'Department Details', 'Chi tiết phòng ban'),
  g('module', 'current_task', 'Current Task', 'Công việc hiện tại'),
  g('module', 'status_legend', 'Status Legend', 'Chú giải trạng thái'),
  g('module', 'legend', 'Legend', 'Chú thích'),
  g('module', 'labels', 'Labels', 'Nhãn hiển thị'),
  g('module', 'kanban_board', 'Kanban Board', 'Bảng Kanban (thẻ theo trạng thái)', { viShort: 'Bảng Kanban' }),
  g('module', 'table_view', 'Table View', 'Dạng bảng'),
  g('module', 'tree_view', 'Tree View', 'Dạng cây tổ chức', { viShort: 'Dạng cây' }),
  g('module', 'by_department', 'By Department', 'Theo phòng ban'),
  g('module', 'task_details', 'Task Details', 'Chi tiết công việc'),
  g('module', 'agent_profile', 'AI Agent Profile', 'Hồ sơ nhân sự AI'),
  g('module', 'quick_chat', 'Quick Chat', 'Hội thoại nhanh'),
  g('module', 'quick_actions', 'Quick Actions', 'Thao tác nhanh'),
  g('module', 'timeline', 'Timeline', 'Mốc thời gian'),
  g('module', 'objective', 'Objective', 'Mục tiêu'),
  g('module', 'project_owner', 'Project Owner', 'Chủ trì dự án'),
  g('module', 'event_type', 'Event Type', 'Loại sự kiện'),
  g('module', 'department_summary', 'Department Summary', 'Tổng hợp theo phòng ban'),
  g('module', 'coo_insights', 'AI COO Insights', 'Nhận định của AI COO'),
  g('metric', 'vs_previous_period', 'vs previous period', 'so với kỳ trước'),
  g('metric', 'running_tasks', 'Running Tasks', 'Công việc đang chạy'),
  g('metric', 'open_tasks', 'Open Tasks', 'Việc đang mở'),
  g('metric', 'tasks_completed', 'Tasks Completed', 'Việc đã hoàn thành'),
  g('metric', 'workload', 'Workload', 'Khối lượng công việc'),
  g('metric', 'average_progress', 'Average Progress', 'Tiến độ trung bình'),
  g('metric', 'levels', 'Levels', 'Cấp bậc'),
  g('metric', 'decision_note', 'Decision Note', 'Ghi chú quyết định'),
  g('metric', 'requested_by', 'Requested by', 'Đề xuất bởi'),
  g('metric', 'linked_task', 'Linked Task', 'Công việc liên quan'),
  g('tech', 'live', 'Live', 'Đang cập nhật trực tiếp', { viShort: 'Trực tiếp' }),
  g('tech', 'reports_to', 'Reports to', 'Báo cáo cho'),
  g('tech', 'parent_task', 'Parent Task', 'Công việc cha'),
  g('tech', 'subtask', 'Subtask', 'Công việc con'),
  g('tech', 'tags', 'Tags', 'Thẻ phân loại'),
  g('tech', 'focus_today', 'Focus Today', 'Trọng tâm hôm nay'),
  g('action', 'exit_full_screen', 'Exit Full Screen', 'Thoát toàn màn hình'),
  g('action', 'filter_by_department', 'Filter by Department', 'Lọc theo phòng ban'),
  g('action', 'load_more', 'Load More', 'Tải thêm'),
  g('action', 'clear_filters', 'Clear Filters', 'Xóa bộ lọc'),
  g('action', 'mark_completed', 'Mark as Completed', 'Đánh dấu hoàn thành'),
  g('action', 'collapse_all', 'Collapse All', 'Thu gọn tất cả'),
  g('action', 'expand_all', 'Expand All', 'Mở rộng tất cả'),
  g('action', 'zoom', 'Zoom', 'Thu phóng'),
  g('action', 'sort', 'Sort', 'Sắp xếp'),

  // ───────────── Nhóm công cụ kết nối ─────────────
  g('connector_category', 'ads', 'Ads', 'Quảng cáo'),
  g('connector_category', 'storage', 'Storage', 'Lưu trữ & chia sẻ'),
  g('connector_category', 'analytics', 'Analytics', 'Phân tích dữ liệu'),
  g('connector_category', 'crm', 'CRM', 'Quản lý khách hàng'),
  g('connector_category', 'communication', 'Communication', 'Giao tiếp & nhắn tin'),
  g('connector_category', 'ai_model', 'AI Model', 'Mô hình AI'),
];

export type GlossaryId = (typeof GLOSSARY)[number]['id'];

const BY_ID: ReadonlyMap<string, GlossaryEntry> = new Map(GLOSSARY.map((e) => [e.id, e]));

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return BY_ID.get(id);
}

export function listGlossary(category?: GlossaryCategory): GlossaryEntry[] {
  return category ? GLOSSARY.filter((e) => e.category === category) : [...GLOSSARY];
}

/** Tập thuật ngữ tiếng Anh (chữ thường) – dùng cho lint phát hiện nhãn chỉ có tiếng Anh. */
export function englishTermSet(): Set<string> {
  return new Set(GLOSSARY.map((e) => e.en.toLowerCase()));
}

/**
 * Sinh tài nguyên i18next cho namespace `glossary`.
 * vi-VN: label = nghĩa tiếng Việt, inline = "EN – VI", secondary = EN.
 * en-US: label = EN, inline = EN, secondary = VI (giữ để tham chiếu, UI en có thể ẩn).
 */
export function buildGlossaryResources(locale: 'vi-VN' | 'en-US'): Record<string, unknown> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const e of GLOSSARY) {
    const [cat, key] = e.id.split('.') as [string, string];
    const bucket = (out[cat] ??= {});
    bucket[key] =
      locale === 'vi-VN'
        ? {
            label: e.vi,
            short: e.viShort ?? e.vi,
            secondary: e.en,
            inline: `${e.en} – ${e.vi}`,
            term: e.en,
            meaning: e.vi,
            note: e.noteVi ?? '',
          }
        : {
            label: e.en,
            short: e.en,
            secondary: e.vi,
            inline: e.en,
            term: e.en,
            meaning: e.vi,
            note: e.noteVi ?? '',
          };
  }
  return out;
}

/** Sinh docs/GLOSSARY.md từ bảng thuật ngữ dùng chung – chạy: pnpm glossary:docs */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GLOSSARY, type GlossaryCategory } from '../packages/i18n/src/glossary.ts';

const CATEGORY_TITLES: Record<GlossaryCategory, string> = {
  module: 'Chức năng / phân hệ (Modules)',
  role: 'Chức vụ nhân sự AI (Agent Roles)',
  department: 'Phòng ban (Departments)',
  task_status: 'Trạng thái công việc (Task Status)',
  agent_status: 'Trạng thái nhân sự AI (Agent Status)',
  priority: 'Mức ưu tiên (Priority)',
  stage: 'Giai đoạn quy trình (Workflow Stages)',
  approval_type: 'Loại phê duyệt (Approval Types)',
  approval_status: 'Trạng thái phê duyệt (Approval Status)',
  project_status: 'Trạng thái dự án (Project Status)',
  metric: 'Chỉ số (Metrics)',
  tech: 'Thuật ngữ kỹ thuật (Technical)',
  execution_mode: 'Chế độ vận hành (Execution Mode)',
  action: 'Hành động (Actions)',
  connector_category: 'Nhóm công cụ kết nối (Connector Categories)',
};

const lines: string[] = [
  '# Bảng thuật ngữ chuyên ngành dùng chung – Shared Glossary',
  '',
  '> **Tệp này được sinh tự động** từ `packages/i18n/src/glossary.ts` bằng `pnpm glossary:docs`. Không sửa tay.',
  '>',
  '> Quy tắc: một thuật ngữ tiếng Anh chỉ có **một** bản dịch tiếng Việt chuẩn trên toàn hệ thống (Web, Desktop, báo cáo của AI Agent).',
  '> Khi hiển thị: tiếng Việt là nhãn chính, thuật ngữ tiếng Anh đi kèm (dạng `EN – VI` hoặc dòng phụ/tooltip).',
  '',
  `Tổng số thuật ngữ: **${GLOSSARY.length}**.`,
  '',
];

const categories = Object.keys(CATEGORY_TITLES) as GlossaryCategory[];
for (const cat of categories) {
  const entries = GLOSSARY.filter((g) => g.category === cat);
  if (!entries.length) continue;
  lines.push(`## ${CATEGORY_TITLES[cat]}`, '', '| Id (kỹ thuật) | Thuật ngữ tiếng Anh | Nghĩa tiếng Việt chuẩn | Dạng rút gọn | Ghi chú |', '|---|---|---|---|---|');
  for (const e of entries) {
    lines.push(`| \`${e.id}\` | ${e.en} | ${e.vi} | ${e.viShort ?? ''} | ${e.noteVi ?? ''} |`);
  }
  lines.push('');
}

const out = resolve(import.meta.dirname ?? '.', '..', 'docs', 'GLOSSARY.md');
writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`✔  Đã sinh ${out} (${GLOSSARY.length} thuật ngữ)`);

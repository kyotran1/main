# CLAUDE.md – Hướng dẫn cho mọi phiên Claude Code và kỹ sư làm việc trên repo này

Repo: **ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI** (Hybrid Local + Cloud – kết hợp cục bộ và đám mây).
Công ty Truyền thông & Marketing vận hành bằng nhân sự AI (AI CEO, AI COO, AI Project Manager, AI Specialist, AI QA Reviewer)
với Văn phòng ảo 3D tương tác, Dashboard (Bảng điều khiển), Sơ đồ tổ chức, Quản lý công việc, Quy trình 6 giai đoạn, Trung tâm
phê duyệt, Kỹ năng & Kết nối. Sản phẩm thương mại; người dùng là Chủ doanh nghiệp Việt Nam.

Tài liệu bắt buộc đọc trước khi sửa mã:
- `docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md` – chuẩn ngôn ngữ giao diện (BẮT BUỘC, mọi màn hình)
- `docs/UI_DESIGN_SYSTEM.md` – token, thành phần, 3D, biểu đồ, responsive, khả năng tiếp cận
- `docs/ARCHITECTURE.md` – kiến trúc, hợp đồng API, sự kiện realtime, engine, mô hình dữ liệu
- `docs/PRD.md` – yêu cầu sản phẩm; `docs/IMPLEMENTATION_CHECKLIST.md` – trạng thái triển khai; `docs/GLOSSARY.md` – thuật ngữ (sinh tự động)

## 1. Cấu trúc monorepo (pnpm workspaces, Node ≥ 20, pnpm 10)

```
apps/api        Local Runtime: Fastify 5 + Socket.IO 4 + tệp JSON trạng thái; OfficeStore (nguồn dữ liệu duy nhất), OfficeEngine, providers (mock/ollama/anthropic)
apps/web        React 19 + Vite 7 + TypeScript strict + Tailwind v4; zustand store duy nhất; react-router-dom v7; recharts; three/@react-three/fiber/drei
apps/desktop    Electron bọc Web, menu dùng chung @ads-nolimit/i18n
packages/shared Kiểu dữ liệu miền (domain.ts), hằng quy trình (workflow.ts), sự kiện (events.ts), hợp đồng API (api.ts), zod schemas
packages/i18n   Từ điển vi-VN/en-US (locales/<locale>/<ns>.json), bảng thuật ngữ (src/glossary.ts), hook/component React (src/react.tsx)
scripts/        i18n-lint.ts (pnpm lint:i18n), generate-glossary-doc.ts (pnpm glossary:docs)
docs/           Tài liệu sản phẩm/kỹ thuật (tiếng Việt)
```

Alias `@/` → `apps/web/src`. Import kiểu dùng chung: `import type { Agent, Task, … } from '@ads-nolimit/shared'`.

## 2. Lệnh

| Lệnh | Ý nghĩa |
|---|---|
| `pnpm install` | Cài phụ thuộc (không thêm phụ thuộc mới nếu không được yêu cầu rõ) |
| `pnpm dev` | Chạy api (http://localhost:4000) + web (http://localhost:5173, proxy `/api` và `/socket.io`) |
| `pnpm dev:desktop` | Mở Electron trỏ tới web dev (cần `pnpm dev` đang chạy) |
| `pnpm build` | Build packages rồi apps |
| `pnpm typecheck` | `tsc --noEmit` ở 5 gói – phải 0 lỗi |
| `pnpm test` | vitest (api, i18n, web) |
| `pnpm lint:i18n` | Kiểm tra chuẩn ngôn ngữ – phải 0 lỗi trước khi commit |
| `pnpm glossary:docs` | Sinh lại `docs/GLOSSARY.md` sau khi sửa `glossary.ts` |
| `pnpm e2e` | Kiểm thử đầu cuối (`apps/web/e2e/run.mjs`) |
| `pnpm check` | typecheck + lint:i18n + test + build – cổng chất lượng trước PR |

Tiện ích phát triển: `POST http://localhost:4000/api/admin/tick` (một nhịp mô phỏng), `POST /api/admin/reset` (đặt lại dữ liệu
mẫu), `GET /api/health`. Biến môi trường: xem `docs/ARCHITECTURE.md` mục 12 (`AI_PROVIDER`, `OLLAMA_*`, `ANTHROPIC_API_KEY`,
`ANTHROPIC_MODEL`, `PORT`, `HOST`, `CORS_ORIGIN`, `DATA_FILE`, `SEED_RESET`, `SIMULATION`, `VITE_API_*`, `ADS_NOLIMIT_WEB_URL`).

## 3. QUY TẮC BẮT BUỘC VỀ NGÔN NGỮ (xem docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md)

1. **Tiếng Việt (vi-VN) là mặc định**, en-US dự phòng. Không tự suy ngôn ngữ từ trình duyệt.
2. **Mọi chuỗi hiển thị phải qua i18n**: `t('ns:key')`, `<Term id="…" format="inline|stacked|primary|short"/>`, `bilingual(id, locale)`,
   `<BilingualText/>`. **Không hard-code chữ trong JSX**, kể cả `title`, `placeholder`, `aria-label`, `alt`. `pnpm lint:i18n` sẽ chặn.
3. **Thuật ngữ chuyên ngành tiếng Anh luôn kèm nghĩa tiếng Việt**: một dòng `Dashboard – Bảng điều khiển` (en dash có khoảng trắng,
   `TERM_SEPARATOR`), hoặc xếp chồng (tiếng Việt là nhãn chính `term-primary`, tiếng Anh dòng phụ nhỏ hơn `term-secondary`), hoặc
   tooltip `title="EN – VI"`. Không bao giờ có nhãn chỉ tiếng Anh chuyên ngành.
4. **Chức vụ** luôn song ngữ chuẩn qua `<AgentName agent={…}/>` / `useAgentDisplayName` / `bilingual(termIdForRole(role))`:
   AI CEO – Giám đốc điều hành AI · AI COO – Giám đốc vận hành AI · AI Project Manager – Quản lý dự án AI · AI Specialist – Chuyên
   viên thực thi AI · AI QA Reviewer – Nhân viên kiểm định chất lượng AI. Tương tự `termIdForDepartment`, `termIdForTaskStatus`,
   `termIdForAgentStatus`, `termIdForPriority`, `termIdForStage`, `termIdForApprovalType`, `termIdForApprovalStatus`,
   `termIdForProjectStatus`, `termIdForExecutionMode` hoặc các component `TaskStatusBadge`, `AgentStatusBadge`, `PriorityBadge`,
   `StageBadge`, `ApprovalStatusBadge`, `DepartmentName`.
5. **Thuật ngữ mới** thêm vào `packages/i18n/src/glossary.ts` (`g(category, key, en, vi, { viShort?, noteVi? })`) rồi chạy
   `pnpm glossary:docs`. Không gõ cặp EN/VI tạm trong component.
6. **Khóa locale mới phải thêm vào CẢ HAI** `packages/i18n/locales/vi-VN/<ns>.json` và `en-US/<ns>.json` với cùng cấu trúc; dùng cặp
   `label`/`secondary` khi cần song ngữ; số nhiều `key_one`/`key_other` với `{{count}}`. Namespace mới phải khai báo trong
   `packages/i18n/src/resources.ts`.
7. **Không dịch định danh kỹ thuật**: id, enum, route path, JSON key, tên API, biến môi trường, tên thương hiệu (Meta Ads, Google Ads,
   TikTok Ads, Zalo OA, Google Drive, HubSpot CRM, Canva, Ollama, Anthropic Claude…).
8. **Dữ liệu do Agent/Owner tạo** (tiêu đề công việc, mô tả, tin nhắn, báo cáo, `displayName`, tên dự án) là DỮ LIỆU từ backend – hiển thị
   nguyên văn, không đưa vào tệp locale, không dịch.
9. **Lỗi** hiển thị bằng `<ErrorBanner error={err} onRetry={…}/>` (diễn giải tiếng Việt theo mã qua `describeError`); mã lỗi mới phải thêm
   vào `ApiErrorCode` (`packages/shared/src/api.ts`), `STATUS_BY_CODE` (`apps/api/src/errors.ts`) và `errors.json` ở cả hai locale.
10. **Không tràn chữ khi song ngữ**: `truncate`/`line-clamp-*`, `term-stack`, `min-w-0`; kiểm tra ở 390 px.
11. **Đầu ra của AI Agent cho Owner bằng tiếng Việt**, thuật ngữ kèm giải thích (prompt hệ thống `SYSTEM_VI` trong `providers/llm.ts`).
12. **Chạy `pnpm lint:i18n` (và `pnpm typecheck`) trước mỗi commit.**

## 4. Quy tắc dữ liệu một nguồn (Single Source of Truth)

- Backend phát hành **một `OfficeSnapshot`**; web giữ **một store** `useOfficeStore` (`apps/web/src/store/officeStore.ts`), được hydrate
  từ `GET /api/state` và cập nhật qua Socket.IO `office:event`. **Không trang/feature nào giữ bản sao dữ liệu** (không `useState` chứa
  danh sách lấy từ API, không fetch riêng trong component).
- Đọc giá trị nguyên thủy hoặc tham chiếu sẵn có: `useOfficeStore((s) => s.connection)`, `useOfficeStore((s) => s.agents[id])`.
- **Selector tạo object/array mới** (lọc, gom nhóm, tính toán) → **bắt buộc** `useDerived(selector, deps)` từ `src/store/hooks.ts`
  (hoặc `useAgents`/`useTasks`/`useApprovals`/`useProjects`). Dùng `useOfficeStore` trực tiếp với selector tạo object mới gây vòng lặp
  render vô hạn.
- Dùng selector dùng chung trong `src/store/selectors.ts` (`selectHeadlineStats`, `selectTaskCounts`, `selectAgentCounts`,
  `selectStageCounts`, `selectTodaysKeyTasks`, `selectRecentActivities`, `selectPendingApprovals`, `selectOrgTree`,
  `selectAgentsByDepartment`, `selectTasksByAgent`, `selectTasksByDepartment`, `selectAgentWorkload`, `selectDepartmentSummary`,
  `selectMessagesForAgent`…) để mọi con số trên các trang khớp nhau. Selector riêng của phân hệ đặt ở `features/<gói>/selectors.ts`
  và chỉ tính từ store.
- Ghi qua `src/lib/api.ts` (`api.createCeoRequest`, `api.createTask`, `api.updateTask`, `api.decideApproval`, `api.pauseAgent`,
  `api.resumeAgent`, `api.sendAgentMessage`, `api.updateSettings`). **Sau khi ghi KHÔNG refetch** – store tự cập nhật qua realtime.
- UI state dùng chung nằm trong store: `selectAgent(id)` (mở ngăn hồ sơ gắn sẵn trong `AppShell`), `selectTask(id)`, `selectDepartment(id)`,
  `focusCameraOnAgent(id)`.

## 5. Quy tắc thiết kế (xem docs/UI_DESIGN_SYSTEM.md)

- Giao diện tối, nền navy sâu, điểm nhấn neon; **dùng token** trong `apps/web/src/styles/index.css` (`bg-*`, `text-*`, `brand-*`,
  `status-*`, `priority-*`, `dept-*`) và utility `glass`, `glass-strong`, `neon-border-{cyan,violet,green,amber,red}`,
  `text-gradient-brand`, `term-stack`/`term-primary`/`term-secondary`, `skeleton`, `focus-ring`, `animate-pulse-soft/float/shimmer`.
  **Không hard-code mã hex** trong component (màu miền lấy từ `src/lib/colors.ts`: `DEPARTMENT_COLOR_VAR`, `AGENT_STATUS_COLOR_VAR`,
  `TASK_STATUS_COLOR_VAR`, `PRIORITY_COLOR_VAR`, `ROLE_COLOR_VAR`).
- Dùng thành phần dùng chung: `components/ui` (Card, CardHeader, Badge, Button, ProgressBar, StatCard, EmptyState, ErrorBanner,
  PageSkeleton), `components/domain` (AgentName, AgentAvatar, DepartmentName, các Badge), `components/layout/PageHeader`,
  `features/activity/ActivityItem.tsx` (ActivityList/ActivityItem/useActivityText), `src/lib/format.ts` (formatNumber, formatCompact,
  formatPercent, formatSignedPercent, formatVnd, formatDate, formatDateShort, formatTime, formatLongDate, formatRelative, clampPercent).
  Component mới đặt trong `features/<gói>/`; không sửa thành phần dùng chung nếu không thật cần (nếu cần, ghi rõ trong PR).
- Responsive bắt buộc: desktop ≥ 1280, tablet, điện thoại 390 px – không cuộn ngang, chữ chú thích đọc được. Mọi nút hành động chính rõ
  nghĩa tiếng Việt. Trạng thái rỗng/đang tải có thông điệp tiếng Việt. Khả năng tiếp cận: `aria-label` tiếng Việt, focus-ring, tôn trọng
  `prefers-reduced-motion`. Biểu đồ dùng `chartTheme.ts` của phân hệ, tooltip tiếng Việt.

## 6. Quy tắc backend

- **Mọi thay đổi trạng thái đi qua `OfficeStore`** (`upsertTask`, `upsertAgent`, `upsertApproval`, `addActivity`, `upsertProject`,
  `setKpis`, `addMessage`, `updateCompany`, `replace`) – tự tăng `revision`, phát `office:event`, lưu đĩa. Không sửa `snapshot` trực tiếp.
- Logic nghiệp vụ nằm trong `OfficeEngine` (`apps/api/src/engine/OfficeEngine.ts`); route chỉ kiểm tra body bằng zod
  (`packages/shared/src/schemas.ts`) và gọi engine. Route/body/response mới phải khai báo trong `packages/shared/src/api.ts`.
- Lỗi ném `ApiError(code, message, statusCode?, details?)` với `code` thuộc `ApiErrorCode`; `message` kỹ thuật tiếng Anh cho log; giao diện
  dịch theo mã. Dùng `notFound(what, id)` cho 404.
- Sự kiện realtime mới thêm vào `OfficeEvent` (`packages/shared/src/events.ts`) và xử lý trong `useOfficeStore.applyEvent`.
- Nhà cung cấp mô hình mới implement `AgentBrain` hoặc `LlmClient` và thêm vào `createProvider`; luôn giữ fallback về `MockBrain`.
- Văn bản do engine/bộ não sinh cho Owner là tiếng Việt (dữ liệu), không phải khóa locale. `templateKey` của hoạt động phải có mẫu trong
  `activity:templates.*` (cả hai locale).
- Thêm kiểm thử vitest trong `apps/api/src/**/*.test.ts` (`simulation: false`, `random` cố định) cho logic mới.

## 7. KHÔNG THAY ĐỔI những quyết định đã thống nhất

- Kiến trúc **Hybrid Local + Cloud**: backend và dữ liệu luôn cục bộ (`apps/api`), mô hình AI chọn `mock`/`ollama`/`anthropic` qua
  `AI_PROVIDER`, mock là dự phòng.
- **Mô hình AI CEO và 5 chức vụ** (`AGENT_ROLES`), **11 phòng ban** (`DEPARTMENT_IDS`), **quy trình 6 giai đoạn**
  (`WORKFLOW_STAGES`, `STAGE_OWNER_ROLE`), **luật phê duyệt** (5 loại) và **luật tạm dừng/tiếp tục** trong `OfficeEngine`.
- **Thiết kế văn phòng 3D**: mặt bằng từ `Department.bounds`/`accent` và `Agent.desk`/`location` của backend; vị trí nhân sự do engine
  quyết định; nhãn song ngữ; camera isometric; chế độ `mini` dùng lại ở Tổng quan và Trung tâm AI CEO.
- **Tuyến đường** trong `apps/web/src/app/routes.ts` và `App.tsx`; hợp đồng `API_ROUTES`; tên sự kiện `office:event`/`office:hello`.
- Thay đổi bất kỳ điều nào ở trên là thay đổi sản phẩm: cần cập nhật `docs/PRD.md`, `docs/ARCHITECTURE.md` và được Owner duyệt trước.

## 8. Quy ước làm việc, commit và PR

- Comment mã bằng **tiếng Việt, ngắn gọn**; tên biến/hàm/tệp tiếng Anh (định danh kỹ thuật).
- Không chạy `pnpm install`/thêm phụ thuộc/sửa `package.json` nếu không được yêu cầu rõ. Không sửa `glossary.ts` khi đang làm việc song
  song với gói khác – ghi thuật ngữ đề xuất vào báo cáo để người tích hợp gộp.
- Trước khi commit: `pnpm typecheck` và `pnpm lint:i18n` = 0 lỗi; `pnpm test` đạt; chụp ảnh trang đã sửa ở 1440×900 và 390×844, console 0 lỗi.
- **Thông điệp commit tiếng Việt**, dạng `Phạm vi: nội dung ngắn` (ví dụ `Web: trang Quản lý công việc – Kanban và ngăn chi tiết`,
  `Engine: luật phê duyệt ngân sách`, `i18n: bổ sung thuật ngữ connector_category`). Không commit/push khi chưa được yêu cầu; trên nhánh
  mặc định hãy tạo nhánh mới trước.
- **Mô tả PR tiếng Việt**: mục đích, phạm vi tệp, ảnh chụp 1440/390, kết quả `pnpm check`, checklist mục 8 của
  `docs/IMPLEMENTATION_CHECKLIST.md`, thuật ngữ mới (id, en, vi), vấn đề còn tồn tại. Cập nhật tài liệu `docs/` khi hành vi thay đổi.

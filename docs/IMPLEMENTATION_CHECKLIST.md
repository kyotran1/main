# Checklist triển khai – IMPLEMENTATION CHECKLIST

**Sản phẩm:** ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI · **Phạm vi:** MVP v1.0
**Tài liệu liên quan:** [PRD.md](./PRD.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) ·
[VIETNAMESE_UI_LANGUAGE_STANDARD.md](./VIETNAMESE_UI_LANGUAGE_STANDARD.md) · [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)

> Trạng thái được xác định bằng cách **đọc mã nguồn trong repo** tại thời điểm cập nhật tài liệu (nhánh
> `claude/ads-nolimit-vietnamese-ui-sd1x09`): `[x]` đã có trong mã, `[ ]` chưa có hoặc chưa hoàn chỉnh, `[~]` có một phần
> (ghi rõ phần thiếu). Khi thêm/sửa tính năng, cập nhật checklist này trong cùng PR.
>
> **Quy tắc bất biến:** mọi chức năng tương lai – dù nhỏ – phải đi qua mục [2. Chuẩn ngôn ngữ tiếng Việt](#2-chuẩn-ngôn-ngữ-tiếng-việt)
> và mục [3. Nguồn dữ liệu duy nhất & realtime](#3-nguồn-dữ-liệu-duy-nhất--realtime) trước khi được coi là hoàn thành.

## Mục lục

1. [Theo phân hệ](#1-theo-phân-hệ)
2. [Chuẩn ngôn ngữ tiếng Việt](#2-chuẩn-ngôn-ngữ-tiếng-việt)
3. [Nguồn dữ liệu duy nhất & realtime](#3-nguồn-dữ-liệu-duy-nhất--realtime)
4. [Văn phòng 3D tương tác](#4-văn-phòng-3d-tương-tác)
5. [Backend & engine](#5-backend--engine)
6. [Chất lượng](#6-chất-lượng)
7. [Phát hành](#7-phát-hành)
8. [Checklist cho mỗi tính năng mới](#8-checklist-cho-mỗi-tính-năng-mới)

---

## 1. Theo phân hệ

Tệp tham chiếu: `apps/web/src/app/routes.ts`, `apps/web/src/pages/*.tsx`, `apps/web/src/features/**`.

### 1.1 Khung ứng dụng (`components/layout`)

- [x] `AppShell` với Sidebar (nhóm `operate`/`manage`/`insight`/`system`, nhãn xếp chồng VI/EN, ngăn trượt trên điện thoại), Topbar
  (lời chào Owner, ô tìm kiếm, hai chỉ số nhanh, thông báo, trợ giúp, cài đặt), `ConnectionBanner`, liên kết "Bỏ qua tới nội dung chính"
- [x] Hai ngăn chi tiết dùng chung gắn trong `AppShell`: `AgentDetailDrawer` (`selectedAgentId`) và `TaskDetailDrawer` (`selectedTaskId`)
- [x] Tải trang lười (`lazy`) với `PageSkeleton`; đường dẫn lạ chuyển về `/`
- [ ] Ô tìm kiếm toàn cục (Ctrl + K) thực sự tìm dự án/công việc/nhân sự (hiện chỉ là ô nhập + phím tắt hiển thị)
- [ ] Trung tâm thông báo riêng (chuông hiện trỏ tới Trung tâm phê duyệt với số yêu cầu chờ)

### 1.2 Tổng quan – Overview (`/`)

- [x] 5 thẻ đầu trang từ `selectHeadlineStats` (`HeadlineStats`)
- [x] Văn phòng 3D thu nhỏ (`OfficePreviewCard` → `<OfficeScene mode="mini"/>`) với nút vào văn phòng
- [x] Lưới "Chức năng chính" từ `ROUTES` có `featured` (`MainFunctionsGrid`)
- [x] "Công việc trọng tâm hôm nay" (`KeyTasksCard`, `selectTodaysKeyTasks`, đánh dấu hoàn thành qua `api.updateTask`)
- [x] "Hoạt động AI gần đây" (`RecentActivitiesCard`, `selectRecentActivities`)
- [x] "Tiến độ công việc tổng quan" (`OverallProgressCard`, `selectTaskCounts`)
- [x] Trạng thái đang tải (`PageLoading`)

### 1.3 Bảng điều khiển – Dashboard (`/dashboard`)

- [x] Hàng KPI với chip kỳ (`KpiRow`, `PeriodChip`) từ `store.kpis`
- [x] Biểu đồ hiệu suất marketing theo tuần (`MarketingPerformanceChart`, `chartTheme.ts`, `ChartTooltip` tiếng Việt)
- [x] Phân bố trạng thái công việc (`TaskStatusPanel`)
- [x] Luồng 6 giai đoạn (`WorkflowPipeline`, `selectStageCounts`)
- [x] Lưới nhân sự AI (`AgentGrid`)
- [x] Phê duyệt nhanh (`ApprovalsQuickPanel`, `api.decideApproval`)

### 1.4 Văn phòng ảo 3D (`/office`) – chi tiết ở mục 4

- [x] Trang với cảnh đầy đủ + cột phải: `OfficeStatsRow`, `WorkflowPipelineCard`, `ApprovalQueueCard` (duyệt/từ chối tại chỗ),
  `ActivityLogCard`, `TaskStatusTiles`

### 1.5 Trung tâm điều hành AI CEO (`/ceo`)

- [x] Ô gửi yêu cầu + chọn ưu tiên + hội thoại với AI CEO (`CeoCommandPanel`, `api.createCeoRequest`, `selectMessagesForAgent`)
- [x] Thông tin đầu trang (`CeoHeaderMeta`), văn phòng 3D thu nhỏ (`MiniOfficeCard`), bảng công việc (`CeoTaskTable`), KPI
  (`CeoKpiPanel`), biểu đồ marketing (`CeoMarketingChart`), báo cáo nhanh (`CeoQuickReport`), công cụ kết nối
  (`CeoConnectorsCard`), dải Agent Registry (`AgentRegistryStrip`)
- [x] Xử lý lỗi `agent_paused` khi AI CEO tạm dừng (qua `ErrorBanner`)

### 1.6 Sơ đồ tổ chức (`/org-chart`)

- [x] Cây báo cáo từ `selectOrgTree` (`OrgTree`, thu gọn/mở rộng, `collectParentIds`, `treeDepth`)
- [x] Chế độ xem theo phòng ban (`OrgDepartmentView`, `groupAgentsByDepartment`)
- [x] Chú giải (`OrgLegend`), số việc mở từ `selectOpenTaskCounts` (dùng chung với trang Nhân sự AI)

### 1.7 Quản lý công việc (`/tasks`)

- [x] Thống kê (`TaskStats`), thanh công cụ tìm/lọc/sắp xếp/chuyển chế độ (`TaskToolbar`)
- [x] Bảng (`TaskTable`), Kanban kéo thả đổi trạng thái (`TaskKanban`, `api.updateTask`), danh sách thẻ cho điện thoại (`TaskCardList`)
- [x] Tạo công việc (`CreateTaskDialog`, `api.createTask`, `FormControls`)
- [x] Ngăn chi tiết sửa trạng thái/phụ trách/ưu tiên/tiến độ/trọng tâm/hạn (`TaskDetailDrawer`)
- [ ] Xóa công việc từ giao diện (backend có `OfficeStore.removeTask` và sự kiện `task.removed` nhưng chưa có route/nút)

### 1.8 Dự án & Chiến dịch (`/projects`)

- [x] Tổng hợp (`ProjectsSummary`), lọc theo trạng thái (`ProjectStatusFilter`), thẻ dự án (`ProjectCard`, `ProjectStatusBadge`,
  `formatVnd`)
- [ ] Tạo/sửa dự án từ giao diện (hiện dự án chỉ được tạo tự động khi AI CEO lập kế hoạch; chưa có API `POST /api/projects`)

### 1.9 Nhân sự AI / Agent Registry (`/agents`, `/agents/:agentId`)

- [x] Thống kê (`AgentStats`), bộ lọc (`AgentFilters`), lưới thẻ theo phòng ban (`AgentCard`)
- [x] URL `/agents/:agentId` tự mở ngăn hồ sơ và trả về `/agents` khi đóng
- [x] Ngăn hồ sơ: kỹ năng, công cụ kết nối, khối lượng việc, giao việc nhanh (`AssignTaskForm`), chat (`AgentChat`,
  `api.sendAgentMessage`), tạm dừng/tiếp tục (`useAgentPauseResume`), "Đưa camera tới" (`focusCameraOnAgent` + điều hướng `/office`)
- [ ] Đổi tên hiển thị / cấu hình mô hình của từng nhân sự từ giao diện (chưa có API)

### 1.10 Quy trình (`/workflow`)

- [x] Sơ đồ 6 giai đoạn (`PipelineDiagram`), danh sách việc theo giai đoạn (`StageTaskList`), luật quản trị (`GovernanceRules`),
  dòng chảy gần đây (`RecentFlow`)

### 1.11 Trung tâm phê duyệt (`/approvals`)

- [x] Thống kê (`ApprovalStats`), bộ lọc (`ApprovalFilters`), thẻ yêu cầu với Duyệt/Từ chối + ghi chú (`ApprovalCard`,
  `useApprovalDecision`), lịch sử (`ApprovalHistory`)
- [x] Lỗi `approval_already_decided` hiển thị tiếng Việt

### 1.12 Kỹ năng & Kết nối (`/connectors`)

- [x] Thống kê (`ConnectorStats`), nhóm theo danh mục (`ConnectorGroups`, `ConnectorCard`), bảng kỹ năng toàn đội (`SkillsPanel`)
- [ ] Kết nối/ngắt kết nối thật từ giao diện (MVP chỉ đọc; thay đổi `connected` chỉ xảy ra khi duyệt phê duyệt loại `connector`)

### 1.13 Nhật ký hoạt động (`/activity`)

- [x] Dòng thời gian nhóm ngày (`ActivityTimeline`), bộ lọc nhân sự/loại/từ khóa (`ActivityFilterBar`, `activityFilters.ts`),
  tải thêm, chỉ báo realtime (`RealtimeIndicator`)
- [x] Thành phần dùng chung `ActivityList`/`ActivityItem`/`useActivityText` (mẫu `activity:templates.*`)

### 1.14 Báo cáo & Phân tích (`/reports`)

- [x] KPI + biểu đồ KPI tuần (`WeeklyKpiChart`), công việc theo phòng ban (`DepartmentTaskChart`), hiệu suất nhân sự
  (`AgentPerformanceChart`), bảng tổng hợp phòng ban (`DepartmentSummaryTable`), nhận định AI COO (`CooInsights`)
- [x] Xuất JSON/CSV phía trình duyệt (`ExportMenu`, `buildExportSnapshot`, `buildTasksCsv`)
- [ ] Xuất PDF tiếng Việt (lộ trình)

### 1.15 Kho tri thức (`/knowledge`)

- [x] Mục lục bám cuộn (`KnowledgeToc`, `useActiveSection`, `#hash`), các mục `intro`/`workflow`/`roles`/`quickstart`/`glossary`/`faq`
- [x] Bảng thuật ngữ đọc trực tiếp `listGlossary()` (`GlossaryTable`, tìm kiếm/lọc nhóm)

### 1.16 Cài đặt (`/settings`)

- [x] Chế độ vận hành Local/Cloud/Hybrid (`ExecutionModeCard`, `api.updateSettings`)
- [x] Ngôn ngữ giao diện (`LanguageCard`, `changeLocale`, lưu `localStorage['ads-nolimit.locale']`)
- [x] Tên công ty / tên Owner (`CompanyCard`)
- [x] Kết nối hệ thống nền: trạng thái, số hiệu bản dữ liệu, thời điểm cập nhật, Làm mới, Đặt lại dữ liệu mẫu có xác nhận (`BackendCard`)
- [x] Tóm tắt chuẩn ngôn ngữ (`LanguageStandardCard`)
- [ ] Cấu hình nhà cung cấp mô hình AI từ giao diện (hiện chỉ qua biến môi trường – đúng yêu cầu bảo mật khóa API)

### 1.17 Ứng dụng máy tính (`apps/desktop`)

- [x] Tiến trình chính Electron tải Web qua HTTP (dev `ADS_NOLIMIT_WEB_URL` / prod Local Runtime `http://127.0.0.1:4000` phục vụ `apps/web/dist`), menu song ngữ dùng `@ads-nolimit/i18n`,
  đổi ngôn ngữ, hộp thoại "Giới thiệu", `preload.ts` với `contextIsolation`
- [x] Build bằng esbuild (`build.mjs`), typecheck riêng
- [ ] Đóng gói cài đặt (installer) cho Windows/macOS/Linux (chưa có electron-builder/forge)
- [ ] Giao diện Web lắng nghe `desktop:locale-changed` để đổi ngôn ngữ theo menu Desktop

---

## 2. Chuẩn ngôn ngữ tiếng Việt

Nguồn chuẩn: [docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md](./VIETNAMESE_UI_LANGUAGE_STANDARD.md). Công cụ: `pnpm lint:i18n`,
`pnpm --filter @ads-nolimit/i18n test`, `pnpm glossary:docs`.

### 2.1 Tiêu chí chấp nhận (áp dụng cho mọi màn hình, hiện tại và tương lai)

- [x] vi-VN là mặc định; en-US dự phòng; không tự suy ngôn ngữ từ trình duyệt (`apps/web/src/i18n.ts`)
- [x] Mọi chuỗi hiển thị qua `t('ns:key')`, `<Term id/>`, `bilingual()`; không hard-code trong JSX kể cả `title`/`placeholder`/`aria-label`
- [x] Thuật ngữ chuyên ngành luôn kèm nghĩa tiếng Việt: dạng một dòng "EN – VI", xếp chồng (`term-stack`), hoặc tooltip "EN – VI"
- [x] Chức vụ luôn song ngữ chuẩn qua `<AgentName/>` / `termIdForRole`
- [x] Định danh kỹ thuật và tên thương hiệu không dịch (`BRAND_ALLOW` trong lint)
- [x] Dữ liệu do Agent/Owner tạo hiển thị nguyên văn, không nằm trong locale
- [x] Lỗi hiển thị qua `<ErrorBanner/>` + `describeError` (mã lỗi → tiếng Việt), mọi `ApiErrorCode` + `network` +
  `websocket_disconnected` có bản dịch trong `errors.json`
- [x] Hai locale cùng tập khóa ở 20 namespace; cặp `label`/`secondary`; số nhiều `_one`/`_other`
- [x] Bảng thuật ngữ dùng chung (`glossary.ts`, 15 nhóm) → namespace `glossary` + `docs/GLOSSARY.md` sinh tự động
- [x] Prompt hệ thống của nhà cung cấp mô hình bắt buộc tiếng Việt, thuật ngữ kèm nghĩa (`SYSTEM_VI`)
- [~] Không tràn chữ song ngữ ở 390 px – đã áp dụng `truncate`/`line-clamp`/`term-stack`; cần kiểm tra lại bằng ảnh chụp sau mỗi
  thay đổi giao diện (chưa có kiểm thử tự động đo overflow trong repo)

### 2.2 Lệnh kiểm tra và kết quả mong đợi

| Lệnh | Kết quả mong đợi | Trạng thái hiện tại |
|---|---|---|
| `pnpm lint:i18n` | `✔ Chuẩn ngôn ngữ giao diện đạt: N khóa vi-VN, M thuật ngữ, 0 cảnh báo`; mã thoát 0 | [x] đạt (0 lỗi, 0 cảnh báo) |
| `pnpm --filter @ads-nolimit/i18n test` | 8 ca đạt (`glossary.test.ts`) | [x] đạt |
| `pnpm glossary:docs` | `docs/GLOSSARY.md` cập nhật, không khác biệt chưa commit sau khi chạy | [x] có script; chạy lại mỗi khi sửa `glossary.ts` |
| Ảnh chụp 1440×900 và 390×844 từng trang | Không cuộn ngang, chữ chú thích đọc được, 0 lỗi console | [~] thủ công |

---

## 3. Nguồn dữ liệu duy nhất & realtime

Tham chiếu: `apps/api/src/store/OfficeStore.ts`, `apps/web/src/store/*`, `packages/shared/src/events.ts`,
`apps/api/src/realtime/socket.ts`, `apps/web/src/lib/realtime.ts`.

- [x] Backend: mọi thay đổi qua `OfficeStore.upsert*`/`add*`/`updateCompany`/`replace`; mỗi lần ghi tăng `revision`, phát
  `office:event`, lưu đĩa debounce 400 ms; `persistNow` khi tắt
- [x] Snapshot đầy đủ khi client kết nối; `office:hello { revision }` để đồng bộ lại khi lệch
- [x] 9 loại `OfficeEvent` được áp dụng trong `useOfficeStore.applyEvent`; bỏ qua sự kiện có `revision` cũ hơn
- [x] Một store zustand duy nhất phía web; không trang nào giữ bản sao dữ liệu; UI state (`selectedAgentId`, `selectedTaskId`,
  `selectedDepartmentId`, `cameraFocusAgentId`) nằm trong store
- [x] `useDerived(selector, deps)` cho mọi selector tạo object/array mới; `useAgents`/`useTasks`/`useApprovals`/`useProjects`
- [x] Selector dùng chung trong `store/selectors.ts`; selector riêng của phân hệ trong `features/<gói>/selectors.ts` chỉ tính từ store
- [x] Sau API ghi không refetch; store tự cập nhật qua realtime
- [x] Mất kết nối → `reconnecting`/`offline`, polling `GET /api/state` mỗi 15 s, `ConnectionBanner`/`RealtimeIndicator` tiếng Việt
- [x] `refreshSnapshot()` cho nút "Làm mới dữ liệu"
- [~] Cập nhật `connectors` khi duyệt loại `connector` hiện sửa trực tiếp `snapshot.connectors` trong `decideApproval` mà không
  phát sự kiện riêng (client chỉ thấy khi nhận `snapshot` tiếp theo) → cần `OfficeStore.upsertConnector` + sự kiện
  `connector.upserted` (xem ARCHITECTURE mục 15)
- [ ] Sự kiện `kpi.updated` đã định nghĩa và được client xử lý nhưng engine chưa có luồng tính KPI động (KPI đến từ seed)

---

## 4. Văn phòng 3D tương tác

Tham chiếu: `apps/web/src/features/office3d/**`.

- [x] Mặt bằng 11 khu dựng từ `store.departments[].bounds`/`accent`; bàn từ `agents[].desk`; không có tọa độ phòng viết cứng
  (`scene/layout.ts`, `Room.tsx`, `Furniture.tsx`)
- [x] Vị trí nhân sự theo `Agent.location` do backend quyết định (`desk`/`department`/`meeting_room`/`reception`/`pantry`),
  chia chỗ đứng cho người cùng địa điểm (`computeTargets`)
- [x] Nhân sự di chuyển mượt (`MathUtils.damp` trong `useFrame`), nhấp nhô khi làm việc, xoay khi chờ, nháy khi lỗi, mờ 45 %
  khi tạm dừng, mờ 22 % khi ngoài bộ lọc; màn hình bàn sáng khi `running` (`AgentFigure.tsx`)
- [x] Mỗi hình chỉ đăng ký lát `agents[id]` của store (không vẽ lại toàn cảnh khi một nhân sự đổi)
- [x] Nhãn song ngữ bằng DOM bám theo đối tượng 3D (`LabelLayer`, `LabelProjector`, overlay bus); tự chuyển dạng rút gọn khi
  < 16,5 px/m; tooltip "EN – VI"
- [x] Camera trực giao isometric, kéo/thu phóng/xoay giới hạn (`MapControls`), ưu tiên `cameraFocusAgentId` → phòng ban đang lọc
  → đặt lại (`CameraRig.tsx`); chế độ `mini` camera cố định
- [x] Thanh công cụ: lọc phòng ban, bật/tắt nhãn, đặt lại góc nhìn, toàn màn hình (`SceneToolbar`); chú giải (`SceneLegend`);
  huy hiệu đồng bộ ở chế độ mini (`MiniSyncBadge`)
- [x] Bấm nhân sự → `selectAgent` + `focusCameraOnAgent` (mở ngăn hồ sơ dùng chung); bấm phòng → `selectDepartment` → `DepartmentPanel`
  (nhân sự, công việc, khách đang có mặt; số từ `selectDepartmentSummary`)
- [x] Hologram trung tâm (`Hologram.tsx`), cây cảnh, hành lang phát sáng; màu từ token qua `palette.ts`
- [x] `prefers-reduced-motion` (`useReducedMotion`) tắt nhấp nhô/xoay/nháy
- [x] `SceneErrorBoundary` với thông báo tiếng Việt khi WebGL lỗi; lớp phủ "đang tải" khi chưa hydrate
- [x] `dpr` 1–1.5 (đầy đủ) / 1 (mini); chunk `three` tách riêng khi build (`vite.config.ts`)
- [x] Cảnh thu nhỏ dùng lại ở Tổng quan và Trung tâm AI CEO (`<OfficeScene mode="mini"/>`)
- [ ] Đo và ghi nhận fps thực tế trên máy văn phòng (chưa có công cụ đo trong repo)
- [ ] Mô hình nhân vật/nội thất chi tiết hơn (ảnh tham chiếu dùng nhân vật kiểu hoạt hình; MVP dùng hình khối cách điệu)

---

## 5. Backend & engine

Tham chiếu: `apps/api/src/**`, `packages/shared/src/**`.

- [x] Fastify + CORS + xử lý lỗi chuẩn `ApiErrorBody { code, message, details }`; zod cho mọi body (`schemas.ts`)
- [x] 9 route đọc, 9 route lệnh theo `API_ROUTES` + 2 route `/api/admin/*` (reset, tick)
- [x] `OfficeEngine`: `handleOwnerRequest`, `createTask`, `updateTask`, `decideApproval`, `pauseAgent`, `resumeAgent`,
  `sendMessage`, `updateSettings`, `tick`, `generateRoutineWork`, `refreshAgent`, `refreshProjectProgress`
- [x] Luật phê duyệt cho 5 loại; luật tạm dừng/tiếp tục; giới hạn 2 việc đồng thời; QA di chuyển tới phòng ban kiểm định
- [x] Ba bộ não `mock`/`ollama`/`anthropic` với fallback về mock; `isAvailable`
- [x] Dữ liệu mẫu tiếng Việt (10 nhân sự, 15 công việc, 4 phê duyệt, 3 dự án, 10 kết nối, KPI 4 tuần, 2 tin nhắn, 7 hoạt động)
- [x] Lưu trạng thái tệp JSON (`DATA_FILE`), `SEED_RESET`, `SIMULATION=off`
- [x] Kiểm thử engine (7 ca vitest)
- [ ] Route xóa công việc (`DELETE /api/tasks/:id` → `removeTask`)
- [ ] Route tạo/sửa dự án; route cấu hình nhân sự (tên, mô hình)
- [ ] `provider_unavailable`/`rate_limited`/`conflict` chưa được ném ở đâu (đã có mã và bản dịch, dự phòng)
- [ ] Kiểm thử route HTTP (inject Fastify) và kiểm thử `OfficeStore` (persist/loadOrSeed) riêng

---

## 6. Chất lượng

| Hạng mục | Lệnh | Trạng thái |
|---|---|---|
| Kiểu TypeScript strict ở 5 gói | `pnpm typecheck` | [x] 0 lỗi |
| Chuẩn ngôn ngữ | `pnpm lint:i18n` | [x] 0 lỗi, 0 cảnh báo |
| Kiểm thử engine | `pnpm --filter @ads-nolimit/api test` | [x] 7/7 đạt |
| Kiểm thử i18n/glossary | `pnpm --filter @ads-nolimit/i18n test` | [x] 8/8 đạt |
| Kiểm thử giao diện (vitest + jsdom) | `pnpm --filter @ads-nolimit/web test` | [ ] chưa có tệp `*.test.tsx` – vitest thoát mã 1 ("no test files") nên `pnpm test` toàn repo hiện **chưa đạt**; cần thêm kiểm thử cho `selectors.ts`, `applyEvent`, `format.ts`, các component domain |
| Build toàn bộ | `pnpm build` | [~] các gói build được riêng lẻ; chạy lại sau khi gộp các gói giao diện song song |
| Kiểm thử đầu cuối | `pnpm e2e` (`apps/web/e2e/run.mjs`) | [ ] thư mục `apps/web/e2e/` còn trống – cần script khởi động api+web, chụp 15 trang ở 1440×900 và 390×844, kiểm tra overflow và console errors |
| Cổng chất lượng tổng | `pnpm check` | [ ] phụ thuộc hai mục trên |
| Ảnh chụp từng trang được review thủ công (bố cục, tràn chữ, màu) | – | [~] thực hiện theo gói trong quá trình triển khai song song; lưu kết quả vào PR |
| Khả năng tiếp cận: focus-ring, `aria-label` tiếng Việt, tương phản AA, reduced-motion | – | [x] theo `UI_DESIGN_SYSTEM.md` mục 9 |
| Comment mã bằng tiếng Việt ngắn gọn | – | [x] áp dụng trong toàn repo |
| CI chạy `pnpm check` trên mỗi PR | – | [ ] chưa có cấu hình CI trong repo |

---

## 7. Phát hành

- [x] `pnpm build` tạo `apps/api/dist`, `apps/web/dist`, `apps/desktop/dist`
- [x] `pnpm --filter @ads-nolimit/api start` chạy bản build; `pnpm --filter @ads-nolimit/web preview` xem bản build
- [x] Biến môi trường được tài liệu hóa (ARCHITECTURE mục 12, README); khóa API chỉ qua biến môi trường
- [x] Phiên bản sản phẩm hiển thị trong giao diện (`company.version = 'MVP v1.0'`)
- [ ] Phục vụ `apps/web/dist` trực tiếp từ `apps/api` (`@fastify/static` đã có trong dependencies nhưng chưa đăng ký) để chạy
  một tiến trình duy nhất
- [ ] Đóng gói Desktop (installer) và chữ ký mã
- [ ] Ghi chú phát hành (CHANGELOG) tiếng Việt; gắn thẻ `v1.0.0`
- [ ] Hướng dẫn cài Ollama/mô hình đề xuất cho máy doanh nghiệp (README mục nâng cao)
- [ ] Sao lưu/khôi phục `office-state.json`

---

## 8. Checklist cho mỗi tính năng mới

Sao chép vào mô tả PR và đánh dấu đầy đủ trước khi yêu cầu review:

```
- [ ] Đọc docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md và docs/UI_DESIGN_SYSTEM.md trước khi viết
- [ ] Mọi chuỗi qua t()/<Term/>/bilingual(); không hard-code (kể cả title/placeholder/aria-label)
- [ ] Thuật ngữ mới thêm vào packages/i18n/src/glossary.ts; chạy pnpm glossary:docs
- [ ] Khóa mới thêm vào CẢ HAI locale (vi-VN, en-US) cùng cấu trúc
- [ ] Chức vụ/phòng ban/trạng thái dùng termIdFor* hoặc component domain (AgentName, *Badge)
- [ ] Dữ liệu từ backend hiển thị nguyên văn; định danh kỹ thuật không dịch
- [ ] Đọc dữ liệu từ useOfficeStore/useDerived/selectors dùng chung; không giữ bản sao; không refetch sau khi ghi
- [ ] Backend: thay đổi đi qua OfficeStore.upsert*; lỗi ném ApiError với mã trong ApiErrorCode (có bản dịch errors.json)
- [ ] Lỗi giao diện qua <ErrorBanner/>; trạng thái rỗng/đang tải bằng tiếng Việt
- [ ] Dùng token màu/utility (glass, neon-border-*, term-stack); không hard-code hex
- [ ] Kiểm tra 1440×900 và 390×844: không cuộn ngang, không tràn chữ, 0 lỗi console
- [ ] pnpm typecheck · pnpm lint:i18n · pnpm test đạt; cập nhật docs/IMPLEMENTATION_CHECKLIST.md
```

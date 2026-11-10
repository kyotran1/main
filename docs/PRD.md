# Tài liệu yêu cầu sản phẩm – PRD (Product Requirements Document)

**Sản phẩm:** ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI
**Phiên bản tài liệu:** 1.0 · **Phạm vi:** MVP v1.0 (giá trị `APP_VERSION` trong `apps/api/src/seed.ts`)
**Tài liệu liên quan:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) ·
[VIETNAMESE_UI_LANGUAGE_STANDARD.md](./VIETNAMESE_UI_LANGUAGE_STANDARD.md) · [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) ·
[GLOSSARY.md](./GLOSSARY.md)

> Quy ước trong tài liệu: thuật ngữ chuyên ngành tiếng Anh luôn kèm nghĩa tiếng Việt ở lần xuất hiện đầu tiên, ví dụ
> "Dashboard (Bảng điều khiển)". Định danh kỹ thuật (id, enum, route, tên tệp, biến môi trường, tên thương hiệu) giữ nguyên,
> không dịch.

## Mục lục

1. [Tầm nhìn và bối cảnh](#1-tầm-nhìn-và-bối-cảnh)
2. [Người dùng](#2-người-dùng)
3. [Mục tiêu và chỉ số thành công](#3-mục-tiêu-và-chỉ-số-thành-công)
4. [Mô hình AI CEO và năm chức vụ](#4-mô-hình-ai-ceo-và-năm-chức-vụ)
5. [Sơ đồ phòng ban (11 khu)](#5-sơ-đồ-phòng-ban-11-khu)
6. [Quy trình quản trị 6 giai đoạn và luật phê duyệt](#6-quy-trình-quản-trị-6-giai-đoạn-và-luật-phê-duyệt)
7. [Tính năng theo phân hệ](#7-tính-năng-theo-phân-hệ)
8. [Yêu cầu ngôn ngữ bắt buộc](#8-yêu-cầu-ngôn-ngữ-bắt-buộc)
9. [Yêu cầu phi chức năng](#9-yêu-cầu-phi-chức-năng)
10. [Phạm vi MVP v1.0 và lộ trình](#10-phạm-vi-mvp-v10-và-lộ-trình)
11. [Rủi ro và giả định](#11-rủi-ro-và-giả-định)
12. [Thuật ngữ](#12-thuật-ngữ)

---

## 1. Tầm nhìn và bối cảnh

### 1.1 Tầm nhìn

ADS-NOLIMIT AI OFFICE là **trung tâm điều hành** (command center) của một công ty Truyền thông & Marketing được vận hành
bằng **nhân sự AI** (AI Agent – tác tử AI tự chủ). Chủ doanh nghiệp chỉ cần giao yêu cầu bằng tiếng Việt cho AI CEO; hệ thống
tự lập kế hoạch, phân rã công việc, phân công cho các phòng ban AI, thực thi, kiểm định chất lượng và báo cáo lại – toàn bộ
quá trình được nhìn thấy theo thời gian thực trên Dashboard (Bảng điều khiển), Sơ đồ tổ chức và **Văn phòng ảo 3D tương tác**.

Mục tiêu cuối cùng: một chủ doanh nghiệp Việt Nam, không cần biết tiếng Anh chuyên ngành hay kỹ thuật, có thể "đi vào văn
phòng" và điều hành cả công ty marketing AI của mình như điều hành một đội ngũ thật.

### 1.2 Bối cảnh

- Doanh nghiệp vừa và nhỏ ở Việt Nam ngày càng cần năng lực marketing đa kênh (Meta Ads, Google Ads, TikTok Ads, Zalo OA…)
  nhưng không đủ ngân sách cho một đội ngũ đầy đủ (chiến lược, nội dung, quảng cáo, dữ liệu, CSKH, kỹ thuật).
- Mô hình ngôn ngữ lớn (LLM – Large Language Model) đã đủ tốt để đảm nhiệm từng vai trò chuyên môn, nhưng thiếu một **lớp
  quản trị** (ai làm gì, tiến độ ra sao, cái gì cần Owner duyệt) và một **giao diện trực quan** để chủ doanh nghiệp tin tưởng.
- Yêu cầu bảo mật và chi phí dẫn tới kiến trúc **Hybrid Local + Cloud** (kết hợp cục bộ và đám mây): dữ liệu vận hành và
  trạng thái lưu trên máy của doanh nghiệp (Local Runtime – môi trường chạy cục bộ), mô hình AI có thể chạy cục bộ qua
  Ollama hoặc trên đám mây qua Anthropic Claude, chuyển đổi theo từng nhân sự AI.

### 1.3 Nguyên tắc sản phẩm (không thay đổi khi mở rộng)

1. **Tiếng Việt là ngôn ngữ mặc định**; thuật ngữ tiếng Anh luôn kèm nghĩa tiếng Việt (mục 8).
2. **Một nguồn dữ liệu duy nhất** (Single Source of Truth): mọi màn hình đọc cùng một `OfficeSnapshot` (ảnh chụp trạng thái
   văn phòng) từ backend; Dashboard, Sơ đồ tổ chức và Văn phòng 3D không bao giờ lệch số.
3. **Mô hình AI CEO + quy trình 6 giai đoạn + luật phê duyệt** là xương sống nghiệp vụ, đã thống nhất, không thay đổi.
4. **Văn phòng 3D là giao diện vận hành thật**, đồng bộ backend, không phải trang trí.
5. **Kiến trúc Hybrid Local + Cloud** với bộ não mô phỏng (mock) làm dự phòng: hệ thống không bao giờ dừng vì thiếu mô hình.

---

## 2. Người dùng

| Vai trò | Mô tả | Nhu cầu chính |
|---|---|---|
| **Owner – Chủ doanh nghiệp** (người dùng chính, duy nhất trong MVP) | Chủ/giám đốc công ty marketing Việt Nam; dùng máy tính để bàn là chính, đôi khi điện thoại. Không yêu cầu kỹ năng kỹ thuật hay tiếng Anh chuyên ngành. | Giao việc cho AI CEO bằng tiếng Việt; thấy toàn cảnh công ty; duyệt/từ chối kế hoạch, ngân sách, nội dung; theo dõi tiến độ; nhắn tin với từng nhân sự AI; tạm dừng/tiếp tục nhân sự; xem báo cáo KPI (Key Performance Indicator – chỉ số đánh giá hiệu suất). |
| Kỹ sư triển khai / vận hành (người dùng phụ) | Người cài đặt, cấu hình nhà cung cấp mô hình AI, phát triển thêm tính năng. | Lệnh chạy/kiểm tra rõ ràng; tài liệu kiến trúc; checklist ngôn ngữ; cấu hình bằng biến môi trường. |
| Nhân sự AI (tác nhân hệ thống) | AI CEO, AI COO, AI Project Manager, AI Specialist, AI QA Reviewer. | Không phải người dùng, nhưng là "nhân vật" chính được mô hình hóa trong dữ liệu (`Agent`). |

Trong mã nguồn, Owner được định danh kỹ thuật là `'owner'` (`requesterId`, `ChatMessage.from`), tên hiển thị lấy từ
`company.ownerName` (mặc định "Chủ doanh nghiệp").

---

## 3. Mục tiêu và chỉ số thành công

### 3.1 Mục tiêu sản phẩm

| # | Mục tiêu | Thể hiện trong sản phẩm |
|---|---|---|
| G1 | Owner giao một yêu cầu → nhận kế hoạch, công việc con và yêu cầu phê duyệt trong một thao tác | `POST /api/ceo/requests` → `planTask`, công việc con theo phòng ban, `approval` loại `plan`, lời phản hồi tiếng Việt của AI CEO |
| G2 | Mọi màn hình khớp số liệu với nhau theo thời gian thực | Store web duy nhất + bộ chọn (selector) dùng chung; sự kiện `office:event` |
| G3 | Văn phòng 3D phản ánh đúng ai đang làm gì, ở đâu | `Agent.location` do backend quyết định: bàn làm việc, phòng họp, phòng ban đang kiểm định, pantry khi tạm dừng |
| G4 | Giao diện 100 % tiếng Việt, thuật ngữ kèm nghĩa | `pnpm lint:i18n` = 0 lỗi; bảng thuật ngữ dùng chung |
| G5 | Chạy được hoàn toàn cục bộ, không cần khóa API | `AI_PROVIDER=mock` mặc định; trạng thái lưu tệp JSON |

### 3.2 Chỉ số thành công (đo trên MVP)

| Chỉ số | Mục tiêu |
|---|---|
| Thời gian từ khi Owner gửi yêu cầu tới khi thấy kế hoạch và yêu cầu phê duyệt | < 3 giây với bộ não mock; < 60 giây với mô hình thật (giới hạn `AbortSignal.timeout(60_000)` của Ollama) |
| Độ lệch số liệu giữa Tổng quan, Bảng điều khiển, Sơ đồ tổ chức, Văn phòng 3D | 0 (cùng selector) |
| Lỗi chuẩn ngôn ngữ (`pnpm lint:i18n`) | 0 lỗi, 0 cảnh báo |
| Lỗi kiểu (`pnpm typecheck`) và kiểm thử đơn vị (`pnpm test`) | 0 lỗi |
| Lỗi console trên từng trang, ở 1440×900 và 390×844 | 0 |
| Tràn chữ / cuộn ngang ở 390 px | Không có |
| Tốc độ khung hình cảnh 3D (10 nhân sự, 11 phòng) trên máy văn phòng | ≥ 30 fps ở chế độ đầy đủ; chế độ thu nhỏ (mini) dùng `dpr = 1` |
| Khả năng tiếp cận | Điều hướng bàn phím đầy đủ, `aria-label` tiếng Việt, tôn trọng `prefers-reduced-motion` |

---

## 4. Mô hình AI CEO và năm chức vụ

Năm chức vụ (`AgentRole`) với tên song ngữ chuẩn (bảng thuật ngữ `role.*`). Giao diện **luôn** hiển thị qua
`<AgentName agent={...}/>` hoặc `bilingual(termIdForRole(role))`, không gõ tay.

| `role` (id kỹ thuật) | Tên song ngữ chuẩn | Trách nhiệm | Giai đoạn phụ trách (`STAGE_OWNER_ROLE`) | Trong dữ liệu mẫu |
|---|---|---|---|---|
| `ai_ceo` | **AI CEO – Giám đốc điều hành AI** | Tiếp nhận yêu cầu của Owner; lập kế hoạch tổng thể (`planTask`, `stage: 'plan'`); tạo dự án; gửi yêu cầu phê duyệt kế hoạch; phản hồi Owner bằng tiếng Việt; thông báo khi Owner duyệt/từ chối. | `receive`, `plan` | `agent_ceo`, Ban điều hành, mô hình hybrid (Anthropic) |
| `ai_coo` | **AI COO – Giám đốc vận hành AI** | Theo dõi vận hành, đề xuất phân bổ ngân sách (phê duyệt `budget`), tổng hợp báo cáo tuần, "Nhận định của AI COO" trên trang Báo cáo. | `report` | `agent_coo`, báo cáo cho AI CEO |
| `ai_project_manager` | **AI Project Manager – Quản lý dự án AI** | Phân rã kế hoạch thành công việc con, chọn người thực hiện ít việc nhất theo phòng ban (`pickAssignee`/`leastLoaded`), sinh công việc thường kỳ khi văn phòng rảnh (`generateRoutineWork`). | `assign` | `agent_pm`, báo cáo cho AI COO |
| `ai_specialist` | **AI Specialist – Chuyên viên thực thi AI** | Thực thi công việc chuyên môn theo phòng ban (quảng cáo, nội dung, cộng đồng, dữ liệu, kinh doanh, kỹ thuật); tối đa 2 việc chạy đồng thời (`MAX_CONCURRENT_PER_AGENT`). | `execute` | 6 chuyên viên, mỗi người có `displayName` tiếng Việt |
| `ai_qa_reviewer` | **AI QA Reviewer – Nhân viên kiểm định chất lượng AI** | Kiểm định đầu ra khi công việc đạt 100 % (`in_review`); đạt → `completed`; chưa đạt → trả về thực thi (lùi tiến độ 35 điểm, tối thiểu 40 %). Di chuyển tới phòng ban của công việc đang kiểm định (hiển thị trong 3D). | `review` | `agent_qa`, Phòng Chiến lược & Nghiên cứu |

Chuỗi báo cáo (`reportsTo`) trong dữ liệu mẫu: Owner → AI CEO → AI COO → AI Project Manager → các AI Specialist
(marketing, nội dung, cộng đồng, dữ liệu); AI Specialist kinh doanh, kỹ thuật và AI QA Reviewer báo cáo cho AI COO.
Sơ đồ tổ chức dựng cây từ trường này (`selectOrgTree`).

### 4.1 Trạng thái nhân sự AI (`AgentStatus`)

| `status` | Nghĩa (glossary `agent_status.*`) | Khi nào (suy ra bởi `OfficeEngine.refreshAgent`) |
|---|---|---|
| `running` | Đang thực hiện | Có công việc `in_progress`; hoặc QA có công việc `in_review` |
| `waiting` | Đang chờ | Có công việc `needs_approval` / `pending` / `blocked` |
| `active` | Đang hoạt động | Không có việc chạy nhưng là AI CEO / AI COO / AI Project Manager (luôn trực) |
| `idle` | Rảnh | Chuyên viên/QA không có việc |
| `paused` | Tạm dừng | Owner bấm "Tạm dừng" (`POST /api/agents/:id/pause`); không bị ghi đè bởi mô phỏng |
| `error` | Lỗi | Dự phòng cho lỗi nhà cung cấp; mô phỏng bỏ qua nhân sự này |

---

## 5. Sơ đồ phòng ban (11 khu)

Danh sách `DEPARTMENT_IDS` (11 khu) là **nguồn duy nhất cho mặt bằng 3D**: mỗi phòng có `accent` (màu neon) và `bounds`
(vị trí/kích thước trên mặt bằng 28 × 25 m ảo, x từ −14 đến 14, z từ −10 đến 15) trong `apps/api/src/seed.ts`. Frontend
không viết cứng tọa độ phòng.

| `id` | Tên song ngữ chuẩn (`department.*`) | Loại | Màu `accent` | Nhân sự biên chế (dữ liệu mẫu) |
|---|---|---|---|---|
| `executive` | Executive – Ban điều hành | Phòng ban | `#f5b301` | AI CEO, AI COO, AI Project Manager |
| `strategy` | Strategy & Research – Phòng Chiến lược & Nghiên cứu | Phòng ban | `#6366f1` | AI QA Reviewer |
| `marketing` | Marketing – Phòng Marketing (Tiếp thị) | Phòng ban | `#3b82f6` | Chuyên viên Quảng cáo |
| `creative_media` | Creative & Media – Phòng Sáng tạo & Media | Phòng ban | `#a855f7` | Chuyên viên Nội dung & Media |
| `social_community` | Social & Community – Phòng Truyền thông & Cộng đồng | Phòng ban | `#22d3ee` | Chuyên viên Truyền thông & Cộng đồng |
| `data_analytics` | Data & Analytics – Phòng Dữ liệu & Phân tích | Phòng ban | `#10b981` | Chuyên viên Dữ liệu & Phân tích |
| `sales_crm` | Sales & CRM – Phòng Kinh doanh & CRM (Quản lý khách hàng) | Phòng ban | `#f97316` | Chuyên viên Kinh doanh & CRM |
| `tech_automation` | Tech & Automation – Phòng Kỹ thuật & Tự động hóa | Phòng ban | `#ec4899` | Chuyên viên Kỹ thuật & Tự động hóa |
| `meeting_room` | Meeting Room – Phòng họp | **Phòng chức năng** (`functional: true`) | `#64748b` | Không cố định – AI CEO và AI PM vào họp khi lập kế hoạch |
| `reception` | Reception – Sảnh chính (Khu tiếp đón) | **Phòng chức năng** | `#8b5cf6` | Không cố định |
| `pantry` | Pantry & Lounge – Khu giải trí & Pantry | **Phòng chức năng** | `#14b8a6` | Nhân sự bị tạm dừng đứng ở đây |

Bố cục mặt bằng (theo `bounds`): Ban điều hành ở phía sau trung tâm; cột trái gồm Marketing, Sáng tạo & Media, Truyền thông &
Cộng đồng, Phòng họp; cột phải gồm Chiến lược, Kinh doanh & CRM, Dữ liệu & Phân tích, Kỹ thuật & Tự động hóa; Sảnh chính và
Pantry ở phía trước; hành lang trung tâm với hologram (biểu tượng ảnh ba chiều) logo ở giữa – khớp ảnh tham chiếu "Văn phòng ảo 3D".

Vị trí nhân sự trong văn phòng (`AgentLocation`) do **backend** quyết định: `desk` (bàn làm việc), `department` (đang có mặt
ở phòng khác – QA đi kiểm định), `meeting_room`, `reception`, `pantry`.

---

## 6. Quy trình quản trị 6 giai đoạn và luật phê duyệt

### 6.1 Sáu giai đoạn (`WORKFLOW_STAGES`)

```
Tiếp nhận (receive) → Lập kế hoạch (plan) → Phân công (assign) → Thực thi (execute) → Kiểm định (review) → Báo cáo (report)
      AI CEO              AI CEO              AI Project Manager     AI Specialist        AI QA Reviewer        AI COO
```

| Giai đoạn | Điều gì xảy ra trong engine (`apps/api/src/engine/OfficeEngine.ts`) | Trạng thái công việc điển hình |
|---|---|---|
| `receive` | Owner gửi yêu cầu (`handleOwnerRequest`) hoặc tạo công việc chưa giao (`createTask` không có `assigneeId`). Ghi `owner_request`, lưu tin nhắn của Owner. | `not_started` |
| `plan` | AI CEO và AI PM vào phòng họp; bộ não (`AgentBrain.planRequest`) trả về `PlanDraft` (tiêu đề, tóm tắt, dàn ý, công việc con, có cần phê duyệt). Tạo dự án mới (`status: 'planning'`) và `planTask` (`progress: 100`, `focus: true`). | `needs_approval` (mặc định) hoặc `in_progress` |
| `assign` | AI PM tạo công việc con theo phòng ban, chọn người ít việc nhất; nếu cần phê duyệt thì con ở `pending`, ngược lại khởi động ngay (`startQueuedTasks`). | `pending` / `not_started` |
| `execute` | Mỗi nhịp mô phỏng (`tick`, mặc định 5 giây) chuyên viên tiến 1–4 % (ưu tiên cao) hoặc 1–3 %; tối đa 2 việc/nhân sự; việc trễ hạn → `overdue`. | `in_progress` |
| `review` | Đạt 100 % → `in_review`, QA di chuyển tới phòng ban của công việc; mỗi nhịp có xác suất 12 % hoàn tất kiểm định (`reviewTask`). | `in_review` |
| `report` | Đạt → `completed`, `tasksCompleted` của người thực hiện +1, dự án tính lại tiến độ (trung bình tiến độ các việc) và trạng thái (`completed` khi tất cả xong). | `completed` |

### 6.2 Luật phê duyệt (`ApprovalType` × quyết định của Owner)

Chỉ Owner quyết định phê duyệt (`POST /api/approvals/:id/approve|reject`, kèm `note` tùy chọn). Một yêu cầu chỉ được quyết định
**một lần**; lần hai trả lỗi `approval_already_decided` (HTTP 409).

| Loại (`approval_type.*`) | Ai yêu cầu | Khi **duyệt** | Khi **từ chối** |
|---|---|---|---|
| `plan` – Phê duyệt kế hoạch | AI CEO, tự động sau mỗi yêu cầu của Owner (bộ não mock luôn đặt `approvalRequired: true`) | `planTask` → `completed` (`stage: 'assign'`); công việc con được khởi động; dự án → `active`; AI CEO nhắn cảm ơn Owner | `planTask` → `pending` (`stage: 'plan'`, `focus`); mọi công việc con → `blocked`; AI CEO nhắn ghi nhận lý do và hứa gửi lại phương án |
| `budget` – Phê duyệt ngân sách | AI COO (có `amountVnd`) | Công việc liên quan → `completed` (`stage: 'report'`) | Công việc → `pending`, con (nếu có) → `blocked` |
| `content` – Phê duyệt nội dung | AI Specialist | Như `budget` | Như `budget` |
| `publish` – Phê duyệt xuất bản | (dự phòng, chưa có trong dữ liệu mẫu) | Như `budget` | Như `budget` |
| `connector` – Cấp quyền kết nối | AI Specialist kỹ thuật | Công việc → `in_progress` (`stage: 'execute'`); các công cụ kết nối của người thực hiện → `connected: true`, `lastSyncAt` cập nhật | Công việc → `pending`, con → `blocked` |

Sau mọi quyết định: ghi hoạt động `approval_decided` (mẫu `approval_approved` / `approval_rejected`), làm mới trạng thái người
thực hiện và người yêu cầu, tính lại tiến độ dự án.

### 6.3 Luật tạm dừng / tiếp tục nhân sự

- **Tạm dừng** (`pauseAgent`): `status: 'paused'`, rời bàn tới `pantry`, mọi công việc `in_progress` → `pending`; mô phỏng bỏ qua
  nhân sự này. Giao việc mới hoặc gửi yêu cầu cho AI CEO đang tạm dừng → lỗi `agent_paused` (409). Nhắn tin cho nhân sự tạm
  dừng vẫn được nhưng nhận câu trả lời cố định "đang ở trạng thái tạm dừng".
- **Tiếp tục** (`resumeAgent`): `status: 'idle'`, về bàn, các việc `pending` ở giai đoạn `execute` được khởi động lại theo giới
  hạn 2 việc đồng thời.

---

## 7. Tính năng theo phân hệ

Mỗi phân hệ là một tuyến đường (route) trong `apps/web/src/app/routes.ts`; tiêu đề trang dùng `termId` trong bảng thuật ngữ.
Mọi phân hệ đọc dữ liệu từ store duy nhất (`useOfficeStore` + `useDerived` + `src/store/selectors.ts`) và ghi qua
`src/lib/api.ts`; sau khi ghi **không** tải lại – store tự cập nhật qua realtime.

Ký hiệu: **US** = user story (câu chuyện người dùng), **AC** = acceptance criteria (tiêu chí chấp nhận).

### 7.1 Tổng quan – Overview (`/`, `module.overview`)

Bức tranh toàn cảnh hôm nay (ảnh tham chiếu "trang Tổng quan").

- US-OV1: Là Owner, tôi muốn thấy ngay 5 con số đầu trang – Nhân sự AI, Đang thực hiện, Đã hoàn thành, Đang chờ, Cần phê duyệt –
  để biết công ty đang ra sao.
- US-OV2: Tôi muốn thấy văn phòng 3D thu nhỏ đang "sống" và một nút vào văn phòng đầy đủ.
- US-OV3: Tôi muốn thấy lưới "Chức năng chính", danh sách "Công việc trọng tâm hôm nay", "Hoạt động AI gần đây" và vòng
  "Tiến độ công việc tổng quan".
- AC: Số liệu lấy từ `selectHeadlineStats`, `selectTodaysKeyTasks(limit)`, `selectRecentActivities(limit)`, `selectTaskCounts`
  và **bằng đúng** số trên Bảng điều khiển/Topbar. Thẻ 3D thu nhỏ dùng `<OfficeScene mode="mini"/>`. Bấm một công việc mở ngăn
  chi tiết dùng chung (`selectTask`). Có trạng thái đang tải (`PageLoading`) và rỗng bằng tiếng Việt.

### 7.2 Bảng điều khiển – Dashboard (`/dashboard`, `module.dashboard`)

- US-DB1: Tôi muốn xem KPI marketing (tăng trưởng khách hàng tiềm năng, tỷ lệ chuyển đổi, chi phí/khách hàng tiềm năng, ROI –
  Return on Investment – hiệu suất đầu tư) và biểu đồ hiệu suất theo tuần.
- US-DB2: Tôi muốn thấy phân bố trạng thái công việc, luồng 6 giai đoạn (số việc mở mỗi giai đoạn), lưới nhân sự AI và các
  phê duyệt đang chờ để duyệt nhanh.
- AC: KPI từ `store.kpis` (`KpiSummary`); nhãn kỳ `W1..W4` được dịch "Tuần 1..4" (`common:time.week`); biểu đồ dùng
  `features/dashboard/chartTheme.ts` (token màu), tooltip tiếng Việt; giai đoạn từ `selectStageCounts`; duyệt nhanh gọi
  `api.decideApproval`; mọi lỗi hiển thị bằng `<ErrorBanner/>`.

### 7.3 Văn phòng ảo 3D tương tác – Virtual Office 3D (`/office`, `module.virtual_office_3d`)

Đồng bộ backend, là giao diện vận hành (ảnh tham chiếu "Văn phòng ảo 3D").

- US-3D1: Tôi muốn thấy 11 khu với bảng tên song ngữ, nhân sự AI đứng đúng bàn hoặc đang di chuyển (vào phòng họp khi lập kế
  hoạch, QA sang phòng ban khi kiểm định, ra pantry khi tạm dừng), màn hình bàn sáng khi đang làm việc, vòng trạng thái đổi
  màu theo `AgentStatus`.
- US-3D2: Tôi muốn bấm vào một nhân sự để mở hồ sơ (ngăn chi tiết), bấm vào phòng để xem bảng phòng ban (nhân sự, công việc,
  khách đang có mặt), lọc theo phòng ban, bật/tắt nhãn, đặt lại góc nhìn, toàn màn hình.
- US-3D3: Từ hồ sơ nhân sự ở bất kỳ trang nào, tôi muốn bấm "Đưa camera tới" để camera 3D bay tới người đó.
- US-3D4: Cột phải hiển thị thống kê, luồng quy trình, hàng chờ phê duyệt (duyệt/từ chối tại chỗ), nhật ký hoạt động và ô trạng
  thái công việc – cùng số với các trang khác.
- AC: Cảnh đọc `store.departments` (bounds/accent) và `store.agents` (desk/location) – không có tọa độ phòng viết cứng
  (`scene/layout.ts`). Mỗi hình nhân sự chỉ đăng ký lát `agents[id]`. Di chuyển nội suy trong `useFrame`, không `setState`.
  Tôn trọng `prefers-reduced-motion`. Có `SceneErrorBoundary` với thông báo tiếng Việt khi WebGL (giao diện đồ họa trong
  trình duyệt) không khả dụng. Nhãn 3D rút gọn (`short`) luôn có tooltip "EN – VI". Chế độ `mini` (Tổng quan, Trung tâm AI
  CEO) camera cố định, `dpr = 1`, vẫn cập nhật realtime. Camera ưu tiên: `cameraFocusAgentId` → phòng ban đang lọc → góc
  nhìn mặc định.

### 7.4 Trung tâm điều hành AI CEO – AI CEO Command Center (`/ceo`, `module.ceo_command_center`)

Ảnh tham chiếu "Trung tâm điều hành AI CEO".

- US-CEO1: Tôi muốn gõ yêu cầu bằng tiếng Việt (chọn mức ưu tiên) và nhận ngay kế hoạch tóm tắt, công việc con, yêu cầu phê
  duyệt và lời phản hồi của AI CEO.
- US-CEO2: Tôi muốn xem hội thoại với AI CEO, văn phòng 3D thu nhỏ, bảng công việc, KPI, biểu đồ marketing, báo cáo nhanh,
  dải "Agent Registry" (Danh sách nhân sự AI) và các công cụ kết nối.
- AC: Gửi qua `api.createCeoRequest({ text, priority })` (`text` 3–4000 ký tự, kiểm tra bằng zod – thư viện kiểm tra dữ liệu);
  hội thoại từ `selectMessagesForAgent(ceo.id)`; lỗi `agent_paused` hiển thị tiếng Việt kèm gợi ý "Tiếp tục". Tin nhắn/tiêu đề do
  Agent tạo hiển thị nguyên văn (dữ liệu, không qua locale).

### 7.5 Sơ đồ tổ chức – Organization Chart (`/org-chart`, `module.org_chart`)

- US-OC1: Tôi muốn thấy cây báo cáo Owner → AI CEO → AI COO → … với từng thẻ có tên song ngữ, phòng ban, trạng thái, số việc
  đang mở; và chế độ xem theo phòng ban.
- AC: Cây từ `selectOrgTree` (xử lý `reportsTo` không tồn tại thành gốc); số việc từ cùng selector với trang Nhân sự AI; bấm thẻ
  mở ngăn hồ sơ; không cuộn ngang ở 390 px (cây thu gọn/cuộn trong khung).

### 7.6 Quản lý công việc – Task Management (`/tasks`, `module.task_management`)

- US-TM1: Tôi muốn thống kê theo trạng thái, tìm kiếm, lọc (trạng thái, ưu tiên, phòng ban, người phụ trách), sắp xếp, chuyển
  giữa Bảng ⇄ Kanban (bảng thẻ kéo thả theo trạng thái) ⇄ danh sách thẻ trên điện thoại.
- US-TM2: Tôi muốn tạo công việc mới (tiêu đề, mô tả, người phụ trách, ưu tiên, hạn, dự án, phòng ban) và sửa công việc trong
  ngăn chi tiết (trạng thái, phụ trách, ưu tiên, tiến độ, trọng tâm, hạn).
- AC: `api.createTask` (tiêu đề 2–300 ký tự) và `api.updateTask` (`UpdateTaskBody`); giao cho nhân sự tạm dừng → lỗi
  `agent_paused` hiển thị tiếng Việt; huy hiệu dùng `TaskStatusBadge`, `PriorityBadge`, `StageBadge`; ngăn chi tiết dùng chung
  (`TaskDetailDrawer` trong `AppShell`).

### 7.7 Dự án & Chiến dịch – Projects & Campaigns (`/projects`, `module.projects_campaigns`)

- US-PJ1: Tôi muốn thấy danh sách dự án (tên, mục tiêu, trạng thái, chủ trì, phòng ban tham gia, tiến độ, ngân sách VNĐ, thời
  gian) và lọc theo trạng thái (`planning`, `active`, `on_hold`, `completed`).
- AC: Tiến độ dự án do backend tính (`refreshProjectProgress`); tiền tệ qua `formatVnd`; trạng thái qua `termIdForProjectStatus`;
  dự án mới tự xuất hiện khi AI CEO lập kế hoạch (`project.upserted`).

### 7.8 Nhân sự AI / Agent Registry (`/agents`, `/agents/:agentId`, `module.ai_agents`)

- US-AG1: Tôi muốn thấy thống kê theo trạng thái, lọc theo vai trò/phòng ban/trạng thái, lưới thẻ theo phòng ban (tên song ngữ,
  hiệu suất, số việc mở, mô hình đang dùng: `provider`/`model`/`mode`).
- US-AG2: Trong hồ sơ (ngăn chi tiết), tôi muốn xem kỹ năng, công cụ kết nối, khối lượng công việc, giao việc nhanh, nhắn tin và
  nhận phản hồi tiếng Việt, tạm dừng/tiếp tục, đưa camera 3D tới.
- AC: URL `/agents/:agentId` tự mở ngăn; `api.sendAgentMessage` (1–4000 ký tự) trả `{ owner, reply }`; `api.pauseAgent` /
  `api.resumeAgent`; `displayName` (dữ liệu do Owner đặt) hiển thị nguyên văn, chức vụ luôn song ngữ qua `<AgentName/>`.

### 7.9 Quy trình – Workflow (`/workflow`, `module.workflow`)

- US-WF1: Tôi muốn thấy sơ đồ 6 giai đoạn với số việc đang mở và vai trò phụ trách mỗi giai đoạn, danh sách việc theo giai
  đoạn, luật quản trị (phê duyệt, tạm dừng, giới hạn đồng thời) và dòng chảy gần đây.
- AC: Từ `selectStageCounts`, `STAGE_OWNER_ROLE`, `WORKFLOW_STAGES`; nhãn giai đoạn `termIdForStage`; văn bản luật quản trị
  nằm trong locale `workflow`, phản ánh đúng mục 6 của tài liệu này.

### 7.10 Trung tâm phê duyệt – Approval Center (`/approvals`, `module.approval_center`)

- US-AP1: Tôi muốn thấy các yêu cầu đang chờ (loại, tiêu đề, tóm tắt, người đề xuất, số tiền, công việc/dự án liên quan, thời
  gian), bấm Duyệt/Từ chối kèm ghi chú, và lịch sử đã quyết định.
- AC: `api.decideApproval(id, 'approve'|'reject', { note })` (`note` ≤ 2000 ký tự); sau quyết định thẻ tự chuyển sang lịch sử
  (sự kiện `approval.upserted`); lỗi `approval_already_decided` hiển thị tiếng Việt; số "Cần phê duyệt" ở Topbar/Tổng quan giảm
  tương ứng (`selectPendingApprovals`).

### 7.11 Kỹ năng & Kết nối – Skill & Connector (`/connectors`, `module.skill_connector`)

- US-SC1: Tôi muốn thấy thống kê kết nối, nhóm công cụ theo danh mục (`ads`, `storage`, `analytics`, `crm`, `communication`,
  `ai_model`) với trạng thái đã kết nối/chưa, chế độ Local/Cloud, lần đồng bộ cuối, và bảng kỹ năng toàn đội (mức thành thạo
  trung bình, người sở hữu).
- AC: Tên thương hiệu (`vendor`: Meta Ads, Google Ads, TikTok Ads, Google Drive, Google Analytics, Zalo OA, HubSpot CRM, Canva,
  Ollama, Anthropic Claude) **không dịch**; danh mục qua glossary `connector_category.*`; kỹ năng có nhãn tiếng Việt
  (`connectors:skills.<id>`, dự phòng là id). MVP chỉ đọc; cấp quyền kết nối đi qua phê duyệt loại `connector`.

### 7.12 Nhật ký hoạt động – Activity Log (`/activity`, `module.activity_log`)

- US-AL1: Tôi muốn dòng thời gian đầy đủ (nhóm Hôm nay/Hôm qua), lọc theo nhân sự, loại sự kiện, từ khóa; tải thêm; chỉ báo
  trạng thái realtime.
- AC: Mỗi `ActivityEvent` được hiển thị bằng mẫu `activity:templates.<templateKey>` với tham số (`agent` → tên song ngữ, `title`,
  `count`, `progress`); `text` do Agent viết hiển thị nguyên văn; store giữ tối đa 300 hoạt động (backend 500).

### 7.13 Báo cáo & Phân tích – Reports & Analytics (`/reports`, `module.reports_analytics`)

- US-RP1: Tôi muốn KPI theo kỳ, biểu đồ KPI tuần, công việc theo phòng ban, hiệu suất nhân sự, bảng tổng hợp phòng ban, nhận
  định của AI COO và xuất dữ liệu (JSON toàn bộ ảnh chụp, CSV bảng công việc).
- AC: Xuất tệp hoàn toàn phía trình duyệt (`ExportMenu`, không gọi máy chủ); biểu đồ dùng `features/reports/chartTheme.ts`; số
  liệu phòng ban từ `selectDepartmentSummary`.

### 7.14 Kho tri thức – Knowledge Base (`/knowledge`, `module.knowledge_base`)

- US-KB1: Tôi muốn đọc giới thiệu hệ thống, quy trình 6 giai đoạn, năm chức vụ, hướng dẫn bắt đầu nhanh, bảng thuật ngữ đầy đủ
  (tìm kiếm, lọc theo nhóm) và câu hỏi thường gặp – tất cả bằng tiếng Việt, có mục lục bám cuộn (`#hash`).
- AC: Bảng thuật ngữ đọc trực tiếp `listGlossary()` (không sao chép); mục (`intro`, `workflow`, `roles`, `quickstart`,
  `glossary`, `faq`) là id kỹ thuật, nhãn từ `knowledge:sections.<id>`.

### 7.15 Cài đặt – Settings (`/settings`, `module.settings`)

- US-ST1: Tôi muốn đổi chế độ vận hành (Local/Cloud/Hybrid), ngôn ngữ giao diện (vi-VN mặc định, en-US bản xem trước), tên
  công ty/tên Owner; xem trạng thái kết nối hệ thống nền (số hiệu bản dữ liệu, thời điểm cập nhật), làm mới dữ liệu, đặt lại dữ
  liệu mẫu (có xác nhận); đọc tóm tắt chuẩn ngôn ngữ.
- AC: `api.updateSettings` (`UpdateSettingsBody`, tên 1–120 ký tự) → backend phát `snapshot`; đổi ngôn ngữ lưu
  `localStorage['ads-nolimit.locale']`, không tự suy từ trình duyệt; đặt lại gọi `POST /api/admin/reset`.

### 7.16 Khung ứng dụng (dùng chung mọi trang)

Thanh bên (Sidebar) nhóm 4 mục `operate` / `manage` / `insight` / `system` với nhãn xếp chồng (tiếng Việt chính, tiếng Anh
phụ), chân hiển thị phiên bản và chế độ; Topbar (thanh trên) với lời chào Owner, ô tìm kiếm, hai chỉ số nhanh (việc đang chạy,
cần phê duyệt), chuông thông báo, trợ giúp, cài đặt; `ConnectionBanner` (dải cảnh báo kết nối) khi mất đồng bộ; hai ngăn chi
tiết dùng chung `AgentDetailDrawer` và `TaskDetailDrawer` gắn sẵn trong `AppShell`; liên kết "Bỏ qua tới nội dung chính".

### 7.17 Ứng dụng máy tính – Desktop (Electron)

Gói `apps/desktop` tải giao diện Web (dev: `ADS_NOLIMIT_WEB_URL`; prod: `apps/web/dist/index.html`), menu ứng dụng và hộp thoại
dùng **cùng từ điển** `@ads-nolimit/i18n` (nhãn menu "Cài đặt hệ thống – Settings"), đổi ngôn ngữ từ menu, cầu nối
`window.adsNolimitDesktop` (platform, version, get/setLocale).

---

## 8. Yêu cầu ngôn ngữ bắt buộc

Tóm tắt của [docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md](./VIETNAMESE_UI_LANGUAGE_STANDARD.md) – tài liệu đó là nguồn chuẩn;
khi lệch nhau, tài liệu đó thắng.

| # | Yêu cầu | Cách kiểm tra |
|---|---|---|
| L1 | Toàn bộ giao diện tiếng Việt (vi-VN) mặc định; en-US dự phòng. Mọi chuỗi hiển thị qua `t('ns:key')`, `<Term id/>`, `bilingual()`; không hard-code trong JSX kể cả `title`/`placeholder`/`aria-label`. | `pnpm lint:i18n` (lỗi `hardcoded-jsx`, `hardcoded-attr`, `missing-key`) |
| L2 | Thuật ngữ chuyên ngành tiếng Anh luôn kèm nghĩa tiếng Việt: một dòng "Dashboard – Bảng điều khiển", xếp chồng (tiếng Việt chính, tiếng Anh phụ nhỏ hơn) hoặc tooltip "EN – VI". Không có nhãn chỉ tiếng Anh chuyên ngành. | `lint:i18n` (`vi-only-term`, `vi-suspect`); kiểm tra thủ công ảnh chụp |
| L3 | Chức vụ luôn song ngữ chuẩn: AI CEO – Giám đốc điều hành AI; AI COO – Giám đốc vận hành AI; AI Project Manager – Quản lý dự án AI; AI Specialist – Chuyên viên thực thi AI; AI QA Reviewer – Nhân viên kiểm định chất lượng AI. | Dùng `<AgentName/>`/`termIdForRole`; kiểm thử `roleTitle` trong `packages/i18n` |
| L4 | Không dịch định danh kỹ thuật (id, enum, route, JSON key, tên API, tên thương hiệu). | Review mã; `BRAND_ALLOW` trong lint |
| L5 | Dữ liệu do Agent tạo (tiêu đề công việc, tin nhắn, báo cáo, `displayName`) là DỮ LIỆU từ backend – hiển thị nguyên văn, không nằm trong tệp locale. | Review mã |
| L6 | Không tràn chữ khi song ngữ: `truncate`/`line-clamp`, `term-stack`/`term-primary`/`term-secondary`; kiểm tra ở 390 px. | Ảnh chụp 390×844, script đo overflow |
| L7 | Thông báo lỗi dùng `<ErrorBanner error={err}/>` – diễn giải tiếng Việt theo mã lỗi (`errors:codes.<code>`). | Review mã; kiểm thử `describeError` |
| L8 | Hai tệp locale `vi-VN` và `en-US` có cùng tập khóa ở mọi namespace; thuật ngữ mới thêm vào `packages/i18n/src/glossary.ts` rồi chạy `pnpm glossary:docs`. | `lint:i18n` (`parity`), kiểm thử `glossary.test.ts` |
| L9 | Đầu ra của AI Agent dành cho Owner bằng tiếng Việt, thuật ngữ kèm giải thích (prompt hệ thống `SYSTEM_VI`). | Kiểm thử engine; review prompt |

---

## 9. Yêu cầu phi chức năng

| Nhóm | Yêu cầu |
|---|---|
| **Kiến trúc Hybrid Local + Cloud** | Local Runtime = `apps/api` (Fastify + Socket.IO + tệp JSON trạng thái) chạy trên máy doanh nghiệp. Bộ não AI chọn bằng `AI_PROVIDER`: `mock` (mặc định, không cần mạng/khóa), `ollama` (cục bộ), `anthropic` (đám mây). Mọi lựa chọn tự quay về mock khi mô hình không khả dụng hoặc đầu ra sai định dạng. Không thay đổi kiến trúc này khi mở rộng. |
| **Dữ liệu một nguồn** | Backend: mọi thay đổi qua `OfficeStore.upsert*` (tăng `revision`, phát sự kiện, lưu đĩa debounce 400 ms). Frontend: một store zustand; selector tạo object mới phải qua `useDerived`; không trang nào giữ bản sao dữ liệu. |
| **Realtime** | Socket.IO sự kiện `office:event`; client nhận `snapshot` khi kết nối, gửi `office:hello { revision }` để đối chiếu; bỏ qua sự kiện có `revision` cũ hơn; mất kết nối → polling `GET /api/state` mỗi 15 giây, tự kết nối lại (1–8 giây). |
| **Hiệu năng 3D** | Camera trực giao isometric; `dpr` 1–1.5 (đầy đủ) / 1 (mini); mỗi hình nhân sự chỉ đăng ký lát dữ liệu riêng; nhãn DOM bám theo bus; chuyển sang nhãn rút gọn khi < 16,5 px/m; `three`/`drei`/`fiber` tách chunk riêng khi build. |
| **Responsive** | Desktop ≥ 1280, tablet, điện thoại 390 px: không cuộn ngang, chữ chú thích đọc được; Sidebar thành ngăn trượt; bảng chuyển sang thẻ. |
| **Khả năng tiếp cận** | Tương phản WCAG 2.1 AA trên nền `bg-panel`; focus-ring; `aria-label` tiếng Việt; `prefers-reduced-motion` tắt nhấp nhô/xoay trong 3D; liên kết bỏ qua nội dung. |
| **Bảo mật** | Khóa API chỉ qua biến môi trường (`ANTHROPIC_API_KEY`), không nằm trong mã hay tệp trạng thái; backend lắng nghe `127.0.0.1` mặc định; Electron `contextIsolation: true`, `nodeIntegration: false`; các route `/api/admin/*` chỉ dùng cho phát triển/demo. |
| **Độ tin cậy** | Tệp trạng thái hỏng → dựng lại từ seed; tắt máy chủ (SIGINT/SIGTERM) lưu ngay `persistNow()`; validation bằng zod trả `validation_failed` (400) kèm chi tiết. |
| **Chất lượng mã** | TypeScript strict (`noUncheckedIndexedAccess`), `pnpm typecheck`, `pnpm lint:i18n`, `pnpm test`, `pnpm build` gộp trong `pnpm check`. Comment mã bằng tiếng Việt ngắn gọn. |

---

## 10. Phạm vi MVP v1.0 và lộ trình

### 10.1 Trong phạm vi MVP v1.0

- 15 phân hệ ở mục 7 trên Web; ứng dụng Desktop (Electron) bọc Web, dùng chung từ điển.
- Backend cục bộ với dữ liệu mẫu tiếng Việt: 10 nhân sự AI, 15 công việc, 4 phê duyệt, 3 dự án, 10 công cụ kết nối, KPI 4 tuần,
  2 tin nhắn, 7 hoạt động; mô phỏng tiến độ tự động và sinh việc thường kỳ.
- Ba bộ não: mock (mặc định), Ollama, Anthropic Claude (qua `@anthropic-ai/sdk`), có dự phòng.
- Chuẩn ngôn ngữ tiếng Việt + công cụ kiểm tra tự động + bảng thuật ngữ sinh tài liệu.
- Một Owner, không xác thực, không phân quyền, lưu trữ tệp JSON.

### 10.2 Ngoài phạm vi MVP (lộ trình)

| Giai đoạn | Nội dung |
|---|---|
| v1.1 | Kiểm thử giao diện (vitest + jsdom) và e2e (`apps/web/e2e/run.mjs`) đủ các trang; ảnh chụp tự động 1440/390; CI chạy `pnpm check`. |
| v1.2 | Cơ sở dữ liệu thật (SQLite/PostgreSQL) thay tệp JSON, giữ nguyên hợp đồng `OfficeStore`; lịch sử phiên bản ảnh chụp. |
| v1.3 | Xác thực Owner (đăng nhập), nhiều Owner/nhiều công ty (`company` thành thực thể đa bản ghi), phân quyền duyệt. |
| v1.4 | Công cụ kết nối thật (OAuth Meta/Google/TikTok, Zalo OA webhook) thay dữ liệu mô phỏng `Connector`; phê duyệt `publish` dùng thật. |
| v1.5 | Lập lịch báo cáo tuần tự động, thông báo đẩy (desktop), xuất PDF báo cáo tiếng Việt. |
| Sau đó | Thị trường kỹ năng (skill) cho nhân sự AI; tùy biến mặt bằng văn phòng; chế độ nhiều văn phòng. |

---

## 11. Rủi ro và giả định

### 11.1 Giả định

- Owner dùng trình duyệt hiện đại hỗ trợ WebGL (khi không có, cảnh 3D hiển thị thông báo tiếng Việt, các trang khác vẫn hoạt động).
- Máy doanh nghiệp đủ chạy Node ≥ 20; nếu dùng Ollama cần GPU/CPU phù hợp mô hình (`qwen2.5:14b` mặc định).
- Một phiên bản backend phục vụ một văn phòng; không có truy cập đồng thời từ nhiều Owner.

### 11.2 Rủi ro và biện pháp

| Rủi ro | Ảnh hưởng | Biện pháp trong thiết kế |
|---|---|---|
| Mô hình AI trả lời sai định dạng/không bằng tiếng Việt | Kế hoạch sai, trải nghiệm kém | `LlmBrain` kiểm tra JSON và `departmentId` hợp lệ, quay về `MockBrain`; prompt hệ thống bắt buộc tiếng Việt |
| Lệch số liệu giữa các trang | Mất niềm tin | Selector dùng chung, cấm bản sao dữ liệu, review theo checklist |
| Tràn chữ song ngữ trên màn hình hẹp | Khó đọc | Quy tắc `term-stack`/`truncate`, kiểm tra 390 px bắt buộc trước PR |
| Rò rỉ khóa API | Bảo mật | Khóa chỉ qua biến môi trường; không log; `.env` bị bỏ qua trong git |
| Tệp trạng thái lớn dần | Hiệu năng | Giới hạn 500 hoạt động / 1000 tin nhắn phía backend; lộ trình DB thật |
| Hard-code chữ tiếng Anh khi thêm tính năng | Vi phạm chuẩn | `pnpm lint:i18n` chặn PR; CLAUDE.md quy định bắt buộc |
| Hiệu năng 3D trên máy yếu | Giật, nóng máy | Camera trực giao, `dpr` giới hạn, reduced-motion, chế độ mini |

---

## 12. Thuật ngữ

Bảng thuật ngữ đầy đủ (hơn 200 mục, sinh tự động) tại [docs/GLOSSARY.md](./GLOSSARY.md). Một số thuật ngữ dùng trong tài liệu này:

| Thuật ngữ | Nghĩa tiếng Việt / giải thích |
|---|---|
| AI Agent | Nhân sự AI – tác tử AI tự chủ đảm nhiệm một chức vụ |
| Owner | Chủ doanh nghiệp – người dùng duy nhất của MVP |
| Single Source of Truth | Nguồn dữ liệu duy nhất – một `OfficeSnapshot`, một store |
| OfficeSnapshot | Ảnh chụp toàn bộ trạng thái văn phòng (công ty, phòng ban, nhân sự, công việc, phê duyệt, hoạt động, dự án, kết nối, KPI, tin nhắn, `revision`) |
| Realtime / WebSocket | Thời gian thực / kênh đồng bộ hai chiều (Socket.IO, sự kiện `office:event`) |
| Hybrid Local + Cloud | Kết hợp cục bộ và đám mây – backend và dữ liệu trên máy, mô hình AI cục bộ (Ollama) hoặc đám mây (Anthropic) |
| Local Runtime | Môi trường chạy cục bộ – `apps/api` |
| Mock | Mô phỏng – bộ não không cần mô hình thật |
| Workflow Stage | Giai đoạn quy trình – `receive`, `plan`, `assign`, `execute`, `review`, `report` |
| Approval | Yêu cầu phê duyệt – `plan`, `budget`, `content`, `publish`, `connector` |
| Connector | Công cụ kết nối – Meta Ads, Google Ads, TikTok Ads, Zalo OA, Google Drive… |
| KPI / ROI / CPL | Chỉ số đánh giá hiệu suất / hiệu suất đầu tư / chi phí trên mỗi khách hàng tiềm năng |
| Kanban | Bảng thẻ theo cột trạng thái |
| Selector | Bộ chọn – hàm tính dữ liệu dẫn xuất từ store |
| Glossary | Bảng thuật ngữ dùng chung (`packages/i18n/src/glossary.ts`) |

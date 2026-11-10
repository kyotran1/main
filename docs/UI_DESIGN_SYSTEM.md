# Hệ thống thiết kế giao diện – UI Design System

> Tài liệu chuẩn thiết kế của ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI. Mọi màn hình Web, Desktop và cảnh
> Văn phòng ảo 3D phải dùng đúng token (biến thiết kế), thành phần (component) và quy tắc trong tài liệu này.
> Các giá trị dưới đây được trích **nguyên văn** từ mã nguồn: `apps/web/src/styles/index.css` (token Tailwind v4),
> `apps/web/src/components/**` (thành phần dùng chung), `apps/web/src/lib/colors.ts` (ánh xạ enum → token),
> `apps/web/src/features/office3d/**` (cảnh 3D), `apps/web/src/features/dashboard/chartTheme.ts` (biểu đồ).
>
> Phiên bản: 1.0 · Tài liệu liên quan: [`VIETNAMESE_UI_LANGUAGE_STANDARD.md`](./VIETNAMESE_UI_LANGUAGE_STANDARD.md)
> (chuẩn ngôn ngữ – bắt buộc đọc trước) · [`GLOSSARY.md`](./GLOSSARY.md) (bảng thuật ngữ).

---

## Mục lục

1. [Triết lý thiết kế](#1-triết-lý-thiết-kế)
2. [Token màu](#2-token-màu)
3. [Typography – Kiểu chữ](#3-typography--kiểu-chữ)
4. [Lưới, khoảng cách và lớp](#4-lưới-khoảng-cách-và-lớp)
5. [Thành phần dùng chung](#5-thành-phần-dùng-chung)
6. [Văn phòng ảo 3D](#6-văn-phòng-ảo-3d)
7. [Biểu đồ – Data Visualization](#7-biểu-đồ--data-visualization)
8. [Chuyển động và giảm chuyển động](#8-chuyển-động-và-giảm-chuyển-động)
9. [Khả năng tiếp cận – Accessibility](#9-khả-năng-tiếp-cận--accessibility)
10. [Responsive – Bố cục theo kích thước màn hình](#10-responsive--bố-cục-theo-kích-thước-màn-hình)
11. [Nguyên tắc dữ liệu](#11-nguyên-tắc-dữ-liệu)
12. [Checklist review thiết kế](#12-checklist-review-thiết-kế)
13. [Phụ lục – Mẫu mã nguồn](#13-phụ-lục--mẫu-mã-nguồn)

---

## 1. Triết lý thiết kế

Ba ảnh tham chiếu (trang Tổng quan, Văn phòng ảo 3D, Trung tâm điều hành AI CEO) xác lập một **không gian điều hành
tương lai**: phòng điều khiển tối của một công ty vận hành bằng nhân sự AI. Bốn trụ cột:

| Trụ cột | Ý nghĩa | Thể hiện trong mã |
|---|---|---|
| **Kính + neon** (Glass & Neon) | Mọi panel là tấm kính mờ nổi trên nền navy sâu; viền phát sáng màu accent cho biết ngữ nghĩa (cyan = hệ thống, tím = thương hiệu/điều hướng, xanh lá = hoàn thành, vàng = chờ, đỏ = lỗi) | utility `glass`, `glass-strong`, `neon-border-{cyan,violet,green,amber,red}`; nền `body` 3 lớp `radial-gradient` |
| **Mật độ cao, thứ bậc rõ** | Chủ doanh nghiệp nhìn một màn hình thấy toàn cảnh: 5 thẻ số liệu lớn, cảnh 3D, bảng việc, nhật ký, vòng tiến độ. Số liệu to đậm (`text-2xl…[28px] font-extrabold`), nhãn nhỏ, dòng phụ tiếng Anh mờ | `StatCard`, `CardHeader`, `term-stack` |
| **Song ngữ có cấp bậc** | Tiếng Việt là nhãn chính (đậm, sáng), thuật ngữ tiếng Anh là dòng phụ (0.72em, `text-text-muted`) – không bao giờ ngang hàng | `term-primary` / `term-secondary`, `<Term/>`, `PageHeader` |
| **Sống động nhưng tiết chế** | Chấm trạng thái nhấp nháy mềm (`pulse-soft` 2,4 s), thanh tiến độ trượt 700 ms, nhân sự 3D di chuyển/nhấp nhô; tất cả tắt theo `prefers-reduced-motion` | `--animate-*`, `useReducedMotion`, `@media (prefers-reduced-motion)` |

Nguyên tắc chọn lựa khi thiết kế màn hình mới:

1. **Một màu accent cho một ý nghĩa** – không dùng màu để trang trí tùy hứng; mỗi thẻ có `accent` phản ánh nội dung
   (việc hoàn thành → `green`, chờ duyệt → `amber`, lỗi → `red`, 3D/thương hiệu → `violet`, mặc định hệ thống → `cyan`).
2. **Màu dữ liệu không dùng cho chữ** – chữ luôn là `text-text` / `text-text-muted` / `text-text-dim`; màu chỉ lên số liệu nổi bật,
   icon, chấm, viền, thanh tiến độ.
3. **Chữ là DOM** – kể cả trong cảnh 3D và biểu đồ, chữ phải là DOM/HTML để dịch được, chọn được, co giãn được.
4. **Token trước, hex sau** – chỉ dùng `var(--color-*)` hoặc class Tailwind sinh từ token; hex chỉ xuất hiện trong `index.css`
   (ngoại lệ: gradient trang trí trong `text-gradient-brand`, `Logo`, bóng neon của `Button` – đã khai báo sẵn, không thêm mới).

---

## 2. Token màu

Khai báo trong `@theme` của `apps/web/src/styles/index.css`. Tailwind v4 tự sinh class từ tên token:
`--color-bg-panel` → `bg-bg-panel`, `--color-text-muted` → `text-text-muted`, `--color-line` → `border-line`,
`--color-brand-cyan` → `text-brand-cyan` / `bg-brand-cyan/10` / `from-brand-cyan`. Trong `style={{}}` dùng `var(--color-…)`.

### 2.1 Nền (Background)

| Token | Giá trị | Ý nghĩa & nơi dùng |
|---|---|---|
| `--color-bg-base` | `#070b1f` | Nền sâu nhất; cuối gradient `body`; nền cửa sổ Electron (`backgroundColor`); vòng ngoài `focus-ring`; lớp mờ của `DrawerShell` (`bg-bg-base/70`) |
| `--color-bg-deep` | `#0a0f2c` | Đầu gradient `body`; nền `Sidebar` di động (`bg-bg-deep/95`), `Topbar` (`bg-bg-deep/80`), khung cảnh 3D |
| `--color-bg-panel` | `#0f1535` | Nền tấm kính (trong `glass`); nền nhãn DOM 3D (`color-mix … 86%`); vòng bao avatar (`ring-bg-panel`); `surface` của biểu đồ |
| `--color-bg-panel-2` | `#141b44` | Nền sàn phòng 3D (`roomFloor`); thẻ con lồng trong thẻ |
| `--color-bg-elevated` | `#1a2152` | Nội thất 3D (`furniture`); phần tử nổi (popover, menu) |
| `--color-bg-hover` | `#1f2a63` | Nội thất sáng 3D; trạng thái hover cho hàng/danh sách đặc |

Nền trang (`body`) = 3 lớp `radial-gradient` (tím 22% góc trên trái, cyan 14% góc trên phải, magenta 12% đáy) trên
`linear-gradient(bg-deep → bg-base)`, `background-attachment: fixed`. Không đặt nền trang khác ở cấp trang.

### 2.2 Viền (Border / Line)

| Token | Giá trị | Nơi dùng |
|---|---|---|
| `--color-line` | `rgba(129,140,248,0.22)` | Viền mặc định của `glass`, `Topbar`, `Sidebar`, ô nhập liệu, `EmptyState` (nét đứt), lưới biểu đồ (`grid`) |
| `--color-line-strong` | `rgba(129,140,248,0.45)` | Viền `glass-strong`, `Button variant="outline"` |

### 2.3 Chữ (Text)

| Token | Giá trị | Tương phản trên `bg-panel` | Nơi dùng |
|---|---|---|---|
| `--color-text` | `#e8ecff` | 15,2 : 1 | Nhãn chính, số liệu, tiêu đề (`term-primary`) |
| `--color-text-muted` | `#a3acd6` | 8,0 : 1 | Dòng phụ tiếng Anh (`term-secondary`), mô tả, chữ trục/chú giải biểu đồ |
| `--color-text-dim` | `#6f78a8` | 4,2 : 1 | Nhãn nhóm menu (uppercase), icon trạng thái rỗng, `kbd`, chi tiết kỹ thuật – **không** dùng cho chữ ≤ 12 px mang thông tin bắt buộc |
| `--color-text-inverse` | `#070b1f` | – | Chữ trên nền sáng (chip sáng, nút màu nhạt) |

### 2.4 Thương hiệu / điểm nhấn (Brand accents)

| Token | Giá trị | Vai trò ngữ nghĩa | Nơi dùng tiêu biểu |
|---|---|---|---|
| `--color-brand-cyan` | `#22d3ee` | Hệ thống, mặc định, AI Specialist | `focus-ring`, icon `CardHeader`, `ProgressBar` mặc định, `Badge` mặc định, `ROLE_COLOR_VAR.ai_specialist`, phòng Truyền thông & Cộng đồng |
| `--color-brand-blue` | `#3b82f6` | Đang chạy, AI Project Manager | `--color-status-running`, phòng Marketing, chuỗi `leads` biểu đồ |
| `--color-brand-violet` | `#8b5cf6` | Thương hiệu, điều hướng, AI COO, 3D | Mục menu đang chọn, `Button primary` (từ), khung cảnh 3D `neon-border-violet`, `StageBadge`, phòng Sảnh chính, chuỗi `reach` |
| `--color-brand-purple` | `#a855f7` | Thương hiệu (đậm hơn) | `Button primary` (tới), phòng Sáng tạo & Media |
| `--color-brand-magenta` | `#d946ef` | Đang kiểm định, AI QA Reviewer | `--color-status-review`, `ROLE_COLOR_VAR.ai_qa_reviewer` |
| `--color-brand-green` | `#22c55e` | Hoàn thành, hoạt động | `--color-status-active/done`, ưu tiên thấp, `Button success` (tới), trạng thái kết nối live ở `Topbar` |
| `--color-brand-emerald` | `#10b981` | Dữ liệu | `Button success` (từ), phòng Dữ liệu & Phân tích |
| `--color-brand-amber` | `#f59e0b` | Chờ, cảnh báo | `--color-status-waiting`, ưu tiên trung bình, `ConnectionBanner`, chỉ số chờ duyệt |
| `--color-brand-gold` | `#f5b301` | AI CEO, Ban điều hành | `ROLE_COLOR_VAR.ai_ceo`, phòng Executive |
| `--color-brand-red` | `#ef4444` | Lỗi, chặn, quá hạn, ưu tiên cao | `--color-status-error`, `ErrorBanner`, huy hiệu số chờ duyệt trên chuông, `Button danger` (từ) |
| `--color-brand-orange` | `#f97316` | Kinh doanh, chuỗi tỷ lệ chuyển đổi | Phòng Kinh doanh & CRM, `conversion` biểu đồ |
| `--color-brand-pink` | `#ec4899` | Kỹ thuật | Phòng Kỹ thuật & Tự động hóa, `Button danger` (tới) |
| `--color-brand-teal` | `#14b8a6` | Khu phụ trợ | Khu giải trí & Pantry |

### 2.5 Trạng thái (Status) – ánh xạ qua `lib/colors.ts`

| Token | Giá trị | `AGENT_STATUS_COLOR_VAR` | `TASK_STATUS_COLOR_VAR` | `ApprovalStatusBadge` |
|---|---|---|---|---|
| `--color-status-active` | `#22c55e` | `active` | – | – |
| `--color-status-running` | `#3b82f6` | `running` | `in_progress` | – |
| `--color-status-waiting` | `#f59e0b` | `waiting` | `pending` | `pending` |
| `--color-status-idle` | `#94a3b8` | `idle` | – | – |
| `--color-status-paused` | `#a78bfa` | `paused` | – | – |
| `--color-status-error` | `#ef4444` | `error` | `blocked`, `overdue` | `rejected` |
| `--color-status-review` | `#d946ef` | – | `in_review` | – |
| `--color-status-approval` | `#f472b6` | – | `needs_approval` | – |
| `--color-status-done` | `#22c55e` | – | `completed` | `approved` |
| `--color-status-not-started` | `#64748b` | – | `not_started` | – |

Quy tắc: **không** gán màu trạng thái trực tiếp trong component; luôn qua `AGENT_STATUS_COLOR_VAR[status]`,
`TASK_STATUS_COLOR_VAR[status]`, `PRIORITY_COLOR_VAR[priority]`, `ROLE_COLOR_VAR[role]`, `DEPARTMENT_COLOR_VAR[id]` để
Dashboard, bảng, 3D và biểu đồ cùng một màu cho cùng một trạng thái.

### 2.6 Ưu tiên (Priority)

| Token | Giá trị | Enum |
|---|---|---|
| `--color-priority-high` | `#ef4444` | `high` – Cao |
| `--color-priority-medium` | `#f59e0b` | `medium` – Trung bình |
| `--color-priority-low` | `#22c55e` | `low` – Thấp |

### 2.7 Phòng ban (Department) – khớp `accent` trong seed backend

| Token | Giá trị | `DepartmentId` | Tên song ngữ |
|---|---|---|---|
| `--color-dept-executive` | `#f5b301` | `executive` | Ban điều hành – Executive |
| `--color-dept-strategy` | `#6366f1` | `strategy` | Phòng Chiến lược & Nghiên cứu – Strategy & Research |
| `--color-dept-marketing` | `#3b82f6` | `marketing` | Phòng Marketing (Tiếp thị) – Marketing |
| `--color-dept-creative-media` | `#a855f7` | `creative_media` | Phòng Sáng tạo & Media – Creative & Media |
| `--color-dept-social-community` | `#22d3ee` | `social_community` | Phòng Truyền thông & Cộng đồng – Social & Community |
| `--color-dept-data-analytics` | `#10b981` | `data_analytics` | Phòng Dữ liệu & Phân tích – Data & Analytics |
| `--color-dept-sales-crm` | `#f97316` | `sales_crm` | Phòng Kinh doanh & CRM – Sales & CRM |
| `--color-dept-tech-automation` | `#ec4899` | `tech_automation` | Phòng Kỹ thuật & Tự động hóa – Tech & Automation |
| `--color-dept-meeting-room` | `#64748b` | `meeting_room` | Phòng họp – Meeting Room |
| `--color-dept-reception` | `#8b5cf6` | `reception` | Sảnh chính (Khu tiếp đón) – Reception |
| `--color-dept-pantry` | `#14b8a6` | `pantry` | Khu giải trí & Pantry – Pantry & Lounge |

Màu phòng ban dùng cho: nẹp neon và tường kính của phòng 3D, chấm trước tên phòng (`DepartmentName withDot`), viền bảng tên
phòng, cột/chuỗi "theo phòng ban" trong biểu đồ. Backend gửi `department.accent` (hex) cho cảnh 3D; web đọc token tương ứng
qua `DEPARTMENT_COLOR_VAR` – hai nguồn phải trùng nhau khi thêm phòng mới.

### 2.8 Bo góc, bóng, hiệu ứng

| Token / utility | Giá trị | Nơi dùng |
|---|---|---|
| `--radius-card` → `rounded-card` | `1rem` | Mọi thẻ `glass`; vùng bấm của `StatCard` |
| `--radius-card-lg` → `rounded-card-lg` | `1.25rem` | Thẻ nổi bật, khung cảnh 3D (`rounded-2xl` tương đương) |
| `--shadow-panel` → `shadow-panel` | `0 10px 40px rgba(2,6,23,0.55)` | Bóng nền của `glass`; tooltip biểu đồ; khung 3D |
| `--shadow-glow-cyan/violet/green/amber/red` | `0 0 0 1px <màu 35–40%>, 0 0 24–28px <màu 22–28%>` | Qua `neon-border-*`; không gọi trực tiếp |
| `glass` | gradient `rgba(31,41,99,.72) → rgba(15,21,53,.86)`, viền `line`, `blur(14px)`, highlight trên 4% | Panel mặc định (`Card`) |
| `glass-strong` | gradient đậm hơn, viền `line-strong`, `blur(16px)`, highlight 6% | Panel trọng tâm (`Card strong`), `DrawerShell`, `ChartTooltip` |
| `neon-border-{cyan,violet,green,amber,red}` | đổi `border-color` + `box-shadow` glow | `Card accent`, `ErrorBanner` (red), khung 3D (violet), hộp phiên bản `Sidebar` (violet) |
| `text-gradient-brand` | `#67e8f9 → #a78bfa → #f0abfc` clip vào chữ | Tiêu đề trang (`PageHeader h1`), tên sản phẩm lớn |
| `skeleton` | shimmer 2,2 s, `rounded-lg` | `PageSkeleton`, ô đang tải |
| `focus-ring` | `0 0 0 2px bg-base, 0 0 0 4px brand-cyan` | Mọi phần tử tương tác qua `focus-visible:focus-ring` |

---

## 3. Typography – Kiểu chữ

### 3.1 Họ chữ

- `--font-sans` / `--font-display`: **Be Vietnam Pro**, dự phòng Inter → `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto`.
  Be Vietnam Pro có đủ dấu tiếng Việt ở mọi trọng số (400–800) và chữ số đồng đều, phù hợp số liệu dày.
- `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility` đặt ở `body`.
- Số liệu trong bảng / đồng hồ / bộ đếm thêm `tabular-nums` để cột không nhảy khi cập nhật realtime.

### 3.2 Thang cỡ và trọng số (đang dùng trong mã)

| Vai trò | Class | Cỡ / trọng số | Nơi dùng |
|---|---|---|---|
| Tiêu đề trang | `text-xl md:text-2xl font-extrabold tracking-tight` | 20 → 24 px / 800 | `PageHeader h1` (phần tiếng Việt có `text-gradient-brand`); phần `– English` `text-base font-semibold text-text-muted` |
| Số liệu thẻ thống kê | `text-2xl md:text-[28px] font-extrabold leading-none tracking-tight` | 24 → 28 px / 800, màu accent | `StatCard value` |
| Tiêu đề thẻ | `text-[15px] md:text-base font-semibold leading-tight` | 15 → 16 px / 600 | `CardHeader title` |
| Nhãn chính (body) | `text-sm font-semibold` | 14 px / 600 | `StatCard label`, nhãn `term-primary` trong menu (`text-[13.5px]`) |
| Nội dung | `text-sm` | 14 px / 400 | Mô tả, nội dung tin nhắn, ô nhập |
| Phụ đề thẻ, dòng phụ | `text-xs text-text-muted` | 12 px | `CardHeader subtitle`, `PageHeader` dòng tiếng Anh ở di động |
| Dòng phụ song ngữ | `term-secondary` | `0.72em` của cha (≈ 10 px khi cha 14 px), 500, `text-muted` | Mọi `term-stack` |
| Dòng phụ `StatCard` | `text-[11px] text-text-muted` | 11 px | `StatCard secondary` |
| Chip / huy hiệu | `text-[11px]` (sm) / `text-xs` (md) `font-semibold` | 11 / 12 px / 600 | `Badge` |
| Nhãn nhóm menu | `text-[10px] font-bold uppercase tracking-[0.14em] text-text-dim` | 10 px / 700 | `Sidebar` nhóm `nav:groups.*` |
| Nhãn 3D | `text-[11.5px] font-bold` (phòng), `text-[10px] font-semibold` (nhân sự, mini), `text-[9px]` (số đếm), `text-[8.5px]` (gợi ý hover) | – | `LabelLayer` |
| Chữ nút | `text-xs` (sm) / `text-sm` (md) / `text-base` (lg) `font-semibold` | 12 / 14 / 16 px / 600 | `Button` |

Giới hạn: **không dưới 10 px** cho chữ mang thông tin (dòng phụ, chip); 9 px và 8,5 px chỉ dành cho số đếm / gợi ý phụ trong
cảnh 3D có tooltip đầy đủ. Không dùng `font-light`/`font-thin` trên nền tối.

### 3.3 Quy tắc nhãn song ngữ (`term-stack`)

```css
/* styles/index.css */
.term-stack     { display:inline-flex; flex-direction:column; min-width:0; line-height:1.15 }
.term-primary   { font-weight:600; color:var(--color-text); overflow-wrap:anywhere }
.term-secondary { font-size:.72em; font-weight:500; color:var(--color-text-muted); overflow-wrap:anywhere }
```

1. Cha của `term-stack` phải có `min-w-0` (hoặc `flex-1 min-w-0`) để `truncate` bên trong có tác dụng.
2. Mỗi dòng thêm `truncate` khi nằm trong hàng cố định chiều rộng (menu, bảng); trong thẻ rộng cho phép xuống dòng (`overflow-wrap:anywhere` đã có).
3. Tỷ lệ chữ phụ/chính cố định 0,72 – không tự đặt `text-[9px]` cho dòng phụ ngoài cảnh 3D.
4. Dùng `<Term/>` (gắn `data-term*`) thay vì tự viết hai `span` khi thuật ngữ có trong glossary; `AgentName`, `DepartmentName`
   đã bọc sẵn `term-stack`.
5. Dạng một dòng của tiêu đề: tiếng Việt gradient + `ml-2 … hidden md:inline` cho `– English` (xem `PageHeader`), ở di động
   tách xuống `block text-xs`.

---

## 4. Lưới, khoảng cách và lớp

### 4.1 Khung ứng dụng (`AppShell`)

```
┌──────────────┬──────────────────────────────────────────────────┐
│ Sidebar      │ Topbar (sticky top-0, z-30, blur)                 │
│ w-[272px]    ├──────────────────────────────────────────────────┤
│ lg:static    │ ConnectionBanner (chỉ khi mất đồng bộ)             │
│ < lg: drawer ├──────────────────────────────────────────────────┤
│ fixed z-50   │ <main id="main" px-3 py-4 md:px-5 md:py-5>        │
│              │   PageHeader (mb-4 md:mb-5)                        │
│              │   nội dung trang (gap-3 / gap-4)                   │
└──────────────┴──────────────────────────────────────────────────┘
AgentDetailDrawer / TaskDetailDrawer: fixed inset-0 z-[60], panel phải max-w-[520px]
```

- Thanh trái rộng **272 px**, `border-r border-line`; ở `< lg` trượt vào từ trái, có lớp mờ `bg-black/60 z-40`.
- `Topbar`: `px-3 py-2.5 md:px-5`, ô tìm kiếm `h-10 rounded-xl` chỉ hiện từ `md`, chỉ số nhanh (`MiniStat`) từ `2xl`, ngày giờ từ `xl`.
- Khoảng cách nội dung: thẻ cách nhau `gap-3` (12 px) ở di động, `gap-4` (16 px) từ `md`/`lg`; thẻ lớn `gap-4 lg:grid-cols-3`.
- Thẻ `Card` đệm `p-4 md:p-5` (16 → 20 px); `StatCard` `p-3.5 md:p-4`; `CardHeader` cách nội dung `mb-3`.
- Bo góc: panel `rounded-card` (16 px), nút `rounded-lg/xl` (8/12 px), chip `rounded-full`, icon tròn `rounded-xl` 36–48 px.

### 4.2 Mẫu lưới thường dùng

| Khối | Lưới | Ghi chú |
|---|---|---|
| Dải 5 thẻ thống kê | `grid grid-cols-2 gap-3 md:grid-cols-5` | 390 px: 2 cột (thẻ thứ 5 kéo dài hoặc xuống hàng); khung xương dùng cùng lưới (`PageSkeleton`) |
| Nội dung chính + cột phải | `grid gap-4 lg:grid-cols-3` → `lg:col-span-2` + `1` | Tổng quan (3D + Chức năng chính), AI CEO |
| Ba thẻ hàng dưới | `grid gap-4 md:grid-cols-2 xl:grid-cols-3` | Công việc hôm nay · Hoạt động gần đây · Tiến độ |
| Ô chức năng chính | `grid grid-cols-2 gap-2 sm:grid-cols-3` | Nút lớn icon + nhãn stacked |
| Hồ sơ nhân sự | `grid gap-3 sm:grid-cols-2 xl:grid-cols-5` | `AgentRegistryStrip`, trang Nhân sự AI |
| Bảng dữ liệu | `overflow-x-auto` **bên trong** `Card`, `min-w-[640px]` cho `<table>` | Không để trang cuộn ngang |
| Thẻ tự thích ứng | `@container` + `@md:` … | Thẻ dùng ở nhiều cột khác nhau (`MiniOfficeCard`, `CeoTaskTable`, `OfficeScene` `@container/scene`) |

### 4.3 Thứ tự lớp (z-index)

| Lớp | z | Thành phần |
|---|---|---|
| Nội dung | auto | Thẻ, bảng |
| Nhãn trong cảnh 3D | `z-0 / z-10 / z-20` (cục bộ, `isolate`) | `LabelLayer` (phòng 10, nhân sự 20, bong bóng cao hơn) |
| Thanh trên | `z-30` | `Topbar` sticky |
| Lớp mờ menu di động | `z-40` | `Sidebar` overlay |
| Menu trái di động, liên kết bỏ qua | `z-50` | `Sidebar`, skip link |
| Ngăn chi tiết | `z-[60]` | `DrawerShell` |

---

## 5. Thành phần dùng chung

Mọi thành phần trong `apps/web/src/components/{ui,domain,layout}` là **duy nhất** cho vai trò của nó; không tự viết lại thẻ,
huy hiệu, nút trong `features/*`. Thành phần mới đặc thù đặt trong `features/<gói>/`.

### 5.1 `Card` và `CardHeader` (`components/ui/Card.tsx`)

| Prop | Giá trị | Hiệu ứng |
|---|---|---|
| `accent` | `none` (mặc định) · `cyan` · `violet` · `green` · `amber` · `red` | Thêm `neon-border-*` tương ứng |
| `strong` | boolean | `glass-strong` thay `glass` (panel trọng tâm: khung lệnh AI CEO) |
| `padded` | `true` (mặc định) → `p-4 md:p-5`; `false` khi con tự đệm (`StatCard`, bảng, cảnh 3D) | |

Luôn có `min-w-0`. `CardHeader { icon, title, subtitle, action }`: icon tròn `size-9 rounded-xl bg-white/5 text-brand-cyan ring-1 ring-white/10`;
`title` là `h2` song ngữ (dùng `<Term/>` hoặc `BilingualText`), `subtitle` `text-xs text-text-muted`, cả hai `truncate`;
`action` (nút "Xem tất cả →", bộ lọc) `shrink-0` bên phải.

### 5.2 `StatCard` (`components/ui/StatCard.tsx`)

Thẻ số liệu lớn giống dải 5 thẻ trong ảnh tham chiếu. Props: `icon`, `value`, `label` (tiếng Việt), `secondary` (tiếng Anh),
`accent`, `color` (token – cùng màu cho icon + số), `onClick` (biến thành `button` có `hover:bg-white/[0.04]` và `focus-ring`),
`trend` (huy hiệu +/−). Cấu trúc: ô icon `size-11 md:size-12` nền `color-mix 16%` + viền trong 40%; số `text-2xl md:text-[28px]`
màu accent; nhãn `text-sm font-semibold truncate`; dòng phụ `text-[11px] text-text-muted truncate`.
Giá trị **phải** đến từ selector dùng chung (`selectHeadlineStats`, `selectTaskCounts`…), không tự đếm trong component.

### 5.3 `Badge` và huy hiệu miền (`components/ui/Badge.tsx`, `components/domain/StatusBadges.tsx`)

`Badge { color, size: 'sm'|'md', dot, pulse }` – viên thuốc `rounded-full border font-semibold whitespace-nowrap`, màu chữ = `color`,
viền `color-mix 45%`, nền `color-mix 14%`, nội dung `truncate`, chấm `size-1.5` có glow; `pulse` → `animate-pulse-soft`.

| Huy hiệu | Nguồn màu | Nhãn hiển thị | Nhấp nháy khi |
|---|---|---|---|
| `TaskStatusBadge {status, size, short}` | `TASK_STATUS_COLOR_VAR` | `label.primary` (hoặc `short`) | `in_progress` |
| `AgentStatusBadge {status}` | `AGENT_STATUS_COLOR_VAR` | `label.primary` | `running`, `active` |
| `PriorityBadge {priority}` | `PRIORITY_COLOR_VAR` | `label.primary` (Cao / Trung bình / Thấp), không chấm | – |
| `StageBadge {stage}` | `--color-brand-violet` cố định | `label.short` (Tiếp nhận…) | – |
| `ApprovalStatusBadge {status}` | `status-done` / `status-error` / `status-waiting` | `label.primary` | – |

Mọi huy hiệu có `title={label.inline}` (song ngữ). Không tạo huy hiệu trạng thái bằng `Badge` thô trong trang.

### 5.4 `Button` (`components/ui/Button.tsx`)

| `variant` | Kiểu | Khi dùng |
|---|---|---|
| `primary` | gradient `brand-violet → brand-purple`, chữ trắng, glow tím | Hành động chính của trang / thẻ (Tạo công việc, Gửi, Xem kế hoạch chi tiết) |
| `success` | gradient `brand-emerald → brand-green`, glow xanh | Duyệt, Phê duyệt & triển khai, Tiếp tục |
| `danger` | gradient `brand-red → brand-pink`, glow đỏ | Từ chối, Tạm dừng, xóa |
| `ghost` | trong suốt, `text-text-muted` → hover `bg-white/5` | Hành động phụ trong hàng, icon-only |
| `outline` | viền `line-strong`, nền `white/3%` | Thử lại, Làm mới, Lọc, Đặt lại góc nhìn |

`size`: `sm` (h-8, text-xs, rounded-lg) · `md` (h-10, text-sm, rounded-xl) · `lg` (h-12, text-base). Props `icon`, `iconRight`,
`loading` (spinner thay icon, `aria-busy`, tự `disabled`), `disabled` → `opacity-50 cursor-not-allowed`. Chữ nút luôn `truncate`,
tiếng Việt rõ nghĩa (nhóm `action.*`). Mỗi thẻ tối đa **một** nút `primary`/`success`.

> Lưu ý trợ năng: chữ trắng trên gradient `success` chỉ đạt ≈ 2,3 : 1, trên `danger` ≈ 3,8 : 1 và trên `primary` ≈ 4,2 : 1.
> Vì vậy nút `success`/`danger` **phải có icon** kèm chữ và không là cách duy nhất truyền ý nghĩa; việc nâng tương phản
> (đậm nền hoặc đổi chữ sang `text-inverse`) nằm trong danh sách cải tiến của hệ thống thiết kế.

### 5.5 `ProgressBar` (`components/ui/ProgressBar.tsx`)

`{ value, color, size: 'xs'|'sm'|'md', label }` → `role="progressbar"` với `aria-valuenow/min/max`, `aria-label` tiếng Việt.
Giá trị qua `clampPercent`; rãnh `bg-white/8 rounded-full` cao 4 / 6 / 10 px; thanh chạy gradient `color → color-mix 55% white`,
glow `0 0 10px color`, chuyển `transition-[width] 700ms ease-out`. Màu lấy từ `TASK_STATUS_COLOR_VAR` hoặc màu phòng ban/chức vụ.

### 5.6 `PageHeader` (`components/layout/PageHeader.tsx`)

`{ termId, description, icon, actions }` – tiêu đề trang chuẩn: icon ô `size-11 rounded-2xl` gradient tím→cyan; `h1` tiếng Việt
`text-gradient-brand`, `– English` cùng dòng từ `md`, xuống dòng `text-xs` ở di động; `title` tooltip `EN – VI`; `description`
tiếng Việt `text-sm text-text-muted`; `actions` gói `flex-wrap gap-2`. Bố cục `flex-col gap-3 md:flex-row md:items-end md:justify-between`.
Mỗi trang có đúng một `PageHeader` với `termId` trùng `ROUTES[].termId`.

### 5.7 `Sidebar` và `Topbar` (`components/layout/`)

- **Sidebar**: nhóm `nav:groups.{operate,manage,insight,system}` (nhãn `text-[10px] uppercase`), mục là `NavLink`
  `rounded-xl px-3 py-2`, icon `size-5`, nhãn `term-stack` (`nav:items.<key>.label/secondary`), đang chọn:
  gradient `from-brand-violet/70 to-brand-purple/40 text-white` + glow; huy hiệu đỏ số chờ duyệt ở mục `approvals`.
  Chân: hộp `glass neon-border-violet` hiện phiên bản (`nav:footer.version`) và chế độ vận hành (`execution_mode.*`).
- **Topbar**: lời chào (`common:greeting` với `ownerName`), tìm kiếm với `kbd` phím tắt, viên trạng thái hệ thống
  (xanh `brand-green` khi `connection === 'live'`, vàng khi mất kết nối; `aria-live="polite"`), `MiniStat` (việc đang chạy,
  chờ duyệt – từ `selectHeadlineStats`), ngày dài + giờ (`formatLongDate`, `formatTime`), chuông với số chờ duyệt, trợ giúp,
  cài đặt, tài khoản Owner (avatar chữ cái + `term-stack`).

### 5.8 `ErrorBanner`, `ConnectionBanner`, `EmptyState`, `PageSkeleton`

| Thành phần | Dạng | Nội dung bắt buộc |
|---|---|---|
| `ErrorBanner { error, onRetry }` | `glass neon-border-red`, `role="alert"`, icon `AlertTriangle` đỏ | `describeError(t, code)` → tiêu đề đậm + giải thích tiếng Việt; `<details>` "Chi tiết kỹ thuật" chứa `code · message`; nút `outline sm` *Thử lại* khi có `onRetry` |
| `ConnectionBanner` | dải `rounded-xl border-brand-amber/50 bg-brand-amber/10`, `role="status"`, icon `WifiOff` | Hiện khi `connection` không phải `live`/`connecting`; nội dung `errors:codes.network` hoặc `websocket_disconnected`; nối thêm `common:labels.loading` khi chưa hydrate |
| `EmptyState { title, description, icon, action }` | viền nét đứt `border-dashed border-line rounded-xl py-8`, icon `Inbox` `text-text-dim` | Câu tiếng Việt từ locale (`common:labels.empty` hoặc khóa riêng), nút hành động gợi ý nếu có |
| `PageSkeleton` | `aria-busy`, các khối `skeleton` theo đúng lưới trang (1 tiêu đề, 5 thẻ, 2 + 1 cột) | Dùng khi `hydrated === false`; không hiện spinner toàn trang |

### 5.9 `DrawerShell` – ngăn chi tiết (`features/agents/DrawerShell.tsx`)

Ngăn trượt từ phải dùng cho chi tiết nhân sự AI và công việc (gắn một lần trong `AppShell`, mở theo `selectedAgentId` /
`selectedTaskId` trong store). `role="dialog" aria-modal aria-label` (song ngữ), `max-w-[520px]`, `glass-strong`, viền trái
3 px màu ngữ cảnh (`accent` = màu chức vụ / trạng thái), hoạt ảnh `drawer-in 260ms cubic-bezier(.2,.8,.2,1)`. Đóng bằng nút
(`closeLabel` tiếng Việt), phím Esc, bấm lớp mờ; khóa cuộn `body`; đưa focus vào ngăn khi mở. Nội dung chia `DrawerSection`
(tiêu đề song ngữ) và `DrawerStat`.

### 5.10 Thành phần miền (`components/domain/`)

| Thành phần | Mô tả |
|---|---|
| `AgentAvatar { agent, size=40, showStatus }` | Vòng tròn gradient HSL theo `avatarSeed`, chữ viết tắt chức vụ, viền 2 lớp (`bg-panel` + màu chức vụ) có glow, chấm trạng thái góc dưới phải (nhấp nháy khi `running`/`active`) |
| `AgentName { agent, format }` | Tên + chức vụ song ngữ (xem chuẩn ngôn ngữ mục 3) |
| `DepartmentName { id, format, withDot }` | Tên phòng ban song ngữ, chấm màu `DEPARTMENT_COLOR_VAR` có glow |
| `TaskStatusBadge` … `ApprovalStatusBadge` | Mục 5.3 |

---

## 6. Văn phòng ảo 3D

Cảnh `OfficeScene` (`features/office3d/OfficeScene.tsx`) là một thành phần công khai dùng ở ba nơi: trang `/office` (`mode="full"`),
ô thu nhỏ trên Tổng quan và Trung tâm điều hành AI CEO (`mode="mini"`). Cảnh **đọc trực tiếp store**, không nhận dữ liệu qua props.

### 6.1 Kiến trúc hình ảnh

| Yếu tố | Quy tắc | Mã |
|---|---|---|
| Phòng kính | Sàn `bg-panel-2` phát sáng nhẹ màu accent (`emissiveIntensity` 0,07 → 0,22 khi sáng); 4 tường kính trong suốt màu accent (`opacity` 0,09 mặc định · 0,2 khi hover/chọn · 0,04 khi bị làm mờ, `depthWrite:false`); cao `WALL_HEIGHT = 1.7` | `scene/Room.tsx` |
| Nẹp neon | Thanh neon đỉnh tường + viền chân tường màu accent phòng ban (`neonOpacity` 0,78 → 1 khi sáng, 0,22 khi mờ) | `scene/Room.tsx` |
| Nhân sự AI | Hình người tối giản: thân màu chức vụ (`roleColor`), tấm che mặt phát sáng màu trạng thái (`emissiveIntensity` 0,9 khi chạy · 0,5 mặc định), **vòng trạng thái** dưới chân (`ringGeometry 0.36–0.47`) màu `statusColor(status)`, co giãn nhẹ; khi `error` vòng và tấm che nháy theo `sin(6t)`; `paused` → mờ 0,45; bị lọc → 0,22; di chuyển mượt tới mục tiêu (`MathUtils.damp`), nhấp nhô/xoay nhẹ theo trạng thái | `scene/AgentFigure.tsx`, `scene/palette.ts` |
| Hologram trung tâm | Logo chữ A phát sáng ở sảnh (điểm neo thị giác, không chứa chữ) | `scene/Hologram.tsx` |
| Nội thất | Bàn, ghế, màn hình, cây bằng `bg-elevated`/`bg-hover`; không bắt raycast (`NO_RAYCAST`) | `scene/Furniture.tsx` |
| Nhãn | **Toàn bộ chữ là DOM** trong `LabelLayer` (ngoài Canvas), bám theo neo 3D qua `LabelProjector` mỗi khung hình | `LabelLayer.tsx`, `scene/LabelProjector.tsx`, `scene/overlay.ts` |

### 6.2 Màu trong cảnh

three.js không hiểu `var(--color-*)`; `scene/palette.ts#cssColor` đọc giá trị đã tính từ `:root` và ghi nhớ. **Chỉ dùng token
màu đặc (hex)** – không dùng token rgba (`--color-line`) trong material. `statusColor(status)` / `roleColor(role)` đi qua
`AGENT_STATUS_COLOR_VAR` / `ROLE_COLOR_VAR` để trùng màu với huy hiệu DOM. Accent phòng lấy từ `department.accent` (backend) –
phải trùng `--color-dept-*`.

### 6.3 Nhãn song ngữ trong cảnh

- **Bảng tên phòng** (`RoomLabel`): nút `rounded-lg border px-2 py-1 backdrop-blur-md`, nền `bg-panel 86%`, viền accent 50% → 85%
  khi sáng, `translateY(-4px) scale(1.04)` khi hover/chọn, mờ 0,35 khi bị lọc. Dòng chính `text-[11.5px] font-bold` = `label.short`
  (hoặc `label.primary` khi `short` trùng tiếng Anh – trường hợp Marketing), dòng phụ `text-[9px]` = `label.secondary` + số nhân sự
  / việc mở (`selectDepartmentSummary`), gợi ý `office3d:room.clickHint` ("Nhấn để xem chi tiết phòng ban") khi hover. `title={label.inline}`. Neo lệch về tường sau
  (`z + depth × 0.3`) để không che nhân sự.
- **Nhãn nhân sự** (`AgentLabel`): viên thuốc `max-w-[170px] text-[10px] font-semibold`, viền màu chức vụ 55%, chấm trạng thái;
  nội dung tên gọi hoặc `role.short`; `title` = `displayName · role.inline`. Ẩn khi `compact` (trừ nhân sự đang hover/chọn).
- **Bong bóng chi tiết** (`AgentTooltip`): hiện khi hover/chọn ở chế độ full – `AgentAvatar`, `AgentName`, `AgentStatusBadge`,
  `DepartmentName`, việc đang làm (`TaskStatusBadge` + `ProgressBar`) và dòng gợi ý `office3d:agent.clickHint`
  ("Nhấn để mở hồ sơ nhân sự và đưa camera tới"); bấm vào hình nhân sự thực hiện cả hai (`selectAgent`, `focusCameraOnAgent`).
  Bong bóng không chứa nút – hành động nằm trong ngăn chi tiết.
- **Biển hiệu công ty** (`CompanySign`): tên công ty từ store (`company.name` – dữ liệu Owner cấu hình) + `common:app.shortName`
  với `text-gradient-brand`, neo trên tường sau sảnh (`WALL_HEIGHT + 3.6`), chỉ ở full & không compact.
- Chế độ **compact** bật tự động khi mặt bằng bị thu nhỏ dưới 16,5 px/m (`CameraRig`) để nhãn không chồng nhau; chế độ **mini**
  chỉ còn tên phòng rút gọn `text-[10px]`.

### 6.4 Camera và điều khiển

- `OrthographicCamera` isometric, vị trí = mục tiêu + `CAMERA_OFFSET [20, 34, 20]`, nhìn về `DEFAULT_TARGET [0, 1, 2]`,
  `near 0.5 / far 220`; `zoom` cơ sở = `min(width/40, height/34)` kẹp `[6, 60]` (mini: `/37`, `/32`) → luôn vừa mặt bằng.
- Full: `MapControls` kéo / thu phóng / xoay giới hạn; ưu tiên mục tiêu: nhân sự đang theo dõi (`store.cameraFocusAgentId`)
  → phòng đang lọc (`filterDepartmentId`) → đặt lại góc nhìn (`resetToken`). Chuyển cảnh nội suy bằng `MathUtils.damp`.
- Mini: camera cố định, không điều khiển, `dpr = 1`.
- Thanh công cụ (`SceneToolbar`): lọc phòng ban (`<select>` nhãn `office3d:toolbar.filter.*`), ẩn/hiện nhãn, toàn màn hình
  (`Fullscreen API`, `module.full_screen`), đặt lại góc nhìn (`action.reset_view`); `SceneLegend` giải thích màu trạng thái
  (`aria-label` song ngữ); `MiniSyncBadge` hiện trạng thái đồng bộ realtime + giờ cập nhật.
- Bấm nền (`onPointerMissed`) bỏ chọn phòng; bấm phòng → `selectDepartment(id)` mở `DepartmentPanel`; bấm nhân sự → `selectAgent(id)`.

### 6.5 Hiệu năng

- `Canvas dpr={full ? [1, 1.5] : 1}`, `flat`, `antialias`, `powerPreference: 'high-performance'`, `frameloop="always"`
  (cần cho chuyển động liên tục; ô mini vẫn cập nhật realtime).
- Mỗi `AgentFigure` chỉ đăng ký lát `agents[id]` của store; mọi nội suy trong `useFrame` qua `ref`, **không `setState`** trong vòng khung hình.
- Mesh trang trí đặt `raycast={NO_RAYCAST}`; chỉ sàn phòng và thân nhân sự bắt sự kiện chuột.
- `SceneErrorBoundary` hiển thị thông báo tiếng Việt khi WebGL không khả dụng (`office3d:scene.webgl.*`) thay vì màn hình trắng.
- Nhãn DOM định vị bằng `transform` + `will-change-transform`, `visibility: hidden` cho đến khi có tọa độ đầu tiên.
- `reducedMotion` (từ `useReducedMotion`) tăng hệ số damp (di chuyển gần như tức thì) và tắt nhấp nhô/xoay.

---

## 7. Biểu đồ – Data Visualization

Thư viện: **recharts**. Chủ đề màu dùng chung qua `useChartTheme()` (`features/dashboard/chartTheme.ts`) – giải mã token một
lần bằng `resolveCssColor('var(--color-…)')` vì SVG không đọc được biến CSS trong một số thuộc tính.

| Vai trò | Token | Ghi chú |
|---|---|---|
| Chữ trục, chú giải | `--color-text-muted` (`text`), `--color-text-dim` (`textDim`) | Chữ không bao giờ mang màu dữ liệu |
| Lưới | `--color-line` (`grid`) | Hairline, một bậc so với nền; chỉ lưới ngang |
| Nền thẻ | `--color-bg-panel` (`surface`) | Khe 2 px giữa các mảng xếp chồng, viền quanh điểm dữ liệu |
| Chuỗi 1 – Khách hàng tiềm năng (Leads) | `--color-brand-blue` | Cột |
| Chuỗi 2 – Tỷ lệ chuyển đổi (CR) | `--color-brand-orange` | Đường, trục phải (%) |
| Chuỗi 3 – Lượt tiếp cận (Reach) | `--color-brand-violet` | Cột / vùng |
| Trạng thái công việc (donut) | `TASK_STATUS_COLOR_VAR` | Cùng màu với huy hiệu và 3D |
| Phòng ban | `DEPARTMENT_COLOR_VAR` | Cùng màu với phòng 3D |

Quy tắc:

1. **Tooltip tiếng Việt** – dùng `ChartTooltip { title, rows[] }` (HTML, `glass-strong`, 180–260 px): mỗi dòng khóa màu
   (ô vuông cho cột, vạch cho đường) + tên chuỗi tiếng Việt (tooltip `EN – VI` trên `title`) + giá trị đậm `tabular-nums`.
   Không dùng tooltip mặc định của recharts.
2. **Chú giải song ngữ** – nhãn chú giải là `label.primary` (tiếng Việt) với `title={label.inline}`; dùng `metric.*` trong glossary
   (`metric.leads`, `metric.conversion_rate`, `metric.reach`…).
3. **Định dạng số** – trục và tooltip qua `formatCompact` (`120 N`), `formatPercent` (`75%`), `formatVnd` (`10.000.000 ₫`);
   không bao giờ hiển thị số thô kiểu `1234.5`.
4. **Đọc được ở 390 px** – chiều cao biểu đồ 200–260 px, `ResponsiveContainer width="100%"`, ẩn trục phải hoặc giảm
   `tickCount`, chú giải xếp xuống dưới (`flex-wrap`), nhãn trục nghiêng không quá 2 dòng; kiểm tra bằng ảnh chụp 390 × 844.
5. **Vòng tiến độ (donut)** – số lớn ở tâm (`text-2xl font-extrabold`) + nhãn tiếng Việt, danh sách bên cạnh gồm chấm màu,
   nhãn `primary` + `(secondary)` và số; khe 2 px màu `surface` giữa các cung.
6. **Trạng thái rỗng / tải** – `EmptyState` hoặc `skeleton` cùng kích thước biểu đồ; không vẽ biểu đồ với mảng rỗng.
7. Tối đa **3 chuỗi màu** trên một biểu đồ; chuỗi thứ 4 trở đi dùng độ sáng khác của cùng một họ màu hoặc tách biểu đồ.
8. Không `animationDuration` dài hơn 600 ms; tắt hoạt ảnh khi `prefers-reduced-motion`.

---

## 8. Chuyển động và giảm chuyển động

| Token / cơ chế | Giá trị | Dùng cho |
|---|---|---|
| `--animate-pulse-soft` | `pulse-soft 2.4s ease-in-out infinite` (opacity 1 → 0,55) | Chấm trạng thái đang chạy (`Badge pulse`, `AgentAvatar`), viên trạng thái hệ thống |
| `--animate-float` | `float 6s ease-in-out infinite` (translateY 0 → −6 px) | Hologram, icon nổi trong trạng thái rỗng (tiết chế) |
| `--animate-shimmer` | `shimmer 2.2s linear infinite` | `skeleton` |
| `transition` mặc định Tailwind | 150 ms | Hover nút, menu |
| `ProgressBar` | `transition-[width] 700ms ease-out` | Thanh tiến độ cập nhật realtime |
| `Sidebar` di động | `transition-transform 300ms` | Trượt ngăn kéo |
| `DrawerShell` | `drawer-in 260ms cubic-bezier(.2,.8,.2,1)` | Mở ngăn chi tiết |
| Nhãn 3D | `transition-[opacity,box-shadow,transform] 300ms` | Hover/chọn/lọc phòng |
| Cảnh 3D | nội suy `MathUtils.damp` trong `useFrame` (λ 3,4 di chuyển; 14 khi reduced) | Di chuyển nhân sự, camera |

Giảm chuyển động: `@media (prefers-reduced-motion: reduce)` trong `index.css` ép mọi `animation-duration`/`transition-duration`
về 0,01 ms và `animation-iteration-count: 1`; cảnh 3D đọc `useReducedMotion()` (theo dõi `matchMedia` thay đổi lúc chạy) để
bỏ nhấp nhô/xoay và nhảy thẳng tới vị trí. Mọi hoạt ảnh mới phải (a) dùng token `--animate-*` hoặc `transition` ≤ 700 ms,
(b) không truyền thông tin **chỉ** bằng chuyển động (luôn có màu/chữ kèm theo), (c) không lặp vô hạn ngoài chấm trạng thái và skeleton.

---

## 9. Khả năng tiếp cận – Accessibility

### 9.1 Tương phản (WCAG 2.1 AA, tính trên nền `bg-panel #0f1535`)

| Cặp | Tỷ lệ | Kết luận |
|---|---|---|
| `text` / `text-muted` trên panel | 15,2 / 8,0 | Đạt AAA – dùng cho mọi chữ |
| `text-dim` trên panel / elevated | 4,2 / 3,6 | Chỉ đạt cho chữ lớn (≥ 18,66 px đậm) – dùng cho nhãn nhóm, `kbd`, chi tiết kỹ thuật, không cho chữ phụ bắt buộc |
| `brand-cyan`, `brand-gold`, `brand-amber`, `brand-green` trên panel | 9,9 / 9,6 / 8,3 / 7,8 | Đạt – số liệu màu trên `StatCard` an toàn |
| `brand-blue`, `brand-magenta`, `brand-red` trên panel | 4,8 / 5,2 / 4,7 | Đạt AA cho chữ thường |
| `brand-violet` trên panel | 4,2 | Chỉ dùng cho số liệu lớn/đậm hoặc viền/nền, không cho chữ nhỏ |
| `status-not-started` trên panel | 3,7 | Chỉ dùng làm màu chấm/viền của `Badge` (chữ trong badge vẫn là `color` → cần `size="md"` hoặc kèm tooltip) |
| Chữ trắng trên `Button primary` / `danger` / `success` | 4,2 / 3,8 / 2,3 | Xem lưu ý mục 5.4 – nút phải có icon; cần cải tiến |

### 9.2 Bàn phím và focus

- Mọi phần tử tương tác dùng `focus-visible:focus-ring` (vòng cyan 2 + 2 px, nền `bg-base`); không `outline-none` thiếu thay thế.
- Liên kết "Bỏ qua tới nội dung" (`common:a11y.skipToContent`) ở đầu `AppShell`, hiện khi focus.
- `DrawerShell`: Esc đóng, focus vào ngăn khi mở, `aria-modal`.
- Thứ tự tab theo thứ tự thị giác: Sidebar → Topbar → nội dung → ngăn chi tiết.

### 9.3 Ngữ nghĩa và tiếng Việt cho trình đọc màn hình

- `<html lang="vi">` (hoặc `en`) do `applyDocumentLocale` đặt.
- `aria-label` / `title` luôn tiếng Việt hoặc song ngữ qua `t()`/`bilingual().inline` – lint `[hardcoded-attr]` chặn chuỗi cố định.
- `role="alert"` cho lỗi (`ErrorBanner`), `role="status"` + `aria-live="polite"` cho trạng thái kết nối, `role="progressbar"` cho
  thanh tiến độ với `aria-label`, `aria-busy` cho skeleton và nút đang tải.
- `<Canvas aria-label>` mô tả cảnh bằng tiếng Việt có số liệu (`office3d:scene.ariaLabel { agents, departments }`); nhãn DOM
  trong cảnh là `button` thật nên đọc được và bấm được bằng bàn phím.
- Icon lucide trang trí có `aria-hidden="true"`; icon mang nghĩa đứng một mình phải có `aria-label`.
- Màu không là kênh duy nhất: mọi trạng thái có chữ (huy hiệu) hoặc tooltip; chú giải 3D (`SceneLegend`) giải thích màu.

---

## 10. Responsive – Bố cục theo kích thước màn hình

Breakpoint Tailwind v4 mặc định: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536` px. Ba kích thước kiểm tra bắt buộc:
**390 × 844** (điện thoại), **≈ 834 – 1024** (máy tính bảng), **1440 × 900** (máy tính).

| Vùng | < 640 (390 px) | md 768 | lg 1024 | xl 1280 | 2xl 1536 |
|---|---|---|---|---|---|
| Sidebar | Ngăn kéo (nút ☰ ở Topbar), lớp mờ | Ngăn kéo | **Cố định 272 px** | | |
| Topbar | Chào + tìm kiếm ẩn; trạng thái, chuông, Owner (chỉ avatar) | Tìm kiếm hiện | Lời chào hiện | Ngày giờ hiện | `MiniStat` hiện |
| `PageHeader` | 2 dòng (VI lớn / EN `text-xs`) | 1 dòng `VI – EN` | | | |
| Dải thống kê | 2 cột | 5 cột | | | |
| Nội dung + cột phải | 1 cột, cột phải xuống dưới | | 2 + 1 | | |
| Bảng | Cuộn ngang trong thẻ | Đủ cột | | | |
| Cảnh 3D | `min-h-[240px]`, compact tự bật, thanh công cụ gói dòng | | Full nhãn | | |
| Ngăn chi tiết | Toàn chiều rộng | `max-w-[520px]` | | | |
| Chữ phụ `term-secondary` | ≥ 10 px (cha 14 px) – không giảm cỡ cha dưới 13 px | | | | |

Nguyên tắc:

1. `body { overflow-x: hidden }` là lưới an toàn cuối cùng, **không** phải giấy phép tràn: mọi thẻ `min-w-0`, chuỗi dài `truncate`/`line-clamp`,
   bảng cuộn trong `Card`. Script chụp màn hình báo `overflow` phải bằng 0.
2. Dùng `@container` cho thẻ xuất hiện ở nhiều cột (ô 3D thu nhỏ, bảng việc của AI CEO) để thẻ tự co theo chỗ chứa, không theo viewport.
3. Ở 390 px, mục tiêu chạm ≥ 40 × 40 px (nút `md` h-10; icon-only `p-2` + icon 20 px = 36 px – chấp nhận cho hàng công cụ, không cho hành động chính).
4. Không ẩn thông tin bắt buộc ở di động; chỉ ẩn dòng phụ tiếng Anh (`hidden sm:block`) khi vẫn còn tooltip.

---

## 11. Nguyên tắc dữ liệu

1. **Một nguồn dữ liệu duy nhất** (`tech.single_source_of_truth`): `src/store/officeStore.ts` (zustand) được backend hydrate và cập nhật
   realtime (socket.io). Component không `fetch` riêng, không giữ bản sao dữ liệu miền trong `useState`.
2. **Selector dùng chung** (`src/store/selectors.ts`): `selectHeadlineStats`, `selectTaskCounts`, `selectAgentCounts`, `selectStageCounts`,
   `selectTodaysKeyTasks`, `selectRecentActivities`, `selectPendingApprovals`, `selectOrgTree`, `selectAgentsByDepartment`,
   `selectTasksByAgent`, `selectTasksByDepartment`, `selectAgentWorkload`, `selectDepartmentSummary`, `selectMessagesForAgent`…
   Mọi con số hiển thị ở Topbar, Tổng quan, Dashboard, 3D phải ra từ cùng selector để khớp nhau.
3. **Selector tạo object/array mới** → bắt buộc `useDerived(selector, deps)` (`src/store/hooks.ts`) hoặc `useAgents/useTasks/useApprovals/useProjects`;
   `useOfficeStore` trực tiếp chỉ cho giá trị nguyên thủy / tham chiếu sẵn có (`s.connection`, `s.agents[id]`).
4. **Ghi qua API, không chạm store**: `api.createCeoRequest`, `api.createTask`, `api.updateTask`, `api.decideApproval`, `api.pauseAgent`,
   `api.resumeAgent`, `api.sendAgentMessage`, `api.updateSettings` – sau khi gọi **không** refetch; store tự cập nhật. Lỗi là `ApiError`
   → `<ErrorBanner error={err}/>`.
5. **Trạng thái UI chọn lọc nằm trong store**: `selectedAgentId`, `selectedTaskId`, `selectedDepartmentId`, `cameraFocusAgentId` –
   để trang, 3D, ngăn chi tiết đồng bộ; trạng thái thuần cục bộ (ẩn nhãn, bộ lọc tạm) để trong component.
6. **Dữ liệu Agent hiển thị nguyên văn**, không qua `t()`; chỉ nhãn khung qua i18n (xem chuẩn ngôn ngữ).
7. **Trạng thái tải**: `hydrated === false` → `PageSkeleton`; rỗng → `EmptyState`; mất kết nối → `ConnectionBanner` (dữ liệu cũ vẫn hiển thị).
8. **Định dạng** luôn qua `lib/format.ts` với `locale = useLocale()`.

---

## 12. Checklist review thiết kế

Dùng cho mọi PR có thay đổi giao diện; đính kèm ảnh chụp 1440 × 900 và 390 × 844 của từng trang chạm tới.

**Token & màu**
- [ ] Không có hex mới ngoài `styles/index.css`; màu trạng thái / ưu tiên / phòng ban / chức vụ đi qua `lib/colors.ts`.
- [ ] Mỗi thẻ có `accent` đúng ngữ nghĩa; không quá 2 accent khác nhau trong một hàng thẻ cùng loại.
- [ ] Chữ chỉ dùng `text-text*`; màu dữ liệu không lên chữ thường.

**Chữ & song ngữ**
- [ ] Tiêu đề trang bằng `PageHeader` với `termId` khớp `ROUTES`; tiêu đề thẻ bằng `CardHeader` + `<Term/>`/`BilingualText`.
- [ ] Dòng phụ tiếng Anh dùng `term-secondary` (0,72 em), có `truncate`, cha `min-w-0`; không có chữ < 10 px ngoài cảnh 3D.
- [ ] `pnpm lint:i18n` ✔ và các tiêu chí A1–A13 của chuẩn ngôn ngữ.

**Thành phần**
- [ ] Dùng `Card/StatCard/Badge/Button/ProgressBar/EmptyState/ErrorBanner/PageSkeleton/DrawerShell` – không tự vẽ lại.
- [ ] Tối đa một nút `primary`/`success` mỗi thẻ; nút `success`/`danger` có icon.
- [ ] Trạng thái hover / focus / disabled / loading đều có (kiểm bằng bàn phím Tab).

**Bố cục & responsive**
- [ ] Script chụp màn hình: `overflow = 0`, `console errors = 0` ở cả hai kích thước.
- [ ] Bảng cuộn trong thẻ; lưới dùng mẫu ở mục 4.2; thẻ dùng ở nhiều cột có `@container`.
- [ ] Ở 390 px, hành động chính nhìn thấy mà không cuộn ngang; ngăn chi tiết toàn chiều rộng.

**3D & biểu đồ**
- [ ] Chữ trong cảnh là DOM (`LabelLayer`), có tooltip song ngữ; màu qua `palette.ts`.
- [ ] Biểu đồ dùng `useChartTheme` + `ChartTooltip`; chú giải tiếng Việt; số qua `lib/format.ts`; đọc được ở 390 px.

**Chuyển động & trợ năng**
- [ ] Hoạt ảnh dùng token / ≤ 700 ms; thử với `prefers-reduced-motion: reduce`.
- [ ] `aria-label`/`role` phù hợp, tiếng Việt; tương phản chữ nhỏ ≥ 4,5 : 1 (bảng mục 9.1).

**Dữ liệu**
- [ ] Số liệu lấy từ selector dùng chung; không fetch/giữ bản sao trong component; `useDerived` cho selector tạo object.
- [ ] Có trạng thái tải / rỗng / lỗi / mất kết nối bằng tiếng Việt.

---

## 13. Phụ lục – Mẫu mã nguồn

### 13.1 Thẻ thống kê từ selector dùng chung

```tsx
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDerived } from '@/store/hooks';
import { selectHeadlineStats } from '@/store/selectors';
import { StatCard } from '@/components/ui/StatCard';

export function AgentsStat() {
  const { t } = useTranslation();
  const stats = useDerived(selectHeadlineStats);
  return (
    <StatCard
      icon={<Users className="size-5" />}
      value={stats.agents}
      label={t('glossary:module.ai_agents.label')}        // "Nhân sự AI"
      secondary={t('glossary:module.ai_agents.secondary')} // "AI Agents"
      accent="cyan"
      color="var(--color-brand-cyan)"
    />
  );
}
```

### 13.2 Thẻ có đầu thẻ song ngữ, trạng thái rỗng và lỗi

```tsx
<Card accent="green">
  <CardHeader
    icon={<ListChecks className="size-4" />}
    title={<Term id="module.todays_key_tasks" as="div" primaryClassName="term-primary" secondaryClassName="term-secondary" className="term-stack" />}
    action={<Button variant="ghost" size="sm" iconRight={<ArrowRight className="size-3.5" />}>{t('glossary:action.view_all.label')}</Button>}
  />
  {error ? <ErrorBanner error={error} onRetry={refreshSnapshot} /> : null}
  {tasks.length === 0 ? <EmptyState title={t('common:labels.empty')} /* "Chưa có dữ liệu" – hoặc khóa riêng của màn hình */ /> : <TaskList tasks={tasks} />}
</Card>
```

### 13.3 Huy hiệu và thanh tiến độ theo token

```tsx
<TaskStatusBadge status={task.status} />                     // "Đang thực hiện" · title "In Progress – Đang thực hiện"
<PriorityBadge priority={task.priority} />                   // "Cao"
<ProgressBar value={task.progress} color={TASK_STATUS_COLOR_VAR[task.status]} label={t('glossary:metric.progress.inline')} />
```

### 13.4 Đọc token trong cảnh 3D và biểu đồ

```ts
// 3D – scene/palette.ts
const p = usePalette();                 // p.cyan, p.roomFloor … đã giải mã sang hex
<meshStandardMaterial color={p.roomFloor} emissive={department.accent} />

// Biểu đồ – features/dashboard/chartTheme.ts
const theme = useChartTheme();
<Bar dataKey="leads" fill={theme.leads} />
<CartesianGrid stroke={theme.grid} vertical={false} />
<XAxis tick={{ fill: theme.text, fontSize: 11 }} />
```

---

*Khi mã nguồn và tài liệu lệch nhau, sửa cả hai trong cùng một PR. Token mới phải được thêm vào `styles/index.css`, bảng ở mục 2
và (nếu là màu miền) `lib/colors.ts` cùng lúc.*

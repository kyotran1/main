# ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI

**AI Company Command Center – Trung tâm điều hành công ty AI** · Hybrid Local + Cloud (kết hợp cục bộ và đám mây) · MVP v1.0

Công ty Truyền thông & Marketing vận hành bằng **nhân sự AI** (AI Agent): AI CEO – Giám đốc điều hành AI, AI COO – Giám đốc vận
hành AI, AI Project Manager – Quản lý dự án AI, AI Specialist – Chuyên viên thực thi AI, AI QA Reviewer – Nhân viên kiểm định
chất lượng AI. Chủ doanh nghiệp giao yêu cầu bằng tiếng Việt; hệ thống lập kế hoạch → phân công → thực thi → kiểm định → báo
cáo, và mọi thứ hiển thị theo thời gian thực trên **Văn phòng ảo 3D tương tác**, Dashboard (Bảng điều khiển) và Sơ đồ tổ chức.

> Giao diện 100 % tiếng Việt, thuật ngữ chuyên ngành luôn kèm nghĩa tiếng Việt (ví dụ "Approval Center – Trung tâm phê duyệt").
> Chuẩn này được kiểm tra tự động bằng `pnpm lint:i18n`.

## Tính năng chính

- **Tổng quan** – 5 chỉ số đầu trang, văn phòng 3D thu nhỏ, chức năng chính, công việc trọng tâm, hoạt động gần đây, tiến độ tổng quan.
- **Bảng điều khiển** – KPI marketing (khách hàng tiềm năng, tỷ lệ chuyển đổi, chi phí/khách hàng tiềm năng, ROI), biểu đồ theo tuần,
  trạng thái công việc, luồng 6 giai đoạn, lưới nhân sự AI, phê duyệt nhanh.
- **Văn phòng ảo 3D** – 11 khu (8 phòng ban + phòng họp, sảnh, pantry) dựng từ mặt bằng backend; nhân sự AI di chuyển theo trạng thái
  thật (vào phòng họp khi lập kế hoạch, QA sang phòng ban khi kiểm định, ra pantry khi tạm dừng); bấm nhân sự/phòng để xem chi tiết;
  lọc, nhãn song ngữ, toàn màn hình, camera theo dõi.
- **Trung tâm điều hành AI CEO** – giao yêu cầu, nhận kế hoạch, công việc con và yêu cầu phê duyệt; hội thoại với AI CEO.
- **Quản lý công việc** – bảng, Kanban kéo thả, thẻ cho điện thoại; tạo/sửa công việc; ngăn chi tiết dùng chung.
- **Sơ đồ tổ chức**, **Dự án & Chiến dịch**, **Nhân sự AI (Agent Registry)** với hồ sơ, chat, giao việc, tạm dừng/tiếp tục,
  **Quy trình**, **Trung tâm phê duyệt** (kế hoạch, ngân sách, nội dung, xuất bản, cấp quyền kết nối), **Kỹ năng & Kết nối**
  (Meta Ads, Google Ads, TikTok Ads, Zalo OA, Google Drive, Google Analytics, HubSpot CRM, Canva, Ollama, Anthropic Claude),
  **Nhật ký hoạt động**, **Báo cáo & Phân tích** (xuất JSON/CSV), **Kho tri thức** (bảng thuật ngữ), **Cài đặt**.
- **Một nguồn dữ liệu duy nhất** – backend phát `OfficeSnapshot`, web giữ một store, mọi trang dùng chung bộ chọn nên số liệu luôn khớp;
  đồng bộ realtime qua Socket.IO (WebSocket – kênh đồng bộ thời gian thực).
- **Hybrid Local + Cloud** – backend và dữ liệu chạy trên máy của bạn; bộ não AI chọn `mock` (mặc định, không cần mạng), `ollama`
  (mô hình cục bộ) hoặc `anthropic` (Claude trên đám mây), luôn có dự phòng.
- **Ứng dụng máy tính** (Electron) dùng chung giao diện và từ điển với bản Web.

Ảnh tham chiếu thiết kế: giao diện tối nền navy sâu, thẻ kính viền neon cyan/tím/xanh lá/vàng/đỏ, số liệu to đậm, nhãn song ngữ
(tiếng Việt đậm, tiếng Anh nhỏ mờ bên dưới). Xem `docs/UI_DESIGN_SYSTEM.md`.

## Yêu cầu môi trường

- Node.js ≥ 20
- pnpm 10 (`corepack enable` hoặc `npm i -g pnpm`; repo khai báo `packageManager: pnpm@10.28.0`)
- Trình duyệt hỗ trợ WebGL cho văn phòng 3D (các trang khác vẫn hoạt động nếu không có)
- Tùy chọn: [Ollama](https://ollama.com) cho mô hình cục bộ; khóa API Anthropic cho mô hình đám mây

## Cài đặt và chạy

```bash
pnpm install
pnpm dev
```

- Giao diện Web: http://localhost:5173 (Vite, HMR; proxy `/api` và `/socket.io` tới backend)
- Backend (Local Runtime): http://localhost:4000 – `GET /api/health`, `GET /api/state`, WebSocket `/socket.io`
- Lần chạy đầu backend tạo dữ liệu mẫu tiếng Việt (10 nhân sự AI, 15 công việc, 4 phê duyệt, 3 dự án, 10 công cụ kết nối, KPI 4 tuần)
  và lưu vào `apps/api/data/office-state.json`; mô phỏng tiến độ chạy mỗi 5 giây.

Ứng dụng máy tính (cần `pnpm dev` đang chạy ở cửa sổ khác):

```bash
pnpm dev:desktop
```

Bản build:

```bash
pnpm build                                   # packages → apps (api: dist/, web: dist/, desktop: dist/)
pnpm --filter @ads-nolimit/api start         # node dist/server.js tại :4000
pnpm --filter @ads-nolimit/web preview       # xem bản build tại :4173
```

Tiện ích khi phát triển/demo:

```bash
curl -X POST http://localhost:4000/api/admin/tick    # chạy một nhịp mô phỏng ngay
curl -X POST http://localhost:4000/api/admin/reset   # đặt lại dữ liệu mẫu
```

## Biến môi trường

Đặt trong shell hoặc tệp `.env` (đã bị bỏ qua trong git). Không bao giờ đưa khóa API vào mã nguồn.

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_PROVIDER` | `mock` | Bộ não nhân sự AI: `mock` (mô phỏng, không cần mạng/khóa) · `ollama` (cục bộ) · `anthropic` (đám mây). Mọi lựa chọn tự quay về `mock` khi mô hình không khả dụng |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Máy chủ Ollama |
| `OLLAMA_MODEL` | `qwen2.5:14b` | Mô hình Ollama |
| `ANTHROPIC_API_KEY` | – | Khóa API Anthropic (bắt buộc khi `AI_PROVIDER=anthropic`) |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | Mô hình Claude |
| `PORT` | `4000` | Cổng backend |
| `HOST` | `127.0.0.1` | Địa chỉ backend lắng nghe |
| `CORS_ORIGIN` | tất cả | Origin được phép |
| `DATA_FILE` | `apps/api/data/office-state.json` | Tệp trạng thái JSON |
| `SEED_RESET` | – | `1` → bỏ tệp trạng thái cũ, dựng lại dữ liệu mẫu khi khởi động |
| `SIMULATION` | bật | `off` → tắt mô phỏng tiến độ tự động |
| `VITE_API_PROXY_TARGET` | `http://localhost:4000` | Đích proxy của Vite dev/preview |
| `VITE_API_BASE_URL` | rỗng | Tiền tố API khi giao diện và backend khác origin (bản build) |
| `ADS_NOLIMIT_WEB_URL` | – | URL Web cho Electron khi phát triển (`pnpm dev:desktop` đặt sẵn) |

Ví dụ chạy với mô hình cục bộ:

```bash
AI_PROVIDER=ollama OLLAMA_MODEL=qwen2.5:14b pnpm dev
```

Ví dụ chạy với Claude trên đám mây:

```bash
AI_PROVIDER=anthropic ANTHROPIC_API_KEY=sk-ant-... pnpm dev
```

## Lệnh kiểm tra

| Lệnh | Nội dung |
|---|---|
| `pnpm typecheck` | TypeScript strict ở 5 gói |
| `pnpm lint:i18n` | Chuẩn ngôn ngữ giao diện: khớp khóa vi-VN/en-US, không nhãn chỉ tiếng Anh, không hard-code chuỗi trong JSX, khóa `t()` tồn tại |
| `pnpm test` | vitest: engine điều phối (`apps/api`), bảng thuật ngữ/i18n (`packages/i18n`), giao diện (`apps/web`) |
| `pnpm glossary:docs` | Sinh lại `docs/GLOSSARY.md` từ `packages/i18n/src/glossary.ts` |
| `pnpm e2e` | Kiểm thử đầu cuối (`apps/web/e2e/run.mjs`) |
| `pnpm check` | Chạy toàn bộ: typecheck → lint:i18n → test → build |

## Cấu trúc thư mục

```
apps/
  api/        Local Runtime: Fastify + Socket.IO, OfficeStore (nguồn dữ liệu duy nhất), OfficeEngine (AI CEO, 6 giai đoạn, mô phỏng),
              providers (mock | ollama | anthropic), seed dữ liệu mẫu tiếng Việt, tệp JSON trạng thái
  web/        React 19 + Vite 7 + Tailwind v4: store zustand duy nhất, 15 trang, features/<phân hệ>, văn phòng 3D (three + react-three-fiber)
  desktop/    Electron bọc Web, menu song ngữ dùng chung @ads-nolimit/i18n
packages/
  shared/     Kiểu dữ liệu miền, hằng quy trình, sự kiện realtime, hợp đồng API, zod schemas
  i18n/       Từ điển vi-VN/en-US theo namespace, bảng thuật ngữ dùng chung, hook/component React
scripts/      i18n-lint.ts, generate-glossary-doc.ts
docs/         Tài liệu (tiếng Việt)
```

## Tài liệu

| Tài liệu | Nội dung |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Yêu cầu sản phẩm: tầm nhìn, người dùng, mô hình AI CEO, 11 phòng ban, quy trình 6 giai đoạn và luật phê duyệt, tính năng theo phân hệ, yêu cầu ngôn ngữ, phi chức năng, lộ trình |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Kiến trúc Hybrid Local + Cloud, sơ đồ thành phần, nguồn dữ liệu duy nhất, sự kiện realtime, hợp đồng API, mã lỗi, engine, mô hình dữ liệu, biến môi trường, ADR |
| [docs/IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md) | Trạng thái triển khai theo phân hệ, chuẩn ngôn ngữ, dữ liệu một nguồn, 3D, chất lượng, phát hành |
| [docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md](docs/VIETNAMESE_UI_LANGUAGE_STANDARD.md) | Chuẩn ngôn ngữ giao diện tiếng Việt (bắt buộc cho mọi màn hình) |
| [docs/UI_DESIGN_SYSTEM.md](docs/UI_DESIGN_SYSTEM.md) | Hệ thống thiết kế: token, thành phần, 3D, biểu đồ, responsive, khả năng tiếp cận |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | Bảng thuật ngữ chuyên ngành dùng chung (sinh tự động) |
| [CLAUDE.md](CLAUDE.md) | Quy tắc bắt buộc cho mọi phiên Claude Code / kỹ sư: ngôn ngữ, dữ liệu một nguồn, thiết kế, backend, commit/PR |

## Giấy phép và ghi chú

- Mã nguồn riêng (private) của ADS-NOLIMIT; chưa công bố giấy phép mã nguồn mở.
- Tên thương hiệu Meta Ads, Google Ads, TikTok Ads, Zalo OA, Google Drive, Google Analytics, HubSpot CRM, Canva, Ollama, Anthropic Claude
  thuộc về chủ sở hữu tương ứng; trong MVP các công cụ kết nối là dữ liệu mô phỏng.
- Số liệu trong dữ liệu mẫu (KPI, ngân sách, tiến độ) chỉ để minh họa.

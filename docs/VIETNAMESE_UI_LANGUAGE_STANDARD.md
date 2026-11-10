# Chuẩn ngôn ngữ giao diện tiếng Việt – Vietnamese UI Language Standard

> **Tài liệu bắt buộc** của dự án ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI.
> Mọi chức năng hiện tại và tương lai (Web, Desktop, Văn phòng ảo 3D, Dashboard – Bảng điều khiển, báo cáo của
> AI Agent – nhân sự AI) đều phải tuân thủ. Việc tuân thủ được kiểm tra tự động bằng `pnpm lint:i18n`, bộ kiểm thử
> `packages/i18n` (vitest) và kiểm thử đầu cuối (e2e); vi phạm làm hỏng lệnh `pnpm check` trong CI.
>
> Phiên bản: 1.1 · Phạm vi: toàn bộ monorepo (`apps/web`, `apps/desktop`, `apps/api`, `packages/i18n`, `packages/shared`).
> Tài liệu liên quan: [`UI_DESIGN_SYSTEM.md`](./UI_DESIGN_SYSTEM.md) (hệ thống thiết kế) ·
> [`GLOSSARY.md`](./GLOSSARY.md) (bảng thuật ngữ – sinh tự động từ `packages/i18n/src/glossary.ts`, không sửa tay).

---

## Mục lục

1. [Phạm vi và nguyên tắc](#1-phạm-vi-và-nguyên-tắc)
2. [Quy tắc hiển thị thuật ngữ tiếng Anh](#2-quy-tắc-hiển-thị-thuật-ngữ-tiếng-anh)
3. [Tên chức vụ nhân sự AI song ngữ](#3-tên-chức-vụ-nhân-sự-ai-song-ngữ)
4. [Kiến trúc đa ngôn ngữ (i18n)](#4-kiến-trúc-đa-ngôn-ngữ-i18n)
5. [Ngôn ngữ giao tiếp của AI Agent](#5-ngôn-ngữ-giao-tiếp-của-ai-agent)
6. [Tiêu chí nghiệm thu UI/UX (Acceptance Criteria)](#6-tiêu-chí-nghiệm-thu-uiux-acceptance-criteria)
7. [Bảng quyết định các trường hợp đặc biệt](#7-bảng-quyết-định-các-trường-hợp-đặc-biệt)
8. [Phụ lục – Thuật ngữ chính](#8-phụ-lục--thuật-ngữ-chính)
9. [Lịch sử thay đổi](#9-lịch-sử-thay-đổi)

---

## 1. Phạm vi và nguyên tắc

### 1.1 Phạm vi áp dụng

Tiếng Việt (mã locale `vi-VN`) là **ngôn ngữ mặc định và bắt buộc** của toàn bộ sản phẩm. Tiếng Anh (`en-US`) là
ngôn ngữ thứ hai, chỉ bật khi người dùng chủ động chọn trong *Cài đặt hệ thống – Settings* (nhãn trong giao diện:
`common:language.en-US` = "English (bản xem trước)"). Hệ thống **không** suy ra ngôn ngữ từ trình duyệt hay hệ điều hành.

| Khu vực | Ví dụ cụ thể trong mã nguồn | Bắt buộc vi-VN |
|---|---|---|
| Ứng dụng Web (`apps/web`) | Menu trái (`Sidebar`), thanh trên (`Topbar`), mọi trang trong `features/*`, ngăn chi tiết (`DrawerShell`), hộp thoại, thông báo | ✔ |
| Ứng dụng máy tính – Desktop App (`apps/desktop`) | Menu Electron, hộp thoại "Giới thiệu", hộp lỗi khởi động (`desktop:errors.webMissing`) | ✔ (dùng chung từ điển với Web) |
| Văn phòng ảo 3D – Virtual Office 3D (`features/office3d`) | Bảng tên phòng (`RoomLabel`), nhãn nhân sự (`AgentLabel`), bong bóng chi tiết (`AgentTooltip`), biển hiệu công ty, thanh công cụ (`SceneToolbar`), chú giải (`SceneLegend`), bảng phòng ban (`DepartmentPanel`), thông báo WebGL | ✔ |
| Bảng điều khiển – Dashboard & biểu đồ (`features/dashboard`, `features/reports`) | Tên chỉ số, trục, chú giải (legend), tooltip (`ChartTooltip`), trạng thái rỗng | ✔ |
| Tên phòng ban – Department | 11 phòng/khu trong bố cục 3D (`department.*`, khớp `DEPARTMENT_IDS` của backend) | ✔ |
| Chức vụ & hồ sơ nhân sự AI – Agent Registry | 5 chức vụ (`role.*`), 6 trạng thái (`agent_status.*`), thẻ hồ sơ, biểu đồ hiệu suất, ngăn chi tiết | ✔ |
| Quản lý công việc – Task Management | 8 trạng thái (`task_status.*`), 3 mức ưu tiên (`priority.*`), cột bảng, bộ lọc, biểu mẫu tạo việc | ✔ |
| Quy trình – Workflow | 6 giai đoạn `receive → plan → assign → execute → review → report` (`stage.*`), chức vụ phụ trách (`STAGE_OWNER_ROLE`) | ✔ |
| Trung tâm phê duyệt – Approval Center | 5 loại / 3 trạng thái phê duyệt (`approval_type.*`, `approval_status.*`), nút *Duyệt* / *Từ chối*, ghi chú | ✔ |
| Cài đặt hệ thống – Settings | Ngôn ngữ, chế độ vận hành (`execution_mode.*`), tên chủ doanh nghiệp / công ty | ✔ |
| Thông báo / cảnh báo / lỗi | `ErrorBanner`, `ConnectionBanner`, dải trạng thái realtime (`MiniSyncBadge`), `errors:codes.*` | ✔ |
| Báo cáo của AI CEO và tin nhắn Agent | Nội dung do mô hình sinh ra (xem mục 5) | ✔ (ở tầng system prompt) |
| Hướng dẫn người dùng, tài liệu trong `docs/` | Tệp này, `UI_DESIGN_SYSTEM.md`, `GLOSSARY.md`, chú thích trong mã nguồn | ✔ |

### 1.2 Năm nguyên tắc nền tảng

1. **Tiếng Việt là nhãn chính.** Người dùng đọc tiếng Việt trước; thuật ngữ tiếng Anh chuyên ngành chỉ đóng vai trò
   đối chiếu (dòng phụ, trong ngoặc, tooltip). Không bao giờ có nhãn *chỉ* tiếng Anh chuyên ngành.
2. **Một thuật ngữ – một bản dịch.** Mỗi thuật ngữ tiếng Anh có đúng **một** nghĩa tiếng Việt chuẩn trên toàn hệ thống,
   khai báo tại `packages/i18n/src/glossary.ts` (hằng `GLOSSARY`). Dashboard, Văn phòng 3D, Desktop, báo cáo Agent đều tra
   cùng một bảng. (Kiểm thử trong `glossary.test.ts`: "mỗi thuật ngữ tiếng Anh chỉ có một bản dịch tiếng Việt trong cùng nhóm".)
3. **Không hard-code chữ hiển thị.** Mọi chuỗi người dùng nhìn thấy – kể cả `title`, `placeholder`, `aria-label`, `alt`,
   `label` – phải đi qua `t('ns:key')`, `<Term id="…"/>` hoặc `bilingual(id)`. Lint chặn vi phạm (`[hardcoded-jsx]`, `[hardcoded-attr]`).
4. **Tách dữ liệu khỏi bản dịch.** Tiêu đề công việc, tin nhắn, báo cáo, tên dự án, tên công cụ kết nối do Agent/Owner tạo
   là **dữ liệu** từ backend – hiển thị nguyên văn, không nằm trong tệp locale.
5. **Không dịch định danh kỹ thuật.** `id`, enum (`in_progress`, `ai_ceo`), đường dẫn route (`/approvals`), khóa JSON,
   tên API, kênh IPC (`desktop:set-locale`), biến môi trường (`AI_PROVIDER`), tên mô hình, tên thương hiệu – giữ nguyên.

---

## 2. Quy tắc hiển thị thuật ngữ tiếng Anh

### 2.1 Cặp thuật ngữ bắt buộc

Các cặp dưới đây là **chuẩn cứng**; mọi màn hình phải dùng đúng từng chữ (lấy từ glossary, không gõ lại):

| Thuật ngữ tiếng Anh (`term`) | Nghĩa tiếng Việt chuẩn (`meaning`) | Id glossary |
|---|---|---|
| Dashboard | Bảng điều khiển | `module.dashboard` |
| AI CEO | Giám đốc điều hành AI | `role.ai_ceo` |
| Workflow | Quy trình làm việc | `module.workflow` |
| Task Management | Quản lý công việc | `module.task_management` |
| Agent Registry | Danh sách và cấu hình nhân sự AI | `module.agent_registry` |
| Skill & Connector | Kỹ năng và công cụ kết nối | `module.skill_connector` |
| Approval Center | Trung tâm phê duyệt | `module.approval_center` |
| KPI | Chỉ số đánh giá hiệu suất | `module.kpi` |
| Virtual Office 3D | Văn phòng ảo 3D | `module.virtual_office_3d` |
| AI CEO Command Center | Trung tâm điều hành AI CEO | `module.ceo_command_center` |
| Activity Log | Nhật ký hoạt động | `module.activity_log` |
| Organization Chart | Sơ đồ tổ chức | `module.org_chart` |
| Hybrid Local + Cloud | Kết hợp cục bộ + đám mây | `tech.hybrid_local_cloud` |

### 2.2 Dấu phân cách chuẩn

Giữa thuật ngữ và nghĩa dùng **en dash có khoảng trắng hai bên** (` – `, U+2013), khai báo một nơi duy nhất:

```ts
// packages/i18n/src/index.ts
export const TERM_SEPARATOR = ' – ';
```

- ✔ `Dashboard – Bảng điều khiển`
- ✘ `Dashboard - Bảng điều khiển` (gạch nối ASCII), ✘ `Dashboard — Bảng điều khiển` (em dash), ✘ `Dashboard: Bảng điều khiển`.
- Dạng trong ngoặc chỉ dùng cho **văn xuôi** (báo cáo Agent, mô tả dài): "KPI (chỉ số đánh giá hiệu suất)".
- Khi tự ghép chuỗi tooltip trong component (chỉ khi không dùng được `bilingual().inline`), vẫn phải dùng đúng ký tự ` – `
  (ví dụ `Sidebar`: `` title={`${label} – ${secondary}`} ``).

### 2.3 Ba dạng hiển thị và khi nào dùng

Mọi dạng đều được `bilingual()` / `<Term/>` sinh sẵn; component không tự ghép chuỗi trừ các trường hợp nêu ở 2.2.

| Dạng | Ví dụ (vi-VN) | Khi dùng | Cách gọi |
|---|---|---|---|
| **Inline** – một dòng | `Dashboard – Bảng điều khiển` | Tooltip (`title`), tùy chọn trong `<select>`, văn bản mô tả, nhãn menu Desktop, tiêu đề trang ở màn hình rộng | `<Term id="module.dashboard" format="inline"/>` · `bilingual(id).inline` · `t('glossary:module.dashboard.inline')` |
| **Stacked** – xếp chồng, tiếng Việt đậm trên, tiếng Anh nhỏ mờ dưới | **Bảng điều khiển**<br><small>Dashboard</small> | **Mặc định** cho menu trái, thẻ thống kê (`StatCard`), đầu thẻ (`CardHeader`), tiêu đề mục trong ngăn chi tiết, ô "Chức năng chính", bảng tên phòng 3D | `<Term id="…"/>` (mặc định `format="stacked"`) · class `term-stack / term-primary / term-secondary` · `<BilingualText primary secondary/>` |
| **Tooltip** – chỉ hiện nhãn chính (hoặc dạng rút gọn), `title` luôn chứa song ngữ | Chip `Đang thực hiện` (hover: `In Progress – Đang thực hiện`) | Huy hiệu (`Badge`), chip, nhãn nhân sự 3D, tab, không gian hẹp < 120 px | `<Term format="primary"/>` hoặc `format="short"` · `TaskStatusBadge`, `StageBadge`, `DepartmentName format="short"` |

**Thứ tự hai ngôn ngữ trong dạng inline** – có hai thứ tự được phép, mỗi thứ tự gắn với một ngữ cảnh:

| Thứ tự | Khi nào | Nơi triển khai thật |
|---|---|---|
| `EN – VI` ("Dashboard – Bảng điều khiển") | Tooltip, tùy chọn `<select>`, văn xuôi, mọi chỗ gọi `bilingual().inline` / `glossary:*.inline` | `Term` (`title`), `StatusBadges`, `DepartmentName`, `LabelLayer` (`title={label.inline}`), `roleTitle()` |
| `VI – EN` ("Bảng điều khiển – Dashboard") | **Tiêu đề** mà tiếng Việt là nhãn chính nhưng phải nằm trên một dòng: tiêu đề trang (`PageHeader` ở ≥ 768 px), nhãn menu ứng dụng Desktop, tooltip của mục menu trái | `PageHeader` (`primary` + `– secondary`), `apps/desktop/src/main.ts#termLabel`, `Sidebar` (`title`) |

Không trộn hai thứ tự trong cùng một thành phần. Khi phân vân, dùng `EN – VI` (dạng do `bilingual()` sinh).

Quy tắc chọn dạng:

1. Màn hình rộng (≥ 768 px, breakpoint `md`): tiêu đề trang dùng một dòng `VI – EN` (`PageHeader` tự tách thành 2 dòng ở
   màn hình hẹp: tiếng Việt lớn, tiếng Anh `text-xs` bên dưới).
2. Danh sách / menu / thẻ: **stacked**; dòng phụ dùng `term-secondary` (0.72em, `text-text-muted`), có `truncate`, vùng bao có `min-w-0`.
3. Không đủ chỗ cho hai dòng: **tooltip** – nhãn chính tiếng Việt (hoặc `short`) + `title` song ngữ.
   Không bao giờ hiển thị riêng `secondary` (chỉ tiếng Anh) mà thiếu tiếng Việt ở cùng vùng nhìn.
4. Ở locale `en-US`: `primary` là thuật ngữ tiếng Anh, `secondary` là nghĩa tiếng Việt, `inline` và `short` chỉ còn `EN`;
   giao diện en-US được phép ẩn dòng phụ.

### 2.4 Dạng rút gọn (`short`)

Một số thuật ngữ có `viShort` cho không gian hẹp (chip, tab, bảng tên phòng 3D, bong bóng):
`Virtual Office 3D → "Văn phòng 3D"`, `Agent Registry → "Danh sách nhân sự AI"`, `Strategy & Research → "Chiến lược"`,
`AI QA Reviewer → "Kiểm định chất lượng AI"`, `Receive → "Tiếp nhận"`, `Cost per Lead (CPL) → "Chi phí/khách hàng"`,
`Task → "Công việc"`. Khi không có `viShort`, `short` = `vi`. Nhãn rút gọn **luôn** kèm tooltip đầy đủ.

Trường hợp `short` trùng với tiếng Anh (phòng *Marketing*: `viShort: 'Marketing'`): lớp nhãn 3D so sánh
`label.short.toLowerCase() === label.secondary.toLowerCase()` và chuyển sang nhãn đầy đủ "Phòng Marketing (Tiếp thị)"
để không lặp "Marketing / Marketing" (`features/office3d/LabelLayer.tsx#RoomLabel`). Component mới gặp tình huống
tương tự phải áp dụng cùng cách xử lý.

---

## 3. Tên chức vụ nhân sự AI song ngữ

Năm chức vụ, định danh kỹ thuật là giá trị enum `AgentRole` (`AGENT_ROLES` trong `@ads-nolimit/shared`):

| Enum (`agent.role`) | Thuật ngữ tiếng Anh | Nghĩa tiếng Việt chuẩn | Dạng rút gọn | Màu nhận diện (`ROLE_COLOR_VAR`) |
|---|---|---|---|---|
| `ai_ceo` | AI CEO | Giám đốc điều hành AI | – | `--color-brand-gold` |
| `ai_coo` | AI COO | Giám đốc vận hành AI | – | `--color-brand-violet` |
| `ai_project_manager` | AI Project Manager | Quản lý dự án AI | – | `--color-brand-blue` |
| `ai_specialist` | AI Specialist | Chuyên viên thực thi AI | – | `--color-brand-cyan` |
| `ai_qa_reviewer` | AI QA Reviewer | Nhân viên kiểm định chất lượng AI | Kiểm định chất lượng AI | `--color-brand-magenta` |

Chuỗi đầy đủ bắt buộc (dùng trong hồ sơ, báo cáo, tài liệu):
**AI CEO – Giám đốc điều hành AI · AI COO – Giám đốc vận hành AI · AI Project Manager – Quản lý dự án AI ·
AI Specialist – Chuyên viên thực thi AI · AI QA Reviewer – Nhân viên kiểm định chất lượng AI.**

Cách hiển thị bắt buộc – **không ghép chuỗi tay**:

```tsx
import { AgentName, useAgentDisplayName } from '@/components/domain';
import { bilingual, termIdForRole, roleTitle } from '@ads-nolimit/i18n';

<AgentName agent={agent} />                 // stacked: "AI CEO" / "Giám đốc điều hành AI"
                                            // (có displayName: "Minh" / "AI CEO – Giám đốc điều hành AI")
<AgentName agent={agent} format="inline" /> // "AI CEO – Giám đốc điều hành AI"  (hoặc "Minh · AI CEO – Giám đốc điều hành AI")
<AgentName agent={agent} format="primary" />// "AI CEO" hoặc "Minh" – tooltip song ngữ
roleTitle('ai_ceo', 'vi-VN')                // "AI CEO – Giám đốc điều hành AI"
bilingual(termIdForRole(agent.role), locale).meaning // "Giám đốc điều hành AI"
```

Quy ước:

- **Ngoại lệ có chủ đích**: trong dạng stacked của `AgentName`, dòng chính là thuật ngữ chức vụ tiếng Anh ("AI CEO")
  vì nó đóng vai trò **tên riêng** của nhân sự (giống ảnh tham chiếu), dòng phụ là nghĩa tiếng Việt. Đây là trường hợp
  duy nhất tiếng Anh được đứng trên; mọi thuật ngữ khác vẫn tiếng Việt ở trên.
- Trong nhật ký hoạt động (`activity:templates.*`), biến `{{agent}}` được điền bằng `useAgentDisplayName()`:
  `"Minh (AI CEO)"` nếu có tên gọi, ngược lại `"AI CEO – Giám đốc điều hành AI"`.
- Ảnh đại diện (`AgentAvatar`) lấy chữ viết tắt từ chức vụ (`initialsFromRole`: `ai_ceo → "C"`, `ai_project_manager → "PM"`),
  vòng màu theo chức vụ, chấm trạng thái theo `AGENT_STATUS_COLOR_VAR`.
- Chữ "Agent" đứng một mình dịch là **"nhân sự AI"** (`tech.ai_agent`: "Nhân sự AI (tác tử AI)"); không dùng "đặc vụ", "tác nhân".
- "Owner" dịch là **"Chủ doanh nghiệp"** (`module.owner`, `common:owner.*`); trong văn bản có thể viết "Chủ doanh nghiệp (Owner)".

---

## 4. Kiến trúc đa ngôn ngữ (i18n)

### 4.1 Công nghệ

- **i18next** là lõi; **react-i18next** cho React; **i18next-browser-languagedetector** chỉ dùng để đọc/ghi `localStorage`
  (không suy ra ngôn ngữ từ trình duyệt).
- Gói dùng chung **`@ads-nolimit/i18n`** (`packages/i18n`) – được Web (`apps/web`) và Desktop (`apps/desktop`) nhập.
  Backend (`apps/api`) không phụ thuộc i18next; khi cần nhãn song ngữ phía máy chủ dùng `bilingualFromEntry()` thuần TypeScript.
- Kiểu `Locale = 'vi-VN' | 'en-US'` và mọi enum miền (`AgentRole`, `TaskStatus`…) nằm trong `@ads-nolimit/shared`.

### 4.2 Cấu trúc `packages/i18n`

```
packages/i18n/
├── src/
│   ├── glossary.ts      # GLOSSARY (15 nhóm; số mục hiện tại in ở đầu docs/GLOSSARY.md), getGlossaryEntry, listGlossary,
│   │                    #   englishTermSet, buildGlossaryResources
│   ├── resources.ts     # NAMESPACES (20), SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE, resources (nhập JSON tĩnh)
│   ├── index.ts         # initI18n, bilingual/bilingualSafe/bilingualFromEntry, termIdFor*, roleTitle, describeError,
│   │                    #   LOCALE_STORAGE_KEY, TERM_SEPARATOR, normalizeLocale, isLocale
│   ├── react.tsx        # <Term/>, <BilingualText/>, useTerm, useTerms, useLocale
│   └── glossary.test.ts # vitest: id duy nhất, 1 EN → 1 VI, VI có dấu, parity khóa, khởi tạo vi-VN, describeError
└── locales/
    ├── vi-VN/<ns>.json  # 19 tệp: common, nav, activity, errors, overview, dashboard, office3d, ceo, agents, tasks,
    │                    #   workflow, approvals, orgchart, projects, reports, settings, connectors, knowledge, desktop
    └── en-US/<ns>.json  # CÙNG tập khóa với vi-VN (lint [parity] + vitest kiểm tra)
```

Namespace thứ 20, **`glossary`**, không có tệp JSON: được sinh lúc chạy bằng `buildGlossaryResources(locale)`.
Mỗi id `nhóm.khóa` cho ra 7 khóa con:

| Khóa | vi-VN | en-US |
|---|---|---|
| `label` | nghĩa tiếng Việt (`vi`) | thuật ngữ tiếng Anh (`en`) |
| `short` | `viShort` hoặc `vi` | `en` |
| `secondary` | `en` | `vi` |
| `inline` | `EN – VI` | `EN` |
| `term` | `en` (không bao giờ dịch) | `en` |
| `meaning` | `vi` | `vi` |
| `note` | `noteVi` (giải thích thêm, có thể rỗng) | `noteVi` |

Ví dụ: `t('glossary:module.dashboard.inline')` → `"Dashboard – Bảng điều khiển"`; `t('glossary:module.kpi.note')` →
`"Key Performance Indicator – thước đo kết quả then chốt của chiến dịch/công ty."`.

### 4.3 Hằng số và API chính

```ts
import {
  initI18n, DEFAULT_LOCALE /* 'vi-VN' */, FALLBACK_LOCALE /* 'vi-VN' */, SUPPORTED_LOCALES /* ['vi-VN','en-US'] */,
  NAMESPACES, LOCALE_STORAGE_KEY /* 'ads-nolimit.locale' */, TERM_SEPARATOR /* ' – ' */,
  bilingual, bilingualSafe, bilingualFromEntry, roleTitle, describeError, normalizeLocale, isLocale,
  termIdForRole, termIdForDepartment, termIdForTaskStatus, termIdForAgentStatus, termIdForPriority,
  termIdForStage, termIdForApprovalType, termIdForApprovalStatus, termIdForProjectStatus, termIdForExecutionMode,
  GLOSSARY, getGlossaryEntry, listGlossary, englishTermSet, buildGlossaryResources,
} from '@ads-nolimit/i18n';
import { Term, BilingualText, useTerm, useTerms, useLocale } from '@ads-nolimit/i18n/react';
```

- `initI18n({ lng, instance, overrides })` – khởi tạo i18next với toàn bộ `resources`, `defaultNS: 'common'`,
  `load: 'currentOnly'`, `interpolation.escapeValue: false`, `returnNull/returnEmptyString: false`, `saveMissing: false`.
  Trả về instance đã có nếu `isInitialized`.
- `bilingual(id, locale = 'vi-VN')` → `BilingualLabel { primary, secondary, inline, short, note, term, meaning }`.
  **Ném lỗi** khi id không tồn tại (phát hiện sớm trong kiểm thử: `expect(() => bilingual('module.khong_ton_tai')).toThrow()`).
  `bilingualSafe` trả về id thô ở mọi trường – chỉ dùng cho hiển thị không quan trọng (và là hàm nền của `useTerms()`).
- `termIdFor*(enum)` – ánh xạ enum miền → id glossary (`'ai_ceo' → 'role.ai_ceo'`, `'in_progress' → 'task_status.in_progress'`).
  Mọi enum mới của `@ads-nolimit/shared` phải có hàm ánh xạ tương ứng.
- `roleTitle(role, locale)` = `bilingual(termIdForRole(role), locale).inline`.
- `describeError(t, code)` – diễn giải mã lỗi API thành `{ title, explain }` tiếng Việt qua `errors:codes.<code>`;
  mã lạ rơi về `errors:codes.internal` và nối thêm ` (code)` để kỹ thuật viên tra cứu. Các mã đã có:
  `not_found`, `validation_failed`, `conflict`, `agent_paused`, `approval_already_decided`, `provider_unavailable`,
  `rate_limited`, `internal`, `network`, `websocket_disconnected`.
- `normalizeLocale(x)` – `'vi*' → 'vi-VN'`, `'en*' → 'en-US'`, còn lại → `DEFAULT_LOCALE`.
- `<Term id format as className primaryClassName secondaryClassName suffix/>` – 5 `format`:
  `inline | stacked | primary | short | secondary`; mọi dạng đều có `title="EN – VI"`; dạng `stacked` gắn
  `data-term`, `data-term-primary`, `data-term-secondary` để e2e kiểm tra. `as` mặc định `span` (dùng `div`/`h2` cho stacked trong tiêu đề).
- `<BilingualText primary secondary/>` – cặp nhãn tự do cho khóa i18n đã có sẵn `label/secondary`; cũng gắn `data-term-primary/secondary`.
- `useTerm(id)` – `bilingual(id, useLocale())`; `useTerms()` – trả hàm tra cứu an toàn cho bảng/danh sách.
- `useLocale()` – trả `'vi-VN' | 'en-US'` đã chuẩn hóa từ `i18n.resolvedLanguage`.

### 4.4 Web: khởi tạo và lưu lựa chọn ngôn ngữ (`apps/web/src/i18n.ts`)

- `setupI18n()` gắn `LanguageDetector` + `initReactI18next` rồi gọi `initI18n` với `detection.order = ['localStorage']`,
  `lookupLocalStorage = LOCALE_STORAGE_KEY`, `caches = ['localStorage']`, `supportedLngs = SUPPORTED_LOCALES`,
  `fallbackLng = 'vi-VN'`, `nonExplicitSupportedLngs: false`.
  → Lần đầu mở ứng dụng **luôn** là tiếng Việt, bất kể ngôn ngữ trình duyệt.
- `changeLocale(locale)` đổi ngôn ngữ và ghi `localStorage['ads-nolimit.locale']` (bọc `try/catch` khi bị chặn).
- Thuộc tính `<html lang>` được đặt `vi` hoặc `en` (`applyDocumentLocale`) để trình đọc màn hình phát âm đúng;
  cập nhật lại trên sự kiện `languageChanged`.

### 4.5 Desktop dùng chung từ điển (`apps/desktop/src/main.ts`)

- Tiến trình chính Electron gọi `initI18n({ lng: 'vi-VN' })` và dựng menu từ **cùng** namespace `desktop`, `common` và glossary:
  `termLabel('module.settings')` → `"Cài đặt hệ thống – Settings"` (vi, thứ tự `VI – EN` – xem 2.3) / `"Settings"` (en).
- Menu *Điều hướng* liệt kê đúng các phân hệ của Web (`module.overview`, `module.dashboard`, `module.virtual_office_3d`,
  `module.ceo_command_center`, `module.task_management`, `module.approval_center`, `module.settings`) và điều hướng tới
  cùng route path (`/`, `/dashboard`, `/office`, `/ceo`, `/tasks`, `/approvals`, `/settings`).
- IPC: `desktop:get-locale`, `desktop:set-locale` (renderer gọi), sự kiện `desktop:locale-changed` (main phát) –
  khi đổi ngôn ngữ trong Web, menu Desktop đổi theo và ngược lại. Tên kênh IPC là định danh kỹ thuật, không dịch.
- Tiêu đề cửa sổ: `` `${t('common:app.name')} – ${t('common:app.subtitle')}` `` = "ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI".
- Hộp thoại lỗi khởi động dùng `desktop:errors.webMissing.{title,explain}` – có giải thích tiếng Việt và lệnh khắc phục.
- Màu nền cửa sổ `#070b1f` phải trùng `--color-bg-base` để không chớp trắng khi tải.

### 4.6 Quy tắc viết khóa locale

1. Khóa theo cấu trúc `namespace:nhóm.khóa` (camelCase), ví dụ `tasks:toolbar.createTask`, `office3d:toolbar.filter.label`.
2. Cần song ngữ ngoài glossary → cặp `label` + `secondary` (hoặc `xxx` + `xxxSecondary`), ví dụ
   `common:status.systemRunning = "Đang hoạt động"`, `common:status.systemRunningSecondary = "Running / Active"`.
   Lint **bỏ qua** kiểm tra "chỉ tiếng Anh" với các khóa kết thúc bằng `secondary | term | short | inline | shortcut | en | id | key`
   (không phân biệt hoa thường).
3. Số nhiều: `key_one` / `key_other` với `{{count}}` – i18next chọn hậu tố theo `Intl.PluralRules`; tiếng Việt thực tế chỉ dùng
   dạng `other`, nhưng **vẫn khai báo cả `_one`** để hai tệp cùng tập khóa với en-US (ví dụ `common:units.tasks_one/_other`,
   `common:time.minutesAgo_one/_other`).
4. Biến nội suy đặt tên có nghĩa: `{{agent}}`, `{{title}}`, `{{count}}`, `{{progress}}`, `{{time}}`, `{{version}}`, `{{name}}`.
5. Thông điệp lỗi: `errors:codes.<code>.{title, explain}` – `explain` mở đầu bằng thuật ngữ gốc rồi gạch sang giải thích:
   `"Agent Paused – Hãy cho nhân sự AI tiếp tục (Resume) trước khi giao việc."`
6. Giá trị vi-VN phải có dấu tiếng Việt; chỉ được không dấu khi là tên thương hiệu / viết tắt trong danh sách cho phép (mục 7).
7. Không nhét dữ liệu động (tên dự án mẫu, số liệu, tên công cụ kết nối) vào tệp locale.
8. Chuỗi trạng thái "đang xử lý" kết thúc bằng `…` (U+2026), không phải ba dấu chấm.

### 4.7 Cấm hard-code – mẫu đúng/sai

```tsx
// ✘ SAI – chữ cố định trong JSX và thuộc tính
<h2>Danh sách nhân sự AI</h2>
<input placeholder="Tìm kiếm" />
<button title="Approve">Duyệt</button>

// ✔ ĐÚNG
<h2><Term id="module.agent_registry" as="h2" /></h2>
<input placeholder={t('common:labels.searchPlaceholder')} aria-label={t('common:labels.search')} />
<Button title={useTerm('action.approve').inline}>{t('glossary:action.approve.label')}</Button>
```

Ngoại lệ được lint chấp nhận trong JSX (`BRAND_ALLOW` trong `scripts/i18n-lint.ts`): tên thương hiệu
(`ADS-NOLIMIT`, `AI OFFICE`, `Meta Ads`, `Google Ads`, `TikTok Ads`, `Google Drive`, `Google Analytics`, `Zalo`, `HubSpot`,
`Canva`, `Ollama`, `Anthropic`, `Claude`, `Facebook`, `TikTok`, `Google`), từ `Owner`, `Ctrl`, viết tắt (`KPI`, `ROI`, `CRM`,
`API`, `MVP`), `Local`, `Cloud`, `Hybrid`; số, ký hiệu (`%`, `–`, `·`, `→`, `…`), mã kỹ thuật viết hoa toàn bộ (`MVP`, đường dẫn),
biểu thức mã. Tệp thật sự không có giao diện có thể đặt chú thích `i18n-lint-ignore-file` (hạn chế dùng, phải ghi lý do).

### 4.8 Quy trình thêm thuật ngữ / khóa mới (checklist)

**Thêm thuật ngữ chuyên ngành (dùng ở ≥ 2 nơi hoặc là enum miền):**

- [ ] Kiểm tra `docs/GLOSSARY.md` xem đã có chưa (tránh hai bản dịch cho một thuật ngữ).
- [ ] Thêm vào `packages/i18n/src/glossary.ts` bằng `g(category, key, en, vi, { viShort?, noteVi? })`, đúng nhóm
      (`module | role | department | task_status | agent_status | priority | stage | approval_type | approval_status |
      project_status | metric | tech | execution_mode | action | connector_category`). Nhóm mới → thêm vào `GlossaryCategory`
      và `CATEGORY_TITLES` trong `scripts/generate-glossary-doc.ts`.
- [ ] `vi` có dấu tiếng Việt; nếu là viết tắt giữ nguyên (ROI, CRM…) phải thêm vào `allowedAscii` trong `glossary.test.ts`.
- [ ] Nếu là enum mới trong `@ads-nolimit/shared` → thêm `termIdFor*` tương ứng (nếu nhóm mới) và màu trong `apps/web/src/lib/colors.ts`.
- [ ] Chạy `pnpm --filter @ads-nolimit/i18n test` và `pnpm glossary:docs` (cập nhật `docs/GLOSSARY.md`, commit kèm).

**Thêm khóa giao diện riêng của một màn hình:**

- [ ] Thêm vào **cả hai** tệp `locales/vi-VN/<ns>.json` và `locales/en-US/<ns>.json`, cùng đường dẫn khóa.
- [ ] Nếu nhãn chứa thuật ngữ tiếng Anh → dùng cặp `label/secondary`; nếu thuật ngữ đã có trong glossary → dùng `<Term/>` thay vì thêm khóa.
- [ ] Nếu cần namespace mới: tạo 2 tệp JSON, nhập trong `resources.ts` (cả hai locale), thêm tên vào `NAMESPACES`.
- [ ] Chạy `pnpm lint:i18n` → phải `✔`, 0 lỗi; xử lý mọi cảnh báo `[vi-suspect]` liên quan.
- [ ] Chụp màn hình ở 1440 × 900 và 390 × 844, kiểm tra không tràn chữ.

**Khi chuyển một cặp `label/secondary` tạm thành thuật ngữ glossary** (gộp sau giai đoạn triển khai song song):
thêm vào `glossary.ts`, thay chỗ gọi bằng `<Term/>`, xóa cặp khóa tạm ở cả hai locale, chạy lại lint để bắt `[missing-key]`.

### 4.9 Lệnh kiểm tra

| Lệnh | Việc làm | Khi nào chạy |
|---|---|---|
| `pnpm lint:i18n` | Chạy `scripts/i18n-lint.ts` – 5 nhóm kiểm tra (mục 4.10); thoát mã 1 khi có lỗi, cảnh báo không chặn | Trước mỗi commit; trong CI qua `pnpm check` |
| `pnpm glossary:docs` | Sinh lại `docs/GLOSSARY.md` từ `GLOSSARY` (`scripts/generate-glossary-doc.ts`) | Sau khi sửa `glossary.ts` |
| `pnpm --filter @ads-nolimit/i18n test` | vitest cho glossary + parity + khởi tạo + `describeError` | Sau khi sửa gói i18n |
| `pnpm --filter @ads-nolimit/web typecheck` | TypeScript strict cho Web (bắt sai kiểu `Locale`, enum, props `format`) | Trước mỗi commit |
| `pnpm e2e` | Kiểm thử đầu cuối trình duyệt (`apps/web/e2e`) – nhãn song ngữ, tràn chữ, console | Trước khi mở PR |
| `pnpm check` | `typecheck && lint:i18n && test && build` – cổng CI | Mỗi PR |

### 4.10 Ý nghĩa từng loại lỗi của `pnpm lint:i18n`

Kết quả đạt có dạng: `✔  Chuẩn ngôn ngữ giao diện đạt: <N> khóa vi-VN, <M> thuật ngữ, <K> cảnh báo.`
(N là tổng khóa đã làm phẳng của 19 namespace JSON; M = `GLOSSARY.length` – cả hai tăng theo tính năng, con số chuẩn là
kết quả lần chạy mới nhất, không ghi cứng vào tài liệu.)

| Mã | Mức | Ý nghĩa | Cách sửa |
|---|---|---|---|
| `[parity]` | Lỗi | Khóa có trong vi-VN nhưng thiếu trong en-US (hoặc ngược lại) ở cùng namespace | Thêm khóa còn thiếu vào tệp kia; không xóa khóa đang dùng |
| `[vi-only-term]` | Lỗi | Giá trị vi-VN (sau khi bỏ `{{biến}}`) **chỉ** là một thuật ngữ tiếng Anh có trong glossary (ví dụ `"Dashboard"`) mà không kèm nghĩa tiếng Việt | Dùng `<Term/>` / `glossary:` thay vì khóa riêng, hoặc đổi thành `EN – VI`, hoặc đưa vào khóa `*Secondary` nếu là dòng phụ |
| `[vi-suspect]` | Cảnh báo | Giá trị vi-VN ≥ 3 từ nhưng không có dấu tiếng Việt (nghi là tiếng Anh chưa dịch) – trừ khi chứa mục trong `BRAND_ALLOW` và ≤ 4 từ | Dịch sang tiếng Việt; nếu đúng là tên riêng, cân nhắc thêm vào `BRAND_ALLOW` |
| `[hardcoded-jsx]` | Lỗi | Văn bản cố định có ≥ 2 chữ cái nằm giữa thẻ JSX trong `apps/web/src` hoặc `apps/desktop/src` (`.tsx`) | Chuyển sang `t()` / `<Term/>`; nếu là định danh kỹ thuật thì viết hoa toàn bộ hoặc đưa vào biến |
| `[hardcoded-attr]` | Lỗi | Thuộc tính `title`, `placeholder`, `aria-label`, `alt`, `label` là chuỗi cố định có ≥ 3 chữ cái liên tiếp | Dùng `t()` hoặc `bilingual(id).inline` |
| `[missing-key]` | Lỗi | Mã gọi `t('ns:key')` (chuỗi tĩnh) nhưng khóa không tồn tại trong vi-VN (gõ sai, khóa chết) | Thêm khóa hoặc sửa tên; khóa có hậu tố `_one/_other`, khóa cha có con và mọi khóa `glossary:` đều được chấp nhận |

Giới hạn của lint cần biết: khóa động (`` t(`errors:codes.${code}.title`) ``) không được kiểm tra `[missing-key]` – hãy đảm bảo
mọi giá trị `code` có mục tương ứng; tệp `.ts` chỉ được kiểm tra `[missing-key]`, không kiểm tra hard-code.

---

## 5. Ngôn ngữ giao tiếp của AI Agent

### 5.1 Nguyên tắc

1. **Báo cáo cho Chủ doanh nghiệp (Owner) luôn bằng tiếng Việt**: kế hoạch, tóm tắt, phản hồi chat, ghi chú kiểm định,
   lý do yêu cầu phê duyệt.
2. **Thuật ngữ chuyên ngành tiếng Anh phải kèm giải thích tiếng Việt trong ngoặc** ở lần xuất hiện đầu trong một thông điệp:
   "KPI (chỉ số đánh giá hiệu suất)", "CPL (chi phí trên mỗi khách hàng tiềm năng)". Nghĩa phải trùng với glossary.
3. **Giao tiếp nội bộ giữa các Agent** (prompt kỹ thuật, JSON trao đổi, nhật ký gỡ lỗi) có thể dùng tiếng Anh, nhưng mọi
   trường sẽ hiển thị cho người dùng (`title`, `summary`, `outline[]`, `replyToOwner`, `note`) phải là tiếng Việt.
4. **Không dịch định danh kỹ thuật**: `departmentId` (`marketing`, `creative_media`…), `role` (`ai_qa_reviewer`), `id`,
   khóa JSON (`estimateHours`), tên API, tên mô hình (`qwen2.5:14b`, `claude-opus-5-5`), biến môi trường (`AI_PROVIDER`,
   `OLLAMA_BASE_URL`, `ANTHROPIC_API_KEY`).
5. Khi được yêu cầu JSON, Agent chỉ trả JSON hợp lệ – phần hiển thị bên trong JSON vẫn là tiếng Việt.

### 5.2 Dẫn chiếu triển khai

System prompt dùng chung cho mọi lời gọi mô hình – `apps/api/src/engine/providers/llm.ts`:

```ts
const SYSTEM_VI = `Bạn là nhân sự AI của công ty ADS-NOLIMIT (Truyền thông & Marketing). Luôn trả lời Owner bằng tiếng Việt.
Khi dùng thuật ngữ chuyên ngành tiếng Anh, hãy kèm nghĩa tiếng Việt trong ngoặc, ví dụ: KPI (chỉ số đánh giá hiệu suất).
Không dịch định danh kỹ thuật (departmentId, role, id, JSON keys). Khi được yêu cầu JSON, chỉ trả về JSON hợp lệ, không giải thích thêm.`;
```

- `LlmBrain.planRequest` yêu cầu JSON `{ title, summary, outline[], subtasks[], replyToOwner }`; prompt viết bằng tiếng Việt,
  liệt kê `departmentId` hợp lệ (`DEPARTMENT_IDS`), tối đa 8 subtasks, luôn có một công việc kiểm định với `departmentId: "strategy"`
  (gán `role: 'ai_qa_reviewer'`). Subtask có `departmentId` lạ bị loại; kết quả rỗng → dùng bản nháp của `MockBrain`.
- `LlmBrain.replyToOwner` – "Hãy trả lời ngắn gọn (tối đa 120 từ) bằng tiếng Việt."
- `LlmBrain.reviewTask` – `{ passed, note }` với `note` bằng tiếng Việt.
- Nhà cung cấp (`AI_PROVIDER`, `providers/index.ts`): `mock` (mô phỏng, mặc định), `ollama` (cục bộ – Local, `OllamaClient`),
  `anthropic` (đám mây – Cloud, `AnthropicClient`, từ chối vì an toàn → ném lỗi). Mọi lựa chọn tự quay về `MockBrain` khi mô hình
  không khả dụng hoặc đầu ra sai định dạng; `MockBrain` (`providers/mock.ts`) sinh toàn bộ văn bản tiếng Việt theo mẫu
  ("Kế hoạch: …", "Phân tích thị trường và xác định khách hàng mục tiêu"…), định tuyến phòng ban theo từ khóa tiếng Việt lẫn
  tiếng Anh (`quảng cáo`, `ads`, `lead`…) – đường dự phòng vẫn đúng chuẩn ngôn ngữ.
- Nội dung Agent sinh ra đi vào store (`tasks`, `messages`, `approvals`, `activities`) và được giao diện hiển thị **nguyên văn**;
  chỉ phần "khung" (mẫu câu `activity:templates.*`, nhãn trạng thái, tiêu đề mục) mới qua i18n.

### 5.3 Mẫu đạt / không đạt

| | Ví dụ |
|---|---|
| ✔ | "Tiến độ kế hoạch Marketing 30 ngày: 15% (đúng kế hoạch). Đề xuất phê duyệt ngân sách quảng cáo giai đoạn 1 (10 triệu ₫)." |
| ✔ | "Đã thiết lập đo lường KPI (chỉ số đánh giá hiệu suất) cho chiến dịch; CPL (chi phí trên mỗi khách hàng tiềm năng) mục tiêu 45.000 ₫." |
| ✘ | "Plan created. 8 tasks assigned. Waiting for approval." (toàn tiếng Anh) |
| ✘ | "Đã giao việc cho phòng `tiếp_thị`" (dịch định danh `marketing`) |
| ✘ | "ROI tháng này 3,8x" – không giải thích ROI lần đầu xuất hiện trong báo cáo |

---

## 6. Tiêu chí nghiệm thu UI/UX (Acceptance Criteria)

Mỗi tính năng/PR phải tự kiểm theo danh sách dưới đây; cột "Kiểm chứng" ghi cách xác minh khách quan.

### 6.1 Danh sách kiểm tra

| # | Tiêu chí | Kiểm chứng |
|---|---|---|
| A1 | Không có nhãn nào **chỉ** là thuật ngữ tiếng Anh chuyên ngành; mọi thuật ngữ có nghĩa tiếng Việt ở cùng vùng nhìn hoặc tooltip song ngữ | `pnpm lint:i18n` (`[vi-only-term]`, `[hardcoded-*]`); e2e duyệt `[data-term]` phải có cả `[data-term-primary]` và `[data-term-secondary]`; soi ảnh chụp |
| A2 | Mọi nút hành động chính có nghĩa tiếng Việt rõ ràng: *Duyệt*, *Từ chối*, *Giao việc*, *Tạm dừng*, *Tiếp tục*, *Tạo công việc*, *Xem kế hoạch chi tiết*, *Phê duyệt & triển khai*, *Gửi*, *Làm mới* (nhóm `action.*`) | Rà soát ảnh chụp; e2e đọc `innerText` các `button` – không chấp nhận `Approve`, `Submit`, `OK` đứng một mình |
| A3 | Không tràn chữ khi song ngữ: dòng dài bị `truncate` / `line-clamp`; `term-stack` nằm trong vùng `min-w-0`; không có cuộn ngang ở `body` | Script chụp màn hình in `overflow = 0` ở 1440 × 900 và 390 × 844; e2e kiểm `document.documentElement.scrollWidth <= innerWidth` |
| A4 | Đọc được trên màn hình nhỏ 390 px: chữ phụ ≥ 10 px (0.72em của 14 px ≈ 10 px; nhãn 3D tối thiểu `text-[9px]` chỉ cho số đếm), tiêu đề trang tách 2 dòng, menu trái thành ngăn kéo, bảng cuộn ngang **trong thẻ** (không phải cả trang) | Ảnh chụp 390 × 844 từng trang; e2e viewport 390 |
| A5 | Thuật ngữ **thống nhất** giữa Dashboard ⇄ Văn phòng 3D ⇄ Desktop ⇄ Nhật ký ⇄ Báo cáo Agent (cùng `GLOSSARY`); không có hai cách dịch cho một từ | `glossary.test.ts` ("một EN → một VI"); grep mã nguồn không được có chuỗi tiếng Việt của thuật ngữ gõ tay |
| A6 | Thông báo lỗi có tiêu đề + giải thích tiếng Việt theo mã lỗi; chi tiết kỹ thuật ẩn trong `<details>`; có nút *Thử lại* khi phù hợp | Dùng `<ErrorBanner error={err} onRetry/>`; e2e giả lập 404 / offline và kiểm chữ của `errors:codes.not_found.title`, `errors:codes.network.title` |
| A7 | Từ điển dùng chung Web/Desktop: menu Electron hiển thị cùng nhãn với menu trái Web; đổi ngôn ngữ ở một nơi đồng bộ nơi kia | Kiểm thử thủ công Desktop (`pnpm dev:desktop`); so khớp `termLabel()` với `nav:items.*` |
| A8 | Trạng thái rỗng / đang tải / mất kết nối đều có câu tiếng Việt (`EmptyState`, `PageSkeleton` + `common:labels.loading`, `ConnectionBanner`) | Ảnh chụp sau `POST /api/admin/reset`; tắt backend để xem banner |
| A9 | Ngày / giờ / tiền / số theo định dạng vi-VN (`21/01/2025`, `10:24`, `1.000.000 ₫`, `75%`) | Dùng `lib/format.ts`; e2e regex `\d{2}/\d{2}/\d{4}` |
| A10 | `<html lang>` đúng (`vi` / `en`); `aria-label` tiếng Việt; đọc màn hình thấy tooltip song ngữ qua `title`; ngăn chi tiết có `role="dialog"` + `aria-label` song ngữ | Kiểm thử trợ năng (axe) + xem DOM |
| A11 | Không console error trên mọi trang ở cả hai kích thước | Script chụp màn hình in `console errors = 0` |
| A12 | Mọi con số (tổng nhân sự, việc đang chạy, chờ duyệt) khớp nhau giữa các trang vì cùng selector trong `store/selectors.ts` | So sánh Topbar ⇄ Tổng quan ⇄ Văn phòng 3D ⇄ Dashboard trên cùng ảnh chụp |
| A13 | Nhãn trong cảnh 3D là DOM (không nướng vào texture), song ngữ, và có tooltip `label.inline`; chế độ mini/compact vẫn giữ tooltip | Kiểm `LabelLayer` qua DOM; ảnh chụp `/office` và ô thu nhỏ ở `/` và `/ceo` |

### 6.2 Quy trình kiểm chứng tối thiểu trước khi mở PR

1. `pnpm --filter @ads-nolimit/web typecheck` – 0 lỗi trong tệp của bạn.
2. `pnpm lint:i18n` – `✔`, 0 lỗi; cảnh báo liên quan đã xử lý.
3. `pnpm --filter @ads-nolimit/i18n test` (nếu chạm glossary/locale).
4. Chụp từng trang ở 1440 × 900 và 390 × 844, đính kèm vào PR; tự đánh giá A1–A13.
5. `pnpm e2e` khi thay đổi lớp vỏ (shell), điều hướng hoặc thành phần dùng chung.

---

## 7. Bảng quyết định các trường hợp đặc biệt

| Trường hợp | Quy tắc | Ví dụ đúng | Ví dụ sai | Nơi triển khai |
|---|---|---|---|---|
| **Tên thương hiệu / sản phẩm** | Giữ nguyên, không dịch, không phiên âm; có thể thêm mô tả tiếng Việt phía sau | `Meta Ads – Quảng cáo Facebook`, `Zalo OA`, `Ollama`, `Anthropic Claude`, `Google Drive – Lưu trữ & chia sẻ` | `Quảng cáo Meta`, `Mạng xã hội Zalo OA` (thay thế tên) | `BRAND_ALLOW` trong `scripts/i18n-lint.ts`; `connector.name` là dữ liệu backend |
| **Tên công ty / sản phẩm nội bộ** | `ADS-NOLIMIT`, `AI OFFICE` giữ nguyên; phụ đề tiếng Việt "Trung tâm điều hành công ty AI" | `ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI` | `Văn phòng AI ADS-NOLIMIT` | `common:app.{name,subtitle,tagline,shortName}` |
| **Viết tắt KPI / ROI / CRM / CPL / CR / API / MVP** | Giữ viết tắt là nhãn chính khi không gian hẹp; luôn có nghĩa đầy đủ ở dòng phụ / tooltip; lần đầu trong văn xuôi ghi `KPI (chỉ số đánh giá hiệu suất)` | `KPI – Chỉ số đánh giá hiệu suất`, `ROI (Return on Investment) – Hiệu suất đầu tư`, `Sales & CRM – Phòng Kinh doanh & CRM (Quản lý khách hàng)` | `KPI` trơ trọi không tooltip; `Chỉ số hiệu suất chính` (bản dịch khác chuẩn) | `module.kpi`, `metric.roi`, `metric.cost_per_lead`, `metric.conversion_rate`, `connector_category.crm`, `tech.api`, `tech.mvp` |
| **Đơn vị tiền tệ** | Việt Nam Đồng, ký hiệu `₫` đặt **sau** số, cách một khoảng trắng; phân cách hàng nghìn bằng dấu chấm; không thập phân | `10.000.000 ₫`, `10 triệu ₫`, `45.000 ₫` | `₫10,000,000`, `10,000,000 VND`, `10.000.000đ` | `formatVnd()` (`Intl` `currency: 'VND'`, `maximumFractionDigits: 0`), `common:units.vnd`, `common:units.millionVnd` |
| **Số, phần trăm, hệ số** | `Intl.NumberFormat('vi-VN')`: `1.234,5`; phần trăm `75%` (không khoảng trắng); hệ số `3,8x`; dạng gọn `1,2 N` | `+32%`, `3,8x`, `120 N` | `1,234.5`, `75 %` | `formatNumber`, `formatPercent`, `formatSignedPercent`, `formatCompact`, `common:units.percent/times` |
| **Ngày & giờ** | `dd/MM/yyyy`, giờ 24h `HH:mm`; ngày dài có thứ: `Thứ Ba, 21/01/2025`; thời gian tương đối: "Vừa xong", "2 phút trước", "3 giờ trước", "2 ngày trước" | `21/01/2025 · 10:24` | `Jan 21, 2025`, `2025-01-21` trên giao diện (ISO chỉ dùng trong dữ liệu) | `formatDate`, `formatDateShort`, `formatTime`, `formatLongDate`, `formatRelative(iso, t)` + `common:time.*` |
| **Số nhiều** | Tiếng Việt không biến đổi từ; dùng `{{count}}` + danh từ; vẫn khai báo `_one/_other` để khớp khóa với en-US | `3 công việc`, `1 nhân sự AI` | `3 công việcs`, `3 các công việc` | `common:units.tasks_one/_other`, `agents_*`, `requests_*`, `activity:filterBar.result_*` |
| **Trạng thái / enum** | Giá trị enum giữ nguyên trong dữ liệu & URL; hiển thị qua `termIdFor*` → badge có màu token + tooltip | chip `Đang thực hiện` (title `In Progress – Đang thực hiện`) | hiển thị `in_progress`; dịch enum trong JSON | `components/domain/StatusBadges.tsx`, `lib/colors.ts` |
| **Đường dẫn route / IPC / biến môi trường** | Tiếng Anh kỹ thuật, không dịch | `/approvals`, `desktop:set-locale`, `AI_PROVIDER=ollama` | `/phe-duyet` | `app/routes.ts`, `desktop/src/main.ts` |
| **Chữ "Owner"** | Dịch là "Chủ doanh nghiệp"; dạng phụ "Owner"; lời chào dùng tên riêng nếu có (`company.ownerName`) | `Chủ doanh nghiệp` / `Owner`; `Chào bạn, Minh!` | `Chủ sở hữu`, `Người dùng` | `common:owner.*`, `common:greeting`, `module.owner` |
| **Dấu câu & khoảng trắng** | `…` (U+2026) cho đang xử lý; en dash ` – ` cho song ngữ; `·` ngăn các thông tin ngắn; `→` cho luồng quy trình | `Đang tải dữ liệu…`, `Tiếp nhận → Lập kế hoạch`, `21/01/2025 · 10:24` | `Đang tải...`, `Tiếp nhận -> Lập kế hoạch` | `TERM_SEPARATOR`, `nav:items.workflow.description` |
| **Viết hoa** | Tiếng Việt chỉ viết hoa chữ đầu câu / nhãn và danh từ riêng; tên phòng ban viết hoa "Phòng …"; không viết hoa từng từ kiểu tiếng Anh; nhãn nhóm menu viết hoa toàn bộ bằng CSS (`uppercase`), không viết hoa trong JSON | `Trung tâm phê duyệt`, `Phòng Dữ liệu & Phân tích` | `Trung Tâm Phê Duyệt` | glossary `vi`; `Sidebar` (`uppercase tracking-[0.14em]`) |
| **Dữ liệu do Agent / Owner tạo** | Hiển thị nguyên văn, không qua `t()`, không sửa chính tả tự động; cắt dòng bằng `truncate` / `line-clamp` | tiêu đề `Kế hoạch: Xây dựng kế hoạch Marketing 30 ngày` | nhét tiêu đề mẫu vào `tasks.json` | Store (`officeStore.ts`) là nguồn duy nhất |
| **Chữ trong cảnh 3D** | Không vẽ chữ vào texture / mesh; mọi nhãn là DOM (`LabelLayer`) để dịch được và chọn được bằng e2e; `aria-label` của `<Canvas>` tiếng Việt có số liệu | bảng tên phòng DOM song ngữ; `office3d:scene.ariaLabel` | chữ tiếng Anh nướng vào texture | `features/office3d/LabelLayer.tsx`, `OfficeScene.tsx` |
| **Phím tắt** | Hiển thị tổ hợp phím theo quy ước hệ điều hành, không dịch tên phím | `Ctrl K` | `Điều khiển K` | `common:labels.shortcut` (khóa đuôi `shortcut` được lint bỏ qua) |

---

## 8. Phụ lục – Thuật ngữ chính

Trích 20 thuật ngữ được dùng nhiều nhất (bảng đầy đủ – 15 nhóm, tổng số mục in ở đầu tệp: xem
[`docs/GLOSSARY.md`](./GLOSSARY.md), sinh bằng `pnpm glossary:docs`).

| Id | Thuật ngữ tiếng Anh | Nghĩa tiếng Việt chuẩn | Rút gọn |
|---|---|---|---|
| `module.dashboard` | Dashboard | Bảng điều khiển | |
| `module.virtual_office_3d` | Virtual Office 3D | Văn phòng ảo 3D | Văn phòng 3D |
| `module.ceo_command_center` | AI CEO Command Center | Trung tâm điều hành AI CEO | |
| `module.task_management` | Task Management | Quản lý công việc | |
| `module.workflow` | Workflow | Quy trình làm việc | |
| `module.approval_center` | Approval Center | Trung tâm phê duyệt | |
| `module.agent_registry` | Agent Registry | Danh sách và cấu hình nhân sự AI | Danh sách nhân sự AI |
| `module.skill_connector` | Skill & Connector | Kỹ năng và công cụ kết nối | Kỹ năng & Kết nối |
| `module.activity_log` | Activity Log | Nhật ký hoạt động | |
| `module.kpi` | KPI | Chỉ số đánh giá hiệu suất | |
| `module.owner` | Owner | Chủ doanh nghiệp | |
| `role.ai_ceo` | AI CEO | Giám đốc điều hành AI | |
| `role.ai_coo` | AI COO | Giám đốc vận hành AI | |
| `role.ai_project_manager` | AI Project Manager | Quản lý dự án AI | |
| `role.ai_specialist` | AI Specialist | Chuyên viên thực thi AI | |
| `role.ai_qa_reviewer` | AI QA Reviewer | Nhân viên kiểm định chất lượng AI | Kiểm định chất lượng AI |
| `task_status.in_progress` | In Progress | Đang thực hiện | |
| `task_status.needs_approval` | Needs Approval | Cần phê duyệt | |
| `stage.receive` | Receive | Tiếp nhận yêu cầu | Tiếp nhận |
| `tech.hybrid_local_cloud` | Hybrid Local + Cloud | Kết hợp cục bộ + đám mây | |

Chuỗi quy trình chuẩn (`stage.*`, `WORKFLOW_STAGES`): **Tiếp nhận → Lập kế hoạch → Phân công → Thực thi → Kiểm định → Báo cáo**
(Receive → Plan → Assign → Execute → Review → Report).

Mười một phòng / khu (`department.*`, `DEPARTMENT_IDS`): Ban điều hành (Executive) · Phòng Chiến lược & Nghiên cứu (Strategy &
Research) · Phòng Marketing (Tiếp thị) · Phòng Sáng tạo & Media (Creative & Media) · Phòng Truyền thông & Cộng đồng (Social &
Community) · Phòng Dữ liệu & Phân tích (Data & Analytics) · Phòng Kinh doanh & CRM (Sales & CRM) · Phòng Kỹ thuật & Tự động hóa
(Tech & Automation) · Phòng họp (Meeting Room) · Sảnh chính (Reception) · Khu giải trí & Pantry (Pantry & Lounge).

---

## 9. Lịch sử thay đổi

| Phiên bản | Nội dung |
|---|---|
| 1.1 | Rà soát theo mã nguồn thực tế: phân biệt hai thứ tự inline `EN – VI` / `VI – EN` (2.3); ghi rõ ngoại lệ dòng chính tiếng Anh của `AgentName` (3); bổ sung `normalizeLocale`, `useTerms`, danh sách mã lỗi, giới hạn của lint (4.3, 4.10); menu Desktop và route tương ứng (4.5); tiêu chí A13 cho nhãn 3D; hàng "Phím tắt" trong bảng quyết định; số khóa lint ghi dạng tham số thay vì con số cố định. |
| 1.0 | Phiên bản đầu. |

---

*Tài liệu này là nguồn chuẩn (source of truth – nguồn dữ liệu duy nhất) về ngôn ngữ giao diện. Khi mã nguồn và tài liệu lệch
nhau, hãy sửa cả hai trong cùng một PR và chạy `pnpm check`.*

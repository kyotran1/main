# Chuẩn ngôn ngữ giao diện tiếng Việt – Vietnamese UI Language Standard

> **Tài liệu bắt buộc** của dự án ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI.
> Mọi chức năng hiện tại và tương lai (Web, Desktop, Văn phòng ảo 3D, báo cáo của AI Agent) đều phải
> tuân thủ. Việc tuân thủ được kiểm tra tự động bằng `pnpm lint:i18n`, bộ kiểm thử `packages/i18n`
> và kiểm thử đầu cuối (e2e); vi phạm làm hỏng lệnh `pnpm check`.
>
> Phiên bản: 1.0 · Phạm vi: toàn bộ monorepo (`apps/web`, `apps/desktop`, `apps/api`, `packages/i18n`).
> Tài liệu liên quan: [`UI_DESIGN_SYSTEM.md`](./UI_DESIGN_SYSTEM.md) (hệ thống thiết kế) ·
> [`GLOSSARY.md`](./GLOSSARY.md) (bảng thuật ngữ – sinh tự động, không sửa tay).

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

---

## 1. Phạm vi và nguyên tắc

### 1.1 Phạm vi áp dụng

Tiếng Việt (mã locale `vi-VN`) là **ngôn ngữ mặc định và bắt buộc** của toàn bộ sản phẩm. Tiếng Anh
(`en-US`) là ngôn ngữ thứ hai, người dùng chỉ bật khi chủ động chọn trong *Cài đặt hệ thống – Settings*
(nhãn trong giao diện: "English (bản xem trước)").

| Khu vực | Ví dụ cụ thể trong mã nguồn | Bắt buộc vi-VN |
|---|---|---|
| Ứng dụng Web (`apps/web`) | Menu trái, thanh trên, mọi trang, ngăn chi tiết (drawer), hộp thoại, thông báo | ✔ |
| Ứng dụng máy tính – Desktop App (`apps/desktop`) | Menu Electron, hộp thoại "Giới thiệu", lỗi khởi động | ✔ (dùng chung từ điển với Web) |
| Văn phòng ảo 3D – Virtual Office 3D | Bảng tên phòng, nhãn nhân sự, bong bóng chi tiết, thanh công cụ, chú giải, bảng phòng ban | ✔ |
| Bảng điều khiển – Dashboard & biểu đồ | Tên chỉ số, trục, chú giải (legend), tooltip, trạng thái rỗng | ✔ |
| Tên phòng ban – Department | 11 phòng/khu trong bố cục 3D (`department.*`) | ✔ |
| Chức vụ & hồ sơ nhân sự AI – Agent Registry | 5 chức vụ (`role.*`), trạng thái (`agent_status.*`), thẻ hồ sơ, biểu đồ hiệu suất | ✔ |
| Quản lý công việc – Task Management | Trạng thái (`task_status.*`), ưu tiên (`priority.*`), cột bảng, bộ lọc, biểu mẫu tạo việc | ✔ |
| Quy trình – Workflow | 6 giai đoạn `receive → plan → assign → execute → review → report` (`stage.*`), quy tắc quản trị | ✔ |
| Trung tâm phê duyệt – Approval Center | Loại/trạng thái phê duyệt (`approval_type.*`, `approval_status.*`), nút Duyệt/Từ chối, ghi chú | ✔ |
| Cài đặt hệ thống – Settings | Ngôn ngữ, chế độ vận hành (`execution_mode.*`), tên chủ doanh nghiệp/công ty | ✔ |
| Thông báo / cảnh báo / lỗi | `ErrorBanner`, `ConnectionBanner`, dải trạng thái realtime, `errors:codes.*` | ✔ |
| Báo cáo của AI CEO và tin nhắn Agent | Nội dung do mô hình sinh ra (xem mục 5) | ✔ (ở tầng system prompt) |
| Hướng dẫn người dùng, tài liệu trong `docs/` | Tệp này, `UI_DESIGN_SYSTEM.md`, `GLOSSARY.md`, chú thích mã nguồn | ✔ |

### 1.2 Năm nguyên tắc nền tảng

1. **Tiếng Việt là nhãn chính.** Người dùng đọc tiếng Việt trước; thuật ngữ tiếng Anh chuyên ngành chỉ
   đóng vai trò đối chiếu (dòng phụ, trong ngoặc, tooltip). Không bao giờ có nhãn *chỉ* tiếng Anh chuyên ngành.
2. **Một thuật ngữ – một bản dịch.** Mỗi thuật ngữ tiếng Anh có đúng **một** nghĩa tiếng Việt chuẩn trên toàn
   hệ thống, khai báo tại `packages/i18n/src/glossary.ts`. Dashboard, Văn phòng 3D, Desktop, báo cáo Agent
   đều tra cùng một bảng. (Được kiểm thử trong `glossary.test.ts`: "mỗi thuật ngữ tiếng Anh chỉ có một bản
   dịch tiếng Việt trong cùng nhóm".)
3. **Không hard-code chữ hiển thị.** Mọi chuỗi người dùng nhìn thấy – kể cả `title`, `placeholder`,
   `aria-label`, `alt` – phải đi qua `t('ns:key')`, `<Term id="…"/>` hoặc `bilingual(id)`. Lint chặn vi phạm.
4. **Tách dữ liệu khỏi bản dịch.** Tiêu đề công việc, tin nhắn, báo cáo, tên dự án do Agent/Owner tạo là
   **dữ liệu** từ backend – hiển thị nguyên văn, không nằm trong tệp locale.
5. **Không dịch định danh kỹ thuật.** `id`, enum (`in_progress`, `ai_ceo`), đường dẫn route (`/approvals`),
   khóa JSON, tên API, biến môi trường, tên thương hiệu – giữ nguyên.

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

### 2.3 Ba dạng hiển thị và khi nào dùng

Mọi dạng đều được `bilingual()`/`<Term/>` sinh sẵn; component không tự ghép chuỗi.

| Dạng | Ví dụ (vi-VN) | Khi dùng | Cách gọi |
|---|---|---|---|
| **Inline** – một dòng `EN – VI` | `Dashboard – Bảng điều khiển` | Tiêu đề trang ở màn hình rộng, tùy chọn trong `<select>`, menu Desktop, tooltip, văn bản mô tả | `<Term id="module.dashboard" format="inline"/>` · `bilingual(id).inline` · `t('glossary:module.dashboard.inline')` |
| **Stacked** – xếp chồng, tiếng Việt đậm trên, tiếng Anh nhỏ mờ dưới | **Bảng điều khiển**<br><small>Dashboard</small> | Mặc định cho menu trái, thẻ thống kê (`StatCard`), đầu thẻ (`CardHeader`), tiêu đề mục trong ngăn chi tiết, ô "Chức năng chính" | `<Term id="…"/>` (mặc định `format="stacked"`) · class `term-stack / term-primary / term-secondary` |
| **Tooltip** – chỉ hiện nhãn chính (hoặc dạng rút gọn), `title` luôn chứa `EN – VI` | Chip `Đang thực hiện` (hover: `In Progress – Đang thực hiện`) | Huy hiệu (Badge), chip, nhãn 3D, tab, không gian hẹp < 120 px | `<Term format="primary"/>` hoặc `format="short"` · `TaskStatusBadge`, `StageBadge`, `DepartmentName format="short"` |

Quy tắc chọn dạng:

1. Màn hình rộng (≥ 768 px): tiêu đề trang dùng **inline** (`PageHeader` tự tách thành 2 dòng ở màn hình hẹp).
2. Danh sách/menu/thẻ: **stacked**; dòng phụ dùng `term-secondary` (0.72em, `text-muted`), có `truncate`.
3. Không đủ chỗ cho hai dòng: **tooltip** – nhãn chính tiếng Việt (hoặc `short`) + `title="EN – VI"`.
   Không bao giờ hiển thị riêng `secondary` (chỉ tiếng Anh) mà thiếu tiếng Việt ở cùng vùng nhìn.
4. Ở locale `en-US`, `primary` là thuật ngữ tiếng Anh, `secondary` là nghĩa tiếng Việt; `inline` chỉ còn `EN`.

### 2.4 Dạng rút gọn (`short`)

Một số thuật ngữ có `viShort` cho không gian hẹp (chip, tab, bảng tên phòng 3D):
`Virtual Office 3D → "Văn phòng 3D"`, `Agent Registry → "Danh sách nhân sự AI"`, `Strategy & Research → "Chiến lược"`,
`AI QA Reviewer → "Kiểm định chất lượng AI"`. Khi không có `viShort`, `short` = `vi`. Nhãn rút gọn **luôn** kèm tooltip đầy đủ.
Trường hợp `short` trùng với tiếng Anh (vd. phòng *Marketing*) thì lớp nhãn 3D dùng nhãn đầy đủ "Phòng Marketing (Tiếp thị)"
để không lặp "Marketing / Marketing" (xem `LabelLayer.tsx`).

---

## 3. Tên chức vụ nhân sự AI song ngữ

Năm chức vụ, định danh kỹ thuật là giá trị enum `AgentRole` trong `@ads-nolimit/shared`:

| Enum (`agent.role`) | Thuật ngữ tiếng Anh | Nghĩa tiếng Việt chuẩn | Dạng rút gọn | Màu nhận diện (token) |
|---|---|---|---|---|
| `ai_ceo` | AI CEO | Giám đốc điều hành AI | – | `--color-brand-gold` |
| `ai_coo` | AI COO | Giám đốc vận hành AI | – | `--color-brand-violet` |
| `ai_project_manager` | AI Project Manager | Quản lý dự án AI | – | `--color-brand-blue` |
| `ai_specialist` | AI Specialist | Chuyên viên thực thi AI | – | `--color-brand-cyan` |
| `ai_qa_reviewer` | AI QA Reviewer | Nhân viên kiểm định chất lượng AI | Kiểm định chất lượng AI | `--color-brand-magenta` |

Cách hiển thị bắt buộc – **không ghép chuỗi tay**:

```tsx
import { AgentName, useAgentDisplayName } from '@/components/domain';
import { bilingual, termIdForRole, roleTitle } from '@ads-nolimit/i18n';

<AgentName agent={agent} />                 // stacked: "AI CEO" / "Giám đốc điều hành AI" (có displayName thì dòng phụ là "AI CEO – Giám đốc điều hành AI")
<AgentName agent={agent} format="inline" /> // "AI CEO – Giám đốc điều hành AI"  (hoặc "Minh · AI CEO – Giám đốc điều hành AI")
roleTitle('ai_ceo', 'vi-VN')                // "AI CEO – Giám đốc điều hành AI"
bilingual(termIdForRole(agent.role), locale).meaning // "Giám đốc điều hành AI"
```

Quy ước:

- Trong nhật ký hoạt động (`activity:templates.*`), biến `{{agent}}` được điền bằng `useAgentDisplayName()`:
  `"Minh (AI CEO)"` nếu có tên gọi, ngược lại `"AI CEO – Giám đốc điều hành AI"`.
- Ảnh đại diện (`AgentAvatar`) lấy chữ cái viết tắt từ chức vụ (`initialsFromRole`), vòng màu theo chức vụ,
  chấm trạng thái theo `agent_status.*`.
- Chữ "Agent" đứng một mình dịch là **"nhân sự AI"** (`tech.ai_agent`: "Nhân sự AI (tác tử AI)"); không dùng "đặc vụ", "tác nhân".
- "Owner" dịch là **"Chủ doanh nghiệp"** (`module.owner`); trong văn bản có thể viết "Chủ doanh nghiệp (Owner)".

---

## 4. Kiến trúc đa ngôn ngữ (i18n)

### 4.1 Công nghệ

- **i18next** (`^25`) là lõi; **react-i18next** (`^15`) cho React; **i18next-browser-languagedetector** chỉ dùng
  để đọc/ghi `localStorage` (không suy ra ngôn ngữ từ trình duyệt).
- Gói dùng chung: **`@ads-nolimit/i18n`** (`packages/i18n`) – được cả Web (`apps/web`) và Desktop (`apps/desktop`)
  nhập; backend không phụ thuộc i18next nhưng có thể gọi `bilingualFromEntry()` thuần TypeScript.

### 4.2 Cấu trúc `packages/i18n`

```
packages/i18n/
├── src/
│   ├── glossary.ts     # GLOSSARY: bảng thuật ngữ dùng chung (151 mục, 15 nhóm) + buildGlossaryResources()
│   ├── resources.ts    # NAMESPACES, SUPPORTED_LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE, resources (nhập JSON tĩnh)
│   ├── index.ts        # initI18n, bilingual/bilingualSafe, termIdFor*, roleTitle, describeError, LOCALE_STORAGE_KEY, TERM_SEPARATOR
│   ├── react.tsx       # <Term/>, <BilingualText/>, useTerm, useTerms, useLocale
│   └── glossary.test.ts# vitest: id duy nhất, 1 EN → 1 VI, VI có dấu, parity khóa, khởi tạo vi-VN
└── locales/
    ├── vi-VN/<ns>.json # 19 tệp namespace (common, nav, activity, errors, overview, dashboard, office3d, ceo, agents,
    │                   #   tasks, workflow, approvals, orgchart, projects, reports, settings, connectors, knowledge, desktop)
    └── en-US/<ns>.json # CÙNG tập khóa với vi-VN
```

Namespace thứ 20, **`glossary`**, không có tệp JSON: được sinh từ `GLOSSARY` lúc chạy bằng
`buildGlossaryResources(locale)`. Mỗi id `nhóm.khóa` cho ra 7 khóa con:

| Khóa | vi-VN | en-US |
|---|---|---|
| `label` | nghĩa tiếng Việt | thuật ngữ tiếng Anh |
| `short` | `viShort` hoặc `vi` | thuật ngữ tiếng Anh |
| `secondary` | thuật ngữ tiếng Anh | nghĩa tiếng Việt |
| `inline` | `EN – VI` | `EN` |
| `term` | EN (không bao giờ dịch) | EN |
| `meaning` | VI | VI |
| `note` | `noteVi` (giải thích thêm) | `noteVi` |

Ví dụ: `t('glossary:module.dashboard.inline')` → `"Dashboard – Bảng điều khiển"`.

### 4.3 Hằng số và API chính

```ts
import {
  initI18n, DEFAULT_LOCALE /* 'vi-VN' */, FALLBACK_LOCALE /* 'vi-VN' */, SUPPORTED_LOCALES /* ['vi-VN','en-US'] */,
  LOCALE_STORAGE_KEY /* 'ads-nolimit.locale' */, TERM_SEPARATOR /* ' – ' */,
  bilingual, bilingualSafe, bilingualFromEntry, roleTitle, describeError, normalizeLocale, isLocale,
  termIdForRole, termIdForDepartment, termIdForTaskStatus, termIdForAgentStatus, termIdForPriority,
  termIdForStage, termIdForApprovalType, termIdForApprovalStatus, termIdForProjectStatus, termIdForExecutionMode,
  GLOSSARY, getGlossaryEntry, listGlossary, englishTermSet,
} from '@ads-nolimit/i18n';
import { Term, BilingualText, useTerm, useTerms, useLocale } from '@ads-nolimit/i18n/react';
```

- `initI18n({ lng, instance, overrides })` – khởi tạo i18next với toàn bộ `resources`, `defaultNS: 'common'`,
  `load: 'currentOnly'`, `interpolation.escapeValue: false`, `returnNull/returnEmptyString: false`, `saveMissing: false`.
- `bilingual(id, locale)` → `BilingualLabel { primary, secondary, inline, short, note, term, meaning }`.
  **Ném lỗi** khi id không tồn tại (phát hiện sớm trong kiểm thử). `bilingualSafe` trả về id thô – chỉ dùng cho
  hiển thị không quan trọng.
- `termIdFor*(enum)` – ánh xạ enum miền → id glossary (`'ai_ceo' → 'role.ai_ceo'`, `'in_progress' → 'task_status.in_progress'`).
- `describeError(t, code)` – diễn giải mã lỗi API thành `{ title, explain }` tiếng Việt qua `errors:codes.<code>`;
  mã lạ rơi về `internal` và nối thêm `(code)`.
- `<Term id format as className primaryClassName secondaryClassName suffix/>` – 5 `format`: `inline | stacked | primary | short | secondary`;
  mọi dạng đều có `title="EN – VI"`; dạng `stacked` gắn `data-term`, `data-term-primary`, `data-term-secondary` để e2e kiểm tra.
- `<BilingualText primary secondary/>` – cặp nhãn tự do cho khóa i18n đã có sẵn `label/secondary`.
- `useLocale()` – trả `'vi-VN' | 'en-US'` đã chuẩn hóa từ `i18n.resolvedLanguage`.

### 4.4 Web: khởi tạo và lưu lựa chọn ngôn ngữ (`apps/web/src/i18n.ts`)

- `setupI18n()` gắn `LanguageDetector` với `detection.order = ['localStorage']`, `lookupLocalStorage = LOCALE_STORAGE_KEY`,
  `supportedLngs = SUPPORTED_LOCALES`, `fallbackLng = 'vi-VN'`, `nonExplicitSupportedLngs: false`.
  → Lần đầu mở ứng dụng **luôn** là tiếng Việt, bất kể ngôn ngữ trình duyệt.
- `changeLocale(locale)` đổi ngôn ngữ và ghi `localStorage['ads-nolimit.locale']` (bọc try/catch khi bị chặn).
- Thuộc tính `<html lang>` được đặt `vi` hoặc `en` để trình đọc màn hình phát âm đúng.

### 4.5 Desktop dùng chung từ điển (`apps/desktop/src/main.ts`)

- Tiến trình chính Electron gọi `initI18n({ lng: 'vi-VN' })` và dựng menu từ **cùng** namespace `desktop`, `common` và glossary:
  `termLabel('module.settings')` → `"Cài đặt hệ thống – Settings"` (vi) / `"Settings"` (en) qua `bilingual()`.
- IPC: `desktop:get-locale`, `desktop:set-locale` (renderer gọi), sự kiện `desktop:locale-changed` (main phát) –
  khi đổi ngôn ngữ trong Web, menu Desktop đổi theo và ngược lại. Tên kênh IPC là định danh kỹ thuật, không dịch.
- Hộp thoại lỗi khởi động dùng `desktop:errors.webMissing.{title,explain}` – có giải thích tiếng Việt và lệnh khắc phục.

### 4.6 Quy tắc viết khóa locale

1. Khóa theo cấu trúc `namespace:nhóm.khóa` (camelCase), vd `tasks:toolbar.createTask`, `office3d:toolbar.filter.label`.
2. Cần song ngữ ngoài glossary → cặp `label` + `secondary` (hoặc `xxx` + `xxxSecondary`), vd
   `common:status.systemRunning = "Đang hoạt động"`, `common:status.systemRunningSecondary = "Running / Active"`.
   Lint **bỏ qua** kiểm tra "chỉ tiếng Anh" với các khóa kết thúc bằng `secondary|term|short|inline|shortcut|en|id|key`.
3. Số nhiều: `key_one` / `key_other` với `{{count}}` – i18next chọn hậu tố theo `Intl.PluralRules`; tiếng Việt thực tế chỉ dùng
   dạng `other`, nhưng **vẫn khai báo cả `_one`** để hai tệp cùng tập khóa với en-US (vd `common:units.tasks_one/_other`).
4. Biến nội suy đặt tên có nghĩa: `{{agent}}`, `{{title}}`, `{{count}}`, `{{progress}}`, `{{time}}`.
5. Thông điệp lỗi: `errors:codes.<code>.{title, explain}` – `explain` mở đầu bằng thuật ngữ gốc rồi gạch sang giải thích:
   `"Agent Paused – Hãy cho nhân sự AI tiếp tục (Resume) trước khi giao việc."`
6. Giá trị vi-VN phải có dấu tiếng Việt; chỉ được không dấu khi là tên thương hiệu/viết tắt trong danh sách cho phép (mục 7).
7. Không nhét dữ liệu động (tên dự án mẫu, số liệu) vào tệp locale.

### 4.7 Cấm hard-code – mẫu đúng/sai

```tsx
// ✘ SAI – chữ cố định trong JSX và thuộc tính
<h2>Danh sách nhân sự AI</h2>
<input placeholder="Tìm kiếm" />
<button title="Approve">Duyệt</button>

// ✔ ĐÚNG
<h2><Term id="module.agent_registry" /></h2>
<input placeholder={t('common:labels.searchPlaceholder')} aria-label={t('common:labels.search')} />
<Button title={useTerm('action.approve').inline}>{t('glossary:action.approve.label')}</Button>
```

Ngoại lệ được lint chấp nhận trong JSX: tên thương hiệu (`ADS-NOLIMIT`, `Meta Ads`, `Google Ads`, `TikTok Ads`,
`Zalo`, `HubSpot`, `Canva`, `Ollama`, `Anthropic`, `Claude`…), số, ký hiệu (`%`, `–`, `·`, `→`), mã kỹ thuật viết hoa
(`MVP`, `API`, `KPI`), biểu thức mã. Tệp thật sự không có giao diện có thể đặt chú thích `i18n-lint-ignore-file` (hạn chế dùng,
phải ghi lý do).

### 4.8 Quy trình thêm thuật ngữ / khóa mới (checklist)

**Thêm thuật ngữ chuyên ngành (dùng ở ≥ 2 nơi hoặc là enum miền):**

- [ ] Kiểm tra `docs/GLOSSARY.md` xem đã có chưa (tránh hai bản dịch cho một thuật ngữ).
- [ ] Thêm vào `packages/i18n/src/glossary.ts` bằng `g(category, key, en, vi, { viShort?, noteVi? })`, đúng nhóm
      (`module | role | department | task_status | agent_status | priority | stage | approval_type | approval_status |
      project_status | metric | tech | execution_mode | action | connector_category`).
- [ ] `vi` có dấu tiếng Việt; nếu là viết tắt giữ nguyên (ROI, CRM) phải thêm vào `allowedAscii` trong `glossary.test.ts`.
- [ ] Nếu là enum mới trong `@ads-nolimit/shared` → thêm `termIdFor*` tương ứng (nếu nhóm mới) và màu trong `apps/web/src/lib/colors.ts`.
- [ ] Chạy `pnpm --filter @ads-nolimit/i18n test` và `pnpm glossary:docs` (cập nhật `docs/GLOSSARY.md`, commit kèm).

**Thêm khóa giao diện riêng của một màn hình:**

- [ ] Thêm vào **cả hai** tệp `locales/vi-VN/<ns>.json` và `locales/en-US/<ns>.json`, cùng đường dẫn khóa.
- [ ] Nếu nhãn chứa thuật ngữ tiếng Anh → dùng cặp `label/secondary`; nếu thuật ngữ đã có trong glossary → dùng `<Term/>` thay vì thêm khóa.
- [ ] Nếu cần namespace mới: tạo 2 tệp JSON, nhập trong `resources.ts`, thêm tên vào `NAMESPACES`.
- [ ] Chạy `pnpm lint:i18n` → phải `✔`, 0 lỗi; xử lý mọi cảnh báo `[vi-suspect]` liên quan.
- [ ] Chụp màn hình ở 1440 px và 390 px, kiểm tra không tràn chữ.

### 4.9 Lệnh kiểm tra

| Lệnh | Việc làm | Khi nào chạy |
|---|---|---|
| `pnpm lint:i18n` | Chạy `scripts/i18n-lint.ts` – 5 nhóm kiểm tra bên dưới; thoát mã 1 khi có lỗi | Trước mỗi commit; trong CI qua `pnpm check` |
| `pnpm glossary:docs` | Sinh lại `docs/GLOSSARY.md` từ `GLOSSARY` | Sau khi sửa `glossary.ts` |
| `pnpm --filter @ads-nolimit/i18n test` | vitest cho glossary + parity + khởi tạo | Sau khi sửa gói i18n |
| `pnpm e2e` | Kiểm thử đầu cuối trình duyệt (`apps/web/e2e`) – kiểm tra nhãn song ngữ, tràn chữ, console | Trước khi mở PR |

### 4.10 Ý nghĩa từng loại lỗi của `pnpm lint:i18n`

Kết quả đạt có dạng: `✔  Chuẩn ngôn ngữ giao diện đạt: 2356 khóa vi-VN, 151 thuật ngữ, 0 cảnh báo.`

| Mã | Mức | Ý nghĩa | Cách sửa |
|---|---|---|---|
| `[parity]` | Lỗi | Khóa có trong vi-VN nhưng thiếu trong en-US (hoặc ngược lại) ở cùng namespace | Thêm khóa còn thiếu vào tệp kia; không được xóa khóa đang dùng |
| `[vi-only-term]` | Lỗi | Giá trị vi-VN **chỉ** là một thuật ngữ tiếng Anh có trong glossary (vd `"Dashboard"`) mà không kèm nghĩa tiếng Việt | Dùng `<Term/>`/`glossary:` thay vì khóa riêng, hoặc đổi thành dạng `EN – VI`, hoặc đưa vào khóa `*Secondary` nếu đó là dòng phụ |
| `[vi-suspect]` | Cảnh báo | Giá trị vi-VN ≥ 3 từ nhưng không có dấu tiếng Việt (nghi là tiếng Anh chưa dịch) – trừ khi chứa tên thương hiệu/viết tắt được phép và ≤ 4 từ | Dịch sang tiếng Việt; nếu đúng là tên riêng, cân nhắc thêm vào `BRAND_ALLOW` |
| `[hardcoded-jsx]` | Lỗi | Văn bản cố định có chữ cái nằm giữa thẻ JSX trong `apps/web/src` hoặc `apps/desktop/src` | Chuyển sang `t()`/`<Term/>`; nếu là định danh kỹ thuật thì viết hoa toàn bộ hoặc đưa vào biến |
| `[hardcoded-attr]` | Lỗi | Thuộc tính `title`, `placeholder`, `aria-label`, `alt`, `label` là chuỗi cố định có ≥ 3 chữ cái | Dùng `t()` hoặc `bilingual(id).inline` |
| `[missing-key]` | Lỗi | Mã gọi `t('ns:key')` nhưng khóa không tồn tại trong vi-VN (gõ sai, khóa chết) | Thêm khóa hoặc sửa tên; khóa có hậu tố `_one/_other` và khóa cha có con đều được chấp nhận |

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
   khóa JSON (`estimateHours`), tên API, tên mô hình (`qwen2.5:14b`, `claude-opus-5-5`), biến môi trường (`AI_PROVIDER`).
5. Khi được yêu cầu JSON, Agent chỉ trả JSON hợp lệ – phần hiển thị bên trong JSON vẫn là tiếng Việt.

### 5.2 Dẫn chiếu triển khai

System prompt dùng chung cho mọi lời gọi mô hình – `apps/api/src/engine/providers/llm.ts`:

```ts
const SYSTEM_VI = `Bạn là nhân sự AI của công ty ADS-NOLIMIT (Truyền thông & Marketing). Luôn trả lời Owner bằng tiếng Việt.
Khi dùng thuật ngữ chuyên ngành tiếng Anh, hãy kèm nghĩa tiếng Việt trong ngoặc, ví dụ: KPI (chỉ số đánh giá hiệu suất).
Không dịch định danh kỹ thuật (departmentId, role, id, JSON keys). Khi được yêu cầu JSON, chỉ trả về JSON hợp lệ, không giải thích thêm.`;
```

- `LlmBrain.planRequest` yêu cầu JSON `{ title, summary, outline[], subtasks[], replyToOwner }`; `replyToOwner` tiếng Việt.
- `LlmBrain.replyToOwner` – "Hãy trả lời ngắn gọn (tối đa 120 từ) bằng tiếng Việt."
- `LlmBrain.reviewTask` – `{ passed, note }` với `note` bằng tiếng Việt.
- Nhà cung cấp (`AI_PROVIDER`): `mock` (mô phỏng, mặc định), `ollama` (cục bộ – Local), `anthropic` (đám mây – Cloud).
  Mọi lựa chọn tự quay về `MockBrain` khi mô hình không khả dụng hoặc đầu ra sai định dạng; `MockBrain`
  (`providers/mock.ts`) sinh toàn bộ văn bản tiếng Việt theo mẫu, nên đường dự phòng vẫn đúng chuẩn ngôn ngữ.
- Nội dung Agent sinh ra đi vào store (`tasks`, `messages`, `approvals`, `activities`) và được giao diện hiển thị **nguyên văn**;
  chỉ phần "khung" (mẫu câu `activity:templates.*`, nhãn trạng thái) mới qua i18n.

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
| A1 | Không có nhãn nào **chỉ** là thuật ngữ tiếng Anh chuyên ngành; mọi thuật ngữ có nghĩa tiếng Việt ở cùng vùng nhìn hoặc tooltip `EN – VI` | `pnpm lint:i18n` (`[vi-only-term]`, `[hardcoded-*]`); e2e duyệt `[data-term]` phải có cả `[data-term-primary]` và `[data-term-secondary]`; soi ảnh chụp |
| A2 | Mọi nút hành động chính có nghĩa tiếng Việt rõ ràng: *Duyệt*, *Từ chối*, *Giao việc*, *Tạm dừng*, *Tiếp tục*, *Tạo công việc*, *Xem kế hoạch chi tiết*, *Phê duyệt & triển khai*, *Gửi* (nhóm `action.*`) | Rà soát ảnh chụp; e2e đọc `innerText` các `button` – không chấp nhận `Approve`, `Submit`, `OK` đứng một mình |
| A3 | Không tràn chữ khi song ngữ: dòng dài bị `truncate`/`line-clamp`; `term-stack` có `min-w-0`; không có `overflow-x` ở `body` | Script chụp `shot.cjs` in `overflow` = 0 ở 1440×900 và 390×844; e2e kiểm `document.documentElement.scrollWidth <= innerWidth` |
| A4 | Đọc được trên màn hình nhỏ 390 px: chữ phụ ≥ 10 px (0.72em của 14 px ≈ 10 px), tiêu đề trang tách 2 dòng, menu thành ngăn kéo, bảng cuộn ngang trong thẻ (không phải cả trang) | Ảnh chụp 390×844 từng trang; e2e viewport 390 |
| A5 | Thuật ngữ **thống nhất** giữa Dashboard ⇄ Văn phòng 3D ⇄ Desktop ⇄ Nhật ký ⇄ Báo cáo Agent (cùng `GLOSSARY`); không có hai cách dịch cho một từ | `glossary.test.ts` ("một EN → một VI"); grep mã nguồn không được có chuỗi tiếng Việt của thuật ngữ gõ tay |
| A6 | Thông báo lỗi có tiêu đề + giải thích tiếng Việt theo mã lỗi; chi tiết kỹ thuật ẩn trong `<details>`; có nút *Thử lại* khi phù hợp | Dùng `<ErrorBanner error={err}/>`; e2e giả lập 404/offline và kiểm chữ "Không tìm thấy dữ liệu", "Mất kết nối mạng" |
| A7 | Từ điển dùng chung Web/Desktop: menu Electron hiển thị cùng nhãn với menu trái Web; đổi ngôn ngữ ở một nơi đồng bộ nơi kia | Kiểm thử thủ công Desktop (`pnpm dev:desktop`); so khớp `termLabel()` với `nav:items.*` |
| A8 | Trạng thái rỗng / đang tải / mất kết nối đều có câu tiếng Việt (`common:labels.empty`, `common:labels.loading`, `ConnectionBanner`) | Ảnh chụp sau `POST /api/admin/reset`; tắt backend để xem banner |
| A9 | Ngày/giờ/tiền/số theo định dạng vi-VN (`21/01/2025`, `10:24`, `1.000.000 ₫`, `75%`) | Dùng `lib/format.ts`; e2e regex `\d{2}/\d{2}/\d{4}` |
| A10 | `<html lang>` đúng (`vi`/`en`); `aria-label` tiếng Việt; đọc màn hình thấy tooltip song ngữ qua `title` | Kiểm thử trợ năng (axe) + xem DOM |
| A11 | Không console error trên mọi trang ở cả hai kích thước | `shot.cjs` in `console errors = 0` |
| A12 | Mọi con số (tổng nhân sự, việc đang chạy, chờ duyệt) khớp nhau giữa các trang vì cùng selector trong `store/selectors.ts` | So sánh Topbar ⇄ Tổng quan ⇄ Văn phòng 3D ⇄ Dashboard trên cùng ảnh chụp |

### 6.2 Quy trình kiểm chứng tối thiểu trước khi mở PR

1. `pnpm --filter @ads-nolimit/web typecheck` – 0 lỗi trong tệp của bạn.
2. `pnpm lint:i18n` – `✔`, 0 lỗi; cảnh báo liên quan đã xử lý.
3. `pnpm --filter @ads-nolimit/i18n test` (nếu chạm glossary/locale).
4. Chụp từng trang ở 1440×900 và 390×844, đính kèm vào PR; tự đánh giá A1–A12.
5. `pnpm e2e` khi thay đổi lớp vỏ (shell), điều hướng hoặc thành phần dùng chung.

---

## 7. Bảng quyết định các trường hợp đặc biệt

| Trường hợp | Quy tắc | Ví dụ đúng | Ví dụ sai | Nơi triển khai |
|---|---|---|---|---|
| **Tên thương hiệu / sản phẩm** | Giữ nguyên, không dịch, không phiên âm; có thể thêm mô tả tiếng Việt phía sau | `Meta Ads – Quảng cáo Facebook`, `Zalo OA`, `Ollama`, `Anthropic Claude`, `Google Drive – Lưu trữ & chia sẻ` | `Quảng cáo Meta`, `Mạng xã hội Zalo OA` (thay thế tên) | `BRAND_ALLOW` trong `scripts/i18n-lint.ts`; `connector.name` là dữ liệu backend |
| **Tên công ty / sản phẩm nội bộ** | `ADS-NOLIMIT`, `AI OFFICE` giữ nguyên; phụ đề tiếng Việt "Trung tâm điều hành công ty AI" | `ADS-NOLIMIT AI OFFICE – Trung tâm điều hành công ty AI` | `Văn phòng AI ADS-NOLIMIT` | `common:app.*` |
| **Viết tắt KPI / ROI / CRM / CPL / CR / API / MVP** | Giữ viết tắt là nhãn chính khi không gian hẹp; luôn có nghĩa đầy đủ ở dòng phụ/tooltip; lần đầu trong văn xuôi ghi `KPI (chỉ số đánh giá hiệu suất)` | `KPI – Chỉ số đánh giá hiệu suất`, `ROI (Return on Investment) – Hiệu suất đầu tư`, `Sales & CRM – Phòng Kinh doanh & CRM (Quản lý khách hàng)` | `KPI` trơ trọi không tooltip; `Chỉ số hiệu suất chính` (bản dịch khác chuẩn) | `module.kpi`, `metric.roi`, `metric.cost_per_lead`, `metric.conversion_rate`, `connector_category.crm`, `tech.api`, `tech.mvp` |
| **Đơn vị tiền tệ** | Việt Nam Đồng, ký hiệu `₫` đặt **sau** số, cách một khoảng trắng; phân cách hàng nghìn bằng dấu chấm; không thập phân | `10.000.000 ₫`, `10 triệu ₫`, `45.000 ₫` | `₫10,000,000`, `10,000,000 VND`, `10.000.000đ` | `formatVnd()` (Intl `currency: 'VND'`), `common:units.vnd`, `common:units.millionVnd` |
| **Số, phần trăm, hệ số** | `Intl.NumberFormat('vi-VN')`: `1.234,5`; phần trăm `75%` (không khoảng trắng); hệ số `3,8x`; dạng gọn `1,2 N` | `+32%`, `3,8x`, `120 N` | `1,234.5`, `75 %` | `formatNumber`, `formatPercent`, `formatSignedPercent`, `formatCompact`, `common:units.percent/times` |
| **Ngày & giờ** | `dd/MM/yyyy`, giờ 24h `HH:mm`; ngày dài có thứ: `Thứ Ba, 21/01/2025`; thời gian tương đối: "Vừa xong", "2 phút trước" | `21/01/2025 · 10:24` | `Jan 21, 2025`, `2025-01-21` trên giao diện (ISO chỉ dùng trong dữ liệu) | `formatDate`, `formatDateShort`, `formatTime`, `formatLongDate`, `formatRelative` + `common:time.*` |
| **Số nhiều** | Tiếng Việt không biến đổi từ; dùng `{{count}}` + danh từ; vẫn khai báo `_one/_other` để khớp khóa với en-US | `3 công việc`, `1 nhân sự AI` | `3 công việcs`, `3 các công việc` | `common:units.tasks_one/_other`, `agents_*`, `requests_*`, `activity:filterBar.result_*` |
| **Trạng thái / enum** | Giá trị enum giữ nguyên trong dữ liệu & URL; hiển thị qua `termIdFor*` → badge có màu token + tooltip | chip `Đang thực hiện` (title `In Progress – Đang thực hiện`) | hiển thị `in_progress`; dịch enum trong JSON | `StatusBadges.tsx`, `lib/colors.ts` |
| **Đường dẫn route / IPC / biến môi trường** | Tiếng Anh kỹ thuật, không dịch | `/approvals`, `desktop:set-locale`, `AI_PROVIDER=ollama` | `/phe-duyet` | `app/routes.ts`, `desktop/main.ts` |
| **Chữ "Owner"** | Dịch là "Chủ doanh nghiệp"; dạng phụ "Owner" | `Chủ doanh nghiệp` / `Owner` | `Chủ sở hữu`, `Người dùng` | `common:owner.*`, `module.owner` |
| **Dấu câu & khoảng trắng** | Dấu `…` (U+2026) cho đang xử lý; en dash ` – ` cho song ngữ; `·` ngăn các thông tin ngắn; `→` cho luồng quy trình | `Đang tải dữ liệu…`, `Tiếp nhận → Lập kế hoạch` | `Đang tải...` (3 dấu chấm), `Tiếp nhận -> Lập kế hoạch` | `TERM_SEPARATOR`, `nav:items.workflow.description` |
| **Viết hoa** | Tiếng Việt chỉ viết hoa chữ đầu câu/nhãn và danh từ riêng; tên phòng ban viết hoa "Phòng …"; không viết hoa từng từ kiểu tiếng Anh | `Trung tâm phê duyệt`, `Phòng Dữ liệu & Phân tích` | `Trung Tâm Phê Duyệt` | glossary `vi` |
| **Dữ liệu do Agent/Owner tạo** | Hiển thị nguyên văn, không qua `t()`, không sửa chính tả tự động; cắt dòng bằng `truncate`/`line-clamp` | tiêu đề `Kế hoạch: Xây dựng kế hoạch Marketing 30 ngày` | nhét tiêu đề mẫu vào `tasks.json` | Store (`officeStore.ts`) là nguồn duy nhất |
| **Chữ trong cảnh 3D** | Không vẽ chữ vào texture/mesh; mọi nhãn là DOM (`LabelLayer`) để dịch được và chọn được bằng e2e | bảng tên phòng DOM song ngữ | chữ tiếng Anh nướng vào texture | `features/office3d/LabelLayer.tsx` |

---

## 8. Phụ lục – Thuật ngữ chính

Trích 20 thuật ngữ được dùng nhiều nhất (bảng đầy đủ 151 mục, phân 15 nhóm: xem [`docs/GLOSSARY.md`](./GLOSSARY.md),
sinh bằng `pnpm glossary:docs`).

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

Chuỗi quy trình chuẩn (`stage.*`): **Tiếp nhận → Lập kế hoạch → Phân công → Thực thi → Kiểm định → Báo cáo**
(Receive → Plan → Assign → Execute → Review → Report).

---

*Tài liệu này là nguồn chuẩn (source of truth) về ngôn ngữ giao diện. Khi mã nguồn và tài liệu lệch nhau, hãy sửa cả hai trong
cùng một PR và chạy `pnpm check`.*

# Trung tâm điều hành Tổ KHCN – THCS Ngôi Sao Hoàng Mai

Web nội bộ giúp **Tổ phó chuyên môn** điều hành tổ Khoa học – Công nghệ (KHCN): theo dõi báo cáo tuần/tháng của giáo viên, chấm vở, Canvas, LEAD/dự giờ, sự kiện–cuộc thi, và **xuất báo cáo nhanh cho BGH**. Dữ liệu được tổng hợp bán tự động: **agent (OpenClaw/Hermes) cào số liệu từ các link báo cáo** rồi push lên, kết hợp với **nhập tay**.

> Tài liệu này viết để **người mới hoặc một AI khác đọc là hiểu ngay** dự án đang làm gì, dữ liệu ra sao, và agent cần push thế nào. Hợp đồng dữ liệu cho agent: xem `agent/AGENT_DATA_PUSH_GUIDE.md`.

---

## 1. Bối cảnh
- Người dùng: thầy Dương Đức Hiếu (GV Lí, tổ phó CM tổ KHCN THCS), năm học **2026–2027**.
- Quy mô: **19 giáo viên** (roster chuẩn r0–r18), ~47 lớp KHTN.
- Mục tiêu: một màn hình để **BGH/TTCM nhìn phát hiểu**, và **GV tra cứu việc của mình** thuận tiện.
- Nguyên tắc vận hành: **“Sổ tay để tra cứu — AI rà soát để xử lý — Web để hiển thị”**, và **“số thật > số khai”** (§6).

## 2. Công nghệ
- **React 18 + Vite + TailwindCSS** (SPA một trang, nhiều tab).
- State toàn cục qua React Context (`src/data/store.jsx`), tự lưu **localStorage** và **đồng bộ với backend**.
- Giao diện **Sáng/Tối** (mặc định Sáng) qua biến CSS (`src/index.css` + `tailwind.config.js`), nút 🌙/☀️ ở header.
- Backend: **hiện tại** Google Apps Script + Google Sheet (`backend/Code.gs`); **đang chuyển** sang **Supabase** (`supabase/`, auth + RLS + audit + realtime). Xem §8.

## 3. Chạy & Deploy
```bash
npm install
npm run dev        # chạy thử local (http://localhost:5173)
npm run build      # build production → dist/
```
**Deploy Vercel:** Import repo → Framework **Vite** → Build `npm run build`, Output `dist`. Biến môi trường (khi dùng Supabase): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Đăng nhập quản trị (bản Apps Script): mã mặc định `khcn-2627` (đổi ở tab Đồng bộ).

## 4. Cấu trúc thư mục
```
src/
  App.jsx                 # khung: header (theme, "Tôi là", lọc GV), nav 16 tab
  data/seed.js            # DỮ LIỆU CHUẨN: roster 19 GV, phân công 47 lớp, mẫu snaps, hằng số enum
  data/store.jsx          # state + localStorage + cloudPull/Push + getSt/setSt/getCls/getMon/getNum...
  components/ui.jsx        # Card, KPI, Pill, Bar, Donut, EditSelect, TabTitle, resolveTone...
  components/PeriodBar.jsx # chọn Kỳ báo cáo (Tuần/Tháng/Học kì)
  components/Search.jsx    # tìm kiếm toàn trang (không dấu)
  tabs/*.jsx              # 16 tab (Trang chính, Tổng quan tổ, Chấm vở, Canvas, LEAD&Dự giờ, ...)
  lib/dates.js           # tiện ích ngày/tuần/deadline
backend/Code.gs          # backend Apps Script (v4): doGet/doPost save|pushReport|upsertEvents
agent/                   # hợp đồng dữ liệu cho AI agent (QUY_TAC_RA_SOAT, PROMPT_AGENT_va_MAU, mau_pushReport.json, AGENT_DATA_PUSH_GUIDE)
supabase/                # schema.sql (bảng + RLS) + functions/push-report (Edge Function cho agent)
```

## 5. Mô hình dữ liệu (state `S`) — QUAN TRỌNG
Toàn bộ app là **một object JSON `S`**; backend lưu nguyên cục này. Các nhánh chính:

| Nhánh | Ý nghĩa |
|---|---|
| `namHoc`, `namHocList` | năm học hiện tại + danh sách |
| `periodMode` | `'Tuần' \| 'Tháng' \| 'Học kì'` |
| `periodValue` | vd `"Tuần 1 · Tháng 7"` (tuần), `"Tháng 7"` (tháng), `"HK1"` |
| `tracks[]` | 6 mảng theo GV: `t0` Điền KH tuần · `t1` BC Chấm vở · `t2` BC Canvas · `t3` Buddy · `t4` LEAD · `t5` Dự giờ. t0–t2,t4,t5 dùng rowId **r0..r18**; **t3 (buddy) dùng pairId b0..b4** + mảng `gvs` (tên đầy đủ 2 người) |
| `assign[]` | phân công `{lop, mon, gv}` — “xương sống” cho Chấm vở/Canvas/KPI |
| `classAssign[]` | phân công KHTN theo lớp (tương thích cũ) |
| `events[]`,`giao[]`,`reports[]`,`linkCats[]`,`bgh[]`,`weekly[]`,`deadlines[]` | sự kiện, giao việc, việc định kỳ, cổng link, báo cáo BGH, lịch |
| `monthPlan{}` | kế hoạch tháng (I. Chuyên môn / II. Đào tạo / III. Chủ nhiệm) |
| `leadA0B0{}` | báo cáo LEAD iPad A0/B0 — **nguồn liên tổ, dữ liệu 25–26** (chỉ đọc) |
| `tabLinks{}` | link “mở nhanh” theo từng tab (bấm tiêu đề tab là mở) |
| `adminPin`, `meetingNotes`, `subjects[]` | mã admin (khóa giao diện), ghi chú họp, danh mục môn |
| **`snaps{}`** | **dữ liệu theo KỲ** — agent push vào đây (xem dưới) |

### `snaps` — dữ liệu theo kỳ
Khóa = `` `${namHoc}|${periodMode}|${periodValue}` ``, vd `"2026-2027|Tuần|Tuần 1 · Tháng 7"`.
```jsonc
snaps["2026-2027|Tuần|Tuần 1 · Tháng 7"] = {
  t0: { r1: { status: "Đã báo cáo", note: "" } },        // theo GV (rowId)
  t2: { r12: { status: "Cờ đỏ", note: "khai 11 lớp, log IT 10" } },
  cls: {
    canvas: { "6A01": { st: "Đã điền", pct: 96, note: "" }, "7A04": { st: "Chưa điền" } },
    vo:     { "6A01": { st: "Đã điền" } }
  },
  num: {
    lead:  { r1: { dk: 4, th: 4, dks: 2, ths: 1 } },   // dk=đăng kí, th=thực, dks/ths=LEAD-share
    dugio: { r1: { dk: 2, th: 2, lk: 2 } }              // lk=số link minh chứng đã điền
  }
}
// CHẤM VỞ theo Lớp×Môn LƯU Ở KEY THÁNG (kể cả khi đang xem tuần):
snaps["2026-2027|Tháng|Tháng 7"] = { mon: { "6A01|KHTN": { st: "Đã chấm", note: "" } } }
```

### Enum hợp lệ
- `status` (theo GV): `— · Đủ · Thiếu · Chưa · Đã báo cáo · Đạt · Tốt nghiệp · Đang buddy · Cờ đỏ`
- `cls.st` (Canvas/Vở theo lớp): `— · Đã điền · Chưa điền · Điền thiếu/sai`
- `mon.st` (chấm vở Lớp×Môn): `— · Đã chấm · Chấm thiếu · Chưa chấm`
- `num`: số nguyên ≥ 0 hoặc rỗng.

## 6. Nguyên tắc “số thật > số khai”
Nhiều chỉ số có **2 cột**: **đăng kí** (lấy từ log/hệ thống/agent cào) và **thực** (GV tự báo). App **tự bật cờ**: `thực > đăng kí` → 🚩 “khai vượt” (Cờ đỏ); `link minh chứng < thực dự` → thiếu link. → agent điền cột **đăng kí** từ nguồn khách quan, người điền cột **thực**.

## 7. Roster & phân quyền
- **19 GV, rowId r0..r18** (bảng đầy đủ trong `agent/AGENT_DATA_PUSH_GUIDE.md`). Tổ có **2 “Hiếu”, 2 “Lan Anh” (hậu tố (Lí)/(H)), 2 “Phương Thảo” (Vũ/Trần)** — ánh xạ tên phải cẩn thận.
- **4 lớp “Chưa phân công”** (7A0, 7A04, 9B0, 9B01) — cô Hoàng Yến rời tổ; các bảng tách riêng, không tính vào mẫu số hoàn thành.
- Vai: **GV** (xem) · **BGH** (xem + ghi chú) · **Tổ trưởng** (sửa/xóa) · **Tổ phó** (full) · **Agent** (push số cào). Auth **đang chuyển sang đăng nhập email + mật khẩu qua Supabase** (`src/lib/supabase.js`, login đã tích hợp; RLS + audit theo kế hoạch). Cần biến môi trường `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (khi deploy đặt ở Vercel).

## 8. Backend & đồng bộ
- **Apps Script (`backend/Code.gs` v4):** `doGet` trả cả cục JSON (ẩn `adminPin`); `doPost action=save` (admin lưu, merge, chống ghi đè bằng `baseUpdatedAt`/`SERVER_HAS_DATA`); `doPost action=pushReport` (agent push, **validate + merge theo trường**, whitelist lớp/môn); chia nhỏ JSON ≤45k/ô; `LockService`.
- **Supabase (`supabase/`, đang chuyển):** `app_state`(jsonb công khai) + `private_state` + `profiles`(vai) + `audit_log`; **RLS**; **Edge Function `push-report`** thay `pushReport`; **realtime**. Xem `../KE HOACH BACKEND SUPABASE (05-07-2026).md` và `../HUONG DAN SETUP SUPABASE (05-07-2026).md`.

## 9. Agent cào & push dữ liệu
Xem **`agent/AGENT_DATA_PUSH_GUIDE.md`** — hợp đồng đầy đủ: cào gì, JSON ra sao, gọi endpoint nào (Apps Script hôm nay / Supabase Edge Function sau), ví dụ payload, bảng ánh xạ tên GV → rowId.

## 10. Tài liệu liên quan (thư mục cha `G:\NSHM\26 27\`)
- `TONG QUAN DU AN & QUY TRINH TOI UU (04-07-2026).md` — bản đồ toàn bộ thư mục dự án.
- `KIEM TRA & SUA LOI DU AN (05-07-2026).md` — nhật ký review/sửa lỗi (4 vòng + UI Sáng/Tối).
- `KE HOACH BACKEND SUPABASE (05-07-2026).md`, `HUONG DAN SETUP SUPABASE (05-07-2026).md`.

## 11. Lưu ý cho người/AI phát triển tiếp
- **Đổi roster/phân công chỉ sửa ở `src/data/seed.js`**; nơi khác tham chiếu theo.
- `seed.js` còn **dữ liệu DEMO trong `snaps`** — chạy thật nên tách demo / reset về trắng.
- Có **2 “bàn tay” cùng sửa code** (Claude + agent Codex) — nên chốt 1 đầu mối sửa, tránh ghi đè.

# TỔNG HỢP DỰ ÁN — Trung tâm điều hành Tổ KHCN (đọc file này trước)
> Tài liệu "một nguồn sự thật" cho **người** và **AI** tiếp nhận dự án. Cập nhật 05/07/2026.
> ⚠️ KHÔNG chứa khóa bí mật (anon key/service_role/AGENT_SECRET/token nằm trong `.env` và Supabase, không commit).

## Mục lục
1. Dự án là gì · 2. Công nghệ & kiến trúc · 3. Chạy / Build / Deploy / Push GitHub
4. Cấu hình Supabase (env, bảng, RLS, tài khoản, Edge Function) · 5. Mô hình dữ liệu `S`
6. Cơ chế AI/OpenClaw push dữ liệu (hợp đồng đầy đủ) · 7. Roster 19 GV + rowId
8. Phân quyền · 9. Danh sách file · 10. Nguyên tắc vận hành & bài học · 11. Việc còn lại

---

## 1. Dự án là gì
Web nội bộ giúp **Tổ phó chuyên môn** (thầy Dương Đức Hiếu, THCS Ngôi Sao Hoàng Mai) điều hành tổ **Khoa học – Công nghệ (KHCN)** năm học **2026–2027**: theo dõi báo cáo tuần/tháng của **19 giáo viên**, chấm vở, Canvas, LEAD/dự giờ, sự kiện–cuộc thi, và **xuất báo cáo nhanh cho BGH**. Dữ liệu tổng hợp **bán tự động**: agent (OpenClaw/Hermes) **cào số liệu từ các link báo cáo** rồi push lên, kết hợp **nhập tay**. Mục tiêu: BGH/TTCM "nhìn phát hiểu", GV "tra cứu việc của mình" dễ nhất.

Nguyên tắc: **"Sổ tay để tra cứu — AI rà soát để xử lý — Web để hiển thị"** và **"số thật > số khai"** (§6).

## 2. Công nghệ & kiến trúc
- **Frontend:** React 18 + Vite + TailwindCSS (SPA, 16 tab). State toàn cục qua React Context (`src/data/store.jsx`), tự lưu **localStorage** + đồng bộ **Supabase**. Giao diện Sáng/Tối (mặc định Sáng), nút 🌙/☀️.
- **Backend:** **Supabase** — Postgres (bảng `app_state` chứa cả cục JSON `S` dạng `jsonb`) + **Auth** (email/mật khẩu) + **RLS** (phân quyền tại DB) + **Realtime** (người xem tự cập nhật) + **audit_log** + **Edge Function `push-report`** (cửa cho agent). *(Bản Google Apps Script `backend/Code.gs` là backend CŨ, giữ để tham khảo/không dùng.)*
- **Thiết kế NULL-SAFE:** nếu thiếu `.env` (VITE_SUPABASE_*) thì `src/lib/supabase.js` trả `null` → app vẫn chạy bằng localStorage (không trắng màn), đăng nhập báo "chưa cấu hình".

```
Người xem (GV) ──(link, không đăng nhập)──►  Web React  ◄──(đăng nhập email/mật khẩu)── TP/TT/BGH
                                               │  ▲ realtime
                                    đọc/ghi(RLS)│  │
                                               ▼  │
   OpenClaw ──cào link──► Edge Function push-report ──validate+merge+audit──► Supabase(app_state / audit_log)
   (giữ AGENT_SECRET, chạy máy chủ)            (service_role ẩn trong hàm)
```

## 3. Chạy / Build / Deploy / Push GitHub
```bash
npm install            # BẮT BUỘC (có @supabase/supabase-js)
npm run dev            # chạy thử http://localhost:5173
npm run build          # build → dist/
```
**File `.env`** (ở gốc dự án, đã .gitignore — KHÔNG commit):
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key JWT — dán từ Supabase>
```
> Project hiện tại: `https://jpomsgynbjvoxotppxqy.supabase.co` (anon key nằm trong `.env`, không ghi ở đây).

**Deploy Vercel:** Import repo → Framework **Vite** (Build `npm run build`, Output `dist`) → thêm **Environment Variables** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → Deploy.

**Push GitHub** (chạy trên MÁY, vì sandbox chặn GitHub). Tạo repo rỗng trước, thay `<TOKEN>`+`<USERNAME>`:
```bash
cd "G:\NSHM\26 27\KHCN-DIEU-HANH"
npm install
git init && git add . && git commit -m "KHCN-DIEU-HANH"
git branch -M main
git remote add origin https://<TOKEN>@github.com/<USERNAME>/khcn-dieu-hanh.git
git push -u origin main
```
`.gitignore` đã loại `node_modules`/`.env`/`dist`. **Thu hồi token GitHub sau khi push.**

## 4. Cấu hình Supabase (làm 1 lần)
1. **Tạo project** (supabase.com, free, region Singapore).
2. **SQL Editor → New query →** dán toàn bộ `supabase/schema.sql` → **Run**. Tạo 4 bảng + RLS + trigger tạo profile + hàm `my_role()`:
   - `app_state(id=1, data jsonb, updated_at, updated_by)` — **công khai đọc**, ghi chỉ `tp/tt/bgh`.
   - `private_state(...)` — dữ liệu nhạy cảm, chỉ đăng nhập mới đọc.
   - `profiles(id, email, role)` — vai `gv|bgh|tt|tp` (mặc định `gv`).
   - `audit_log(actor, role, action, target, summary, at)` — nhật ký.
3. **Authentication → Providers → Email** (bật, tắt tự đăng ký) → **Users → Add user** (email+mật khẩu, Auto Confirm) cho **TP/TT/BGH**. GV không cần.
4. **Gán vai** (SQL Editor):
   ```sql
   update public.profiles set role='tp'  where email='...';  -- tổ phó (full)
   update public.profiles set role='tt'  where email='...';  -- tổ trưởng (sửa/xóa)
   update public.profiles set role='bgh' where email='...';  -- BGH (xem+ghi chú)
   ```
5. **Project Settings → API →** copy **Project URL** + **anon public key** → điền vào `.env` (local) và Vercel env.
6. **(Cho agent) Edge Functions → Create function `push-report` →** dán `supabase/functions/push-report/index.ts` → Deploy. **Manage secrets →** thêm `AGENT_SECRET` = chuỗi bí mật tự đặt (đưa cho OpenClaw). `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` Supabase tự có.
7. **Lần đầu có dữ liệu:** đăng nhập vai `tp` → tab **☁️ Đồng bộ → "Lưu lên máy chủ"** để đẩy dữ liệu hiện tại lên `app_state`.

> Ghi chú mô hình JSON blob: "xóa sự kiện" thực chất là UPDATE `app_state.data`, nên RLS chỉ phân biệt ĐỌC vs GHI; phân biệt "sửa" vs "xóa" là do **app** kiểm soát theo vai. Muốn ép ở DB thì tách bảng quan hệ (giai đoạn sau).

## 5. Mô hình dữ liệu (state `S`)
Toàn bộ app là **một object JSON `S`**, lưu ở `app_state.data`. Nhánh chính:

| Nhánh | Ý nghĩa |
|---|---|
| `namHoc`, `namHocList` | năm học + danh sách |
| `periodMode` | `'Tuần' \| 'Tháng' \| 'Học kì'` |
| `periodValue` | `"Tuần 1 · Tháng 7"` / `"Tháng 7"` / `"HK1"` |
| `tracks[]` | 6 mảng theo GV: `t0` KH tuần · `t1` BC Chấm vở · `t2` BC Canvas · `t3` Buddy · `t4` LEAD · `t5` Dự giờ. t0–t2,t4,t5 dùng **r0..r18**; **t3 dùng pairId b0..b4** (+ mảng `gvs` tên đầy đủ) |
| `assign[]` | phân công `{lop, mon, gv}` — xương sống Chấm vở/Canvas/KPI |
| `events[]`,`giao[]`,`reports[]`,`linkCats[]`,`bgh[]`,`weekly[]`,`deadlines[]`,`monthPlan{}` | sự kiện, giao việc, việc định kỳ, cổng link, báo cáo BGH, lịch, kế hoạch tháng |
| `leadA0B0{}` | LEAD iPad A0/B0 — **nguồn liên tổ 25–26** (chỉ đọc) |
| `tabLinks{}` | link "mở nhanh" theo tab (bấm tiêu đề tab để mở) |
| `snaps{}` | **dữ liệu theo KỲ — agent push vào đây** |

### `snaps` — key = `` `${namHoc}|${periodMode}|${periodValue}` ``
```jsonc
snaps["2026-2027|Tuần|Tuần 1 · Tháng 7"] = {
  t0: { r1: { status:"Đã báo cáo", note:"" } },              // theo GV (rowId)
  t2: { r12:{ status:"Cờ đỏ", note:"khai 11 lớp, log IT 10" } },
  cls:{ canvas:{ "6A01":{ st:"Đã điền", pct:96, note:"" }, "7A04":{ st:"Chưa điền" } },
        vo:    { "6A01":{ st:"Đã điền" } } },
  num:{ lead: { r1:{ dk:4, th:4, dks:2, ths:1 } },            // dk=đăng kí, th=thực, dks/ths=LEAD-share
        dugio:{ r1:{ dk:2, th:2, lk:2 } } } }                 // lk=số link minh chứng
// CHẤM VỞ Lớp×Môn LƯU Ở KEY THÁNG (kể cả khi xem tuần):
snaps["2026-2027|Tháng|Tháng 7"] = { mon:{ "6A01|KHTN":{ st:"Đã chấm", note:"" } } }
```
### Enum hợp lệ
- `status` (theo GV): `— · Đủ · Thiếu · Chưa · Đã báo cáo · Đạt · Tốt nghiệp · Đang buddy · Cờ đỏ`
- `cls.st` (Canvas/Vở lớp): `— · Đã điền · Chưa điền · Điền thiếu/sai`
- `mon.st` (chấm vở): `— · Đã chấm · Chấm thiếu · Chưa chấm`
- `num`: số nguyên ≥ 0 hoặc rỗng `""`.

## 6. Cơ chế AI/OpenClaw push dữ liệu (hợp đồng đầy đủ)
**Luồng:** OpenClaw mở link báo cáo tổ/liên phòng → cào (% Canvas, tiết LEAD từ log, ai chưa điền…) → ánh xạ tên→rowId → tạo JSON → **POST** lên Edge Function.

**Endpoint (Supabase):**
- `POST https://<project-ref>.functions.supabase.co/push-report`
- Header: `x-agent-secret: <AGENT_SECRET>` + `Content-Type: application/json`
- Body:
```json
{ "namHoc":"2026-2027", "periodMode":"Tuần", "periodValue":"Tuần 1 · Tháng 7", "setCurrent":true,
  "snaps":{ "t0":{ "r1":{"status":"Đã báo cáo"} } },
  "cls":{ "canvas":{ "6A01":{"st":"Đã điền","pct":96} } },
  "mon":{ "6A01|KHTN":{"st":"Đã chấm"} },
  "num":{ "lead":{ "r1":{"dk":4,"th":4} }, "dugio":{ "r1":{"dk":2,"th":2,"lk":2} } } }
```
Hàm sẽ: kiểm mã agent → **validate** (enum, khoá mon "lớp|môn") → **merge CHỈ trường gửi lên** (không đè cả cục) → ghi `audit_log` (`source=agent`). Sai enum → **từ chối kèm danh sách lỗi**.

**Quy tắc:**
- Chỉ push **số cào được**; cột **đăng kí (dk)** từ log/hệ thống, cột **thực (th)** để người nhập. App tự bật cờ 🚩 khi `th > dk` (khai vượt) hoặc `lk < th` (thiếu link).
- **KHÔNG đè ghi chú/trạng thái người nhập tay.**
- `periodValue` phải đúng: tuần = `"Tuần X · Tháng Y"`, chấm vở (`mon`) = `"Tháng Y"`.
- **t3 (buddy) dùng pairId b0..b4**, không dùng r-id.
- Suy trạng thái: có % → `Đã điền`; không thấy bài → `Chưa điền`; đã nộp → `Đã báo cáo`; thiếu mục → `Thiếu`; nghi khai sai → `Cờ đỏ` + note căn cứ.

*(Chi tiết + ví dụ dài: `agent/AGENT_DATA_PUSH_GUIDE.md`. Backend cũ Apps Script dùng `action=pushReport` + `token` — cùng khung JSON.)*

## 7. Roster 19 GV → rowId
| rid | GV | rid | GV |
|---|---|---|---|
| r0 | Nguyễn Văn Hiếu | r10 | Nguyễn Nhật Khánh |
| **r1** | **Dương Đức Hiếu** (tổ phó) | r11 | Ngô Hoài Thương |
| r2 | Nguyễn Thị Lan Anh **(Lí)** | r12 | Nguyễn Nhật Hoàng |
| r3 | Vũ Thị Phương Thảo | r13 | Hà Ngọc Ánh |
| r4 | Hoàng Thị Thùy Linh | r14 | Ngô Thu Hằng |
| r5 | Nguyễn Thị Ánh Sao | r15 | Nguyễn Hồng Loan |
| r6 | Phạm Minh Đức | r16 | Trần Phương Thảo |
| r7 | Nguyễn Thị Oanh | r17 | Phạm Minh Hiếu |
| r8 | Lò Linh Chi | r18 | Diệp Phương Mai |
| r9 | Nguyễn Thị Lan Anh **(H)** | | |

⚠️ **Trùng tên:** 2 "Hiếu" (r0/r1), 2 "Lan Anh" (r2 **(Lí)** / r9 **(H)**), 2 "Phương Thảo" (r3 **Vũ** / r16 **Trần**) — ánh xạ phải nhìn họ/hậu tố.
**Buddy (t3):** b0 Lan Anh(Lí)→Đức Hiếu · b1 Ngô Hằng→Lan Anh(H) · b2 Ánh Sao→Linh Chi · b3 Phương Mai→Hồng Loan · b4 Nhật Hoàng→Ngọc Ánh.
**4 lớp "Chưa phân công"** (cô Hoàng Yến rời tổ): 7A0, 7A04, 9B0, 9B01 — tách riêng, không tính vào mẫu số hoàn thành.

## 8. Phân quyền
| Vai | Đăng nhập | Đọc | Sửa | Xóa |
|---|---|---|---|---|
| GV | Không (xem link) | ✅ | ❌ | ❌ |
| BGH | Có | ✅ | ✅ ghi chú/trạng thái | ❌ |
| Tổ trưởng (tt) | Có | ✅ | ✅ | ✅ |
| Tổ phó (tp) | Có | ✅ | ✅ | ✅ |
| Agent (OpenClaw) | Không (AGENT_SECRET) | — | ✅ chỉ số cào | ❌ |

App map: vai ∈ {tp,tt,bgh} → `role='admin'` (hiện tab quản trị + nút sửa); còn lại → `role='view'`.

## 9. Danh sách file quan trọng
- `src/data/seed.js` — **DỮ LIỆU CHUẨN** (roster, phân công, enum, mẫu snaps). Đổi roster chỉ sửa ở đây.
- `src/data/store.jsx` — state + Supabase (auth/đồng bộ/realtime/audit) + mọi getter (getSt/getCls/getMon/getNum…).
- `src/lib/supabase.js` — client null-safe.
- `src/App.jsx` — khung + đăng nhập email/mật khẩu.
- `src/tabs/*` — 16 tab. `src/components/ui.jsx` — UI dùng chung + `TabTitle` (tiêu đề tab bấm mở link) + `resolveTone`.
- `supabase/schema.sql` — bảng + RLS. `supabase/functions/push-report/index.ts` — Edge Function agent.
- `agent/AGENT_DATA_PUSH_GUIDE.md`, `agent/mau_pushReport.json` — hợp đồng agent.
- Ở thư mục cha `G:\NSHM\26 27\`: `KIEM TRA & SUA LOI DU AN...md` (nhật ký review), `KE HOACH/HUONG DAN SETUP SUPABASE...md`.

## 10. Nguyên tắc vận hành & bài học
- **Một đầu mối sửa code.** Từng có nhiều agent (Codex, antigravity) cùng auto-sửa → loạn/rollback lung tung. **Bài học: luôn `git commit` trước khi cho agent đụng vào; agent khác chỉ *review*, không *sửa*.**
- Backup thủ công định kỳ (đã có `_BACKUP_KHCN_<ts>` ở thư mục cha).
- Bí mật (anon key, service_role, AGENT_SECRET, token GitHub, DB password) **không commit** — chỉ ở `.env` / Supabase secrets.

## 11. Việc còn lại (TODO)
- [ ] Chạy `supabase/schema.sql` + tạo tài khoản TP/TT/BGH + gán vai.
- [ ] `npm install` + `npm run dev` test đăng nhập; đăng nhập tp → "Lưu lên máy chủ" lần đầu.
- [ ] Deploy Edge Function `push-report` + đặt `AGENT_SECRET`; trỏ OpenClaw vào.
- [ ] Push GitHub + import Vercel + đặt env; **thu hồi token GitHub cũ**.
- [ ] (Sau) tách demo khỏi `seed.js` (reset về trắng); gắn nhãn/ẩn LEAD A0/B0 25-26; cân nhắc tách bảng quan hệ nếu cần phân quyền theo từng mục.

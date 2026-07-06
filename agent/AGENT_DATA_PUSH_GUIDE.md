# HỢP ĐỒNG DỮ LIỆU CHO AGENT (OpenClaw / Hermes) — cào & push
> Đọc file này là đủ để cào số liệu từ link báo cáo → tạo JSON → POST lên backend. Kèm mẫu: `mau_pushReport.json`.

## 1. Luồng tổng quát
```
Agent (OpenClaw/Hermes)
  ├─ (1) Mở các LINK báo cáo (tổ nội bộ + liên phòng): Canvas, LEAD/iPad log, KH tuần, chấm vở...
  ├─ (2) Cào số: % Canvas mỗi lớp, số tiết LEAD đăng kí (từ log), ai CHƯA điền/CHƯA làm...
  ├─ (3) Ánh xạ: tên GV → rowId (bảng §6); mã lớp giữ nguyên ("6A01", "7A04"...)
  ├─ (4) Tạo JSON đúng hợp đồng §3–§4
  └─ (5) POST lên endpoint §2 → backend validate + merge (chỉ ghi trường agent gửi) + ghi audit
```
**Nguyên tắc vàng:** agent **chỉ ghi trường mình cào được** (số khách quan). KHÔNG đụng ghi chú/trạng thái do người nhập tay. Theo triết lý **“số thật > số khai”**: cột **đăng kí** (dk) lấy từ log/hệ thống (agent), cột **thực** (th) do GV tự báo (người) — app tự bật cờ khi lệch.

## 2. Endpoint

### 2A. HIỆN TẠI — Google Apps Script
- `POST https://script.google.com/macros/s/…/exec`
- Header: `Content-Type: text/plain;charset=utf-8`
- Body có thêm `token` (ADMIN_TOKEN) và `action`:
```json
{ "token": "<ADMIN_TOKEN>", "action": "pushReport", "...": "...(phần §3)" }
```

### 2B. SAU KHI CHUYỂN — Supabase Edge Function (khuyến nghị)
- `POST https://<project-ref>.functions.supabase.co/push-report`
- Header: `x-agent-secret: <AGENT_SECRET>` và `Content-Type: application/json`
- Body **giống hệt §3 nhưng KHÔNG cần `token`/`action`** (đã xác thực bằng header):
```json
{ "namHoc":"2026-2027", "periodMode":"Tuần", "periodValue":"Tuần 1 · Tháng 7", "setCurrent":true, "snaps":{...}, "cls":{...}, "mon":{...}, "num":{...} }
```
> Backend tự: kiểm tra hợp lệ (enum, whitelist lớp/môn) → **merge chỉ trường gửi lên** → ghi `audit_log` với `source=agent`. Nếu payload sai enum sẽ bị **từ chối kèm danh sách lỗi**; lớp/môn lạ sẽ **bỏ qua + cảnh báo**.

## 3. Khung JSON (bắt buộc)
```jsonc
{
  "namHoc": "2026-2027",
  "periodMode": "Tuần",                 // "Tuần" | "Tháng" | "Học kì"
  "periodValue": "Tuần 1 · Tháng 7",    // xem §5 định dạng
  "setCurrent": true,                   // (tùy) đặt kỳ này thành kỳ đang xem
  "snaps": { "t0": { "r1": { "status": "Đã báo cáo", "note": "" } } },  // theo GV
  "cls":   { "canvas": { "6A01": { "st": "Đã điền", "pct": 96, "note": "" } },
             "vo":     { "6A01": { "st": "Đã điền" } } },               // theo lớp
  "mon":   { "6A01|KHTN": { "st": "Đã chấm", "note": "" } },            // chấm vở Lớp×Môn (kỳ THÁNG)
  "num":   { "lead":  { "r1": { "dk": 4, "th": 4, "dks": 2, "ths": 1 } },
             "dugio": { "r1": { "dk": 2, "th": 2, "lk": 2 } } }         // số liệu theo GV
}
```

## 4. Từ điển trường & enum
**`snaps` (theo GV, dùng rowId):** `t0` Điền KH tuần · `t1` BC Chấm vở · `t2` BC Canvas · **`t3` Buddy (dùng pairId b0..b4, KHÔNG dùng r-id)** · `t4` LEAD · `t5` Dự giờ. Mỗi ô: `{ "status": <enum>, "note": "" }`.
- `status` ∈ `— · Đủ · Thiếu · Chưa · Đã báo cáo · Đạt · Tốt nghiệp · Đang buddy · Cờ đỏ`.

**`cls` (theo lớp):** `canvas` và `vo`, key = mã lớp. Ô: `{ "st": <enum>, "note": "", "pct": <0–100, chỉ canvas> }`.
- `cls.st` ∈ `— · Đã điền · Chưa điền · Điền thiếu/sai`.

**`mon` (chấm vở Lớp×Môn):** key = `"<lớp>|<môn>"` (vd `"6A01|KHTN"`). Ô: `{ "st": <enum>, "note": "" }`.
- `mon.st` ∈ `— · Đã chấm · Chấm thiếu · Chưa chấm`. **Lưu ý: chấm vở luôn theo kỳ THÁNG** → đặt `periodMode:"Tháng"`, `periodValue:"Tháng 7"`.

**`num` (số theo GV, dùng rowId):**
- `lead[rid] = { dk, th, dks, ths }` — dk=đăng kí LEAD 1:1, th=thực dạy, dks=đăng kí LEAD-share, ths=thực share.
- `dugio[rid] = { dk, th, lk }` — dk=đăng kí, th=thực dự, lk=số link minh chứng đã điền.
- Giá trị: số nguyên ≥ 0 (hoặc rỗng `""`). App tự bật cờ 🚩 khi `th > dk` (khai vượt) hoặc `lk < th` (thiếu link).

## 5. Định dạng `periodValue` (phải khớp app)
- Tuần: `"Tuần X · Tháng Y"` (vd `"Tuần 1 · Tháng 7"`). **KHÔNG** dùng số tuần ISO kiểu `"Tuần 28"`.
- Tháng (dùng cho chấm vở `mon`): `"Tháng Y"` (vd `"Tháng 7"`).
- Học kì: `"HK1"` | `"HK2"`.

## 6. Ánh xạ tên GV → rowId (roster chuẩn 19 GV, r0..r18)
| rid | Giáo viên | rid | Giáo viên |
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

⚠️ **Trùng tên — phải phân biệt:** 2 “Hiếu” (r0 Văn Hiếu / r1 Đức Hiếu), 2 “Lan Anh” (r2 **(Lí)** / r9 **(H)**), 2 “Phương Thảo” (r3 **Vũ** / r16 **Trần**). Ánh xạ sai = báo cáo sai người.

**Buddy (track t3, pairId):** b0 = Lan Anh(Lí)→Đức Hiếu · b1 = Ngô Hằng→Lan Anh(H) · b2 = Ánh Sao→Linh Chi · b3 = Phương Mai→Hồng Loan · b4 = Nhật Hoàng→Ngọc Ánh.

## 7. Quy tắc suy ra trạng thái khi cào
- Cào **Canvas**: có % → `cls.canvas[lop] = { st:"Đã điền", pct:<%> }`; lớp không thấy bài → `{ st:"Chưa điền" }`; thiếu outcome/sai → `{ st:"Điền thiếu/sai", note:"…" }`.
- Cào **LEAD/iPad log**: điền `num.lead[rid].dk` (đăng kí từ log). Cột `th` (thực) để người nhập; nếu cào được cả thực thì điền, app tự so.
- Cào **KH tuần/chấm vở**: ai đã nộp → `t0[rid].status="Đã báo cáo"`; thiếu mục → `"Thiếu"` (ghi rõ `note`); chưa làm → `"Chưa"`.
- **Nghi khai sai** (thực > đăng kí, hoặc khai lệch log): đặt `status:"Cờ đỏ"` + `note` nêu căn cứ (vd `"khai 11 lớp, log IT 10"`).
- **KHÔNG** ghi đè các ô người đã nhập tay (ghi chú, trạng thái chốt). Chỉ push trường cào được.

## 8. Ví dụ payload đầy đủ (Supabase Edge Function)
```json
{
  "namHoc": "2026-2027",
  "periodMode": "Tuần",
  "periodValue": "Tuần 1 · Tháng 7",
  "setCurrent": true,
  "snaps": {
    "t0": { "r1": {"status":"Đã báo cáo","note":""}, "r12": {"status":"Chưa","note":""} },
    "t2": { "r12": {"status":"Cờ đỏ","note":"khai 11 lớp, log IT 10"} }
  },
  "cls": {
    "canvas": { "6A01": {"st":"Đã điền","pct":96}, "7A04": {"st":"Chưa điền"} }
  },
  "num": {
    "lead":  { "r1": {"dk":4,"th":4,"dks":2,"ths":1}, "r12": {"dk":10,"th":11} },
    "dugio": { "r1": {"dk":2,"th":2,"lk":2} }
  }
}
```
Chấm vở (gói riêng, kỳ Tháng):
```json
{ "namHoc":"2026-2027", "periodMode":"Tháng", "periodValue":"Tháng 7",
  "mon": { "6A01|KHTN": {"st":"Đã chấm"}, "6B01|KHTN": {"st":"Chấm thiếu","note":"thiếu 3 HS"} } }
```

## 9. Tài liệu nền
- `PROMPT_AGENT_va_MAU.md` — prompt gốc + bảng mã (bản mô tả sớm).
- `QUY_TAC_RA_SOAT.md` — quy tắc quyết định Đã điền/Thiếu/Chưa từ sheet KH tuần.
- `mau_pushReport.json` — mẫu JSON chạy được.
- `../README.md` §5 — mô hình dữ liệu `S` đầy đủ.

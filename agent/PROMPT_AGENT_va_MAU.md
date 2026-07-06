# MẪU & PROMPT CHO AI AGENT (đọc – lọc – báo cáo → push vào app)

AI đọc file GV điền (chấm vở / Canvas / LEAD / dự giờ / buddy) của một **kỳ** → trả **JSON** đúng mẫu → POST tới **URL Web App** (backend). App hiện số ngay theo đúng năm học + kỳ.

## Bảng mã (bắt buộc)
- **Mảng theo GV (snaps):** `t1`=Chấm vở · `t2`=Canvas · `t3`=Buddy · `t4`=LEAD · `t5`=Dự giờ.
  ⚠️ **`t3` (Buddy) dùng pairId riêng `b0..b4`** (mỗi id = 1 cặp buddy), KHÔNG dùng rowId roster `r0..r18`. Backend sẽ cảnh báo (bỏ qua ô) nếu push `t3` bằng r-id. Các mảng còn lại (t0–t2, t4, t5) dùng rowId roster.
- **Mã GV (rowId) — roster CHUẨN 2026-2027 (19 GV, theo file "KH THÁNG 7 của TCM & CÁ NHÂN" mới nhất, khớp `QUY_TAC_RA_SOAT.md` và `src/data/seed.js`):** r0 Văn Hiếu (Nguyễn) · r1 **Đức Hiếu (Dương)** · r2 Lan Anh (Lí) · r3 Phương Thảo (Vũ) · r4 Thùy Linh · r5 Ánh Sao · r6 Minh Đức · r7 Oanh · r8 Linh Chi · r9 Lan Anh (H) · r10 Nhật Khánh · r11 Hoài Thương (Ngô) · r12 Nhật Hoàng · r13 Ngọc Ánh (Hà) · r14 Ngô Hằng · r15 Hồng Loan · r16 Phương Thảo (Trần) · r17 Minh Hiếu (Phạm) · r18 Phương Mai (Diệp).
  ⚠️ Tổ có 2 "Hiếu", 2 "Lan Anh", 2 "Phương Thảo" — ánh xạ tên phải nhìn cả họ/bộ môn/hậu tố. Cô Kiều Anh (TTCM) và cô Hoàng Yến KHÔNG còn trong roster KHCN. Các bản roster cũ (17 GV, 18 GV) đã **hết hiệu lực** từ 04/07/2026.
- **Theo lớp (cls):** `canvas` và `vo`, key là mã lớp (6A0, 7A04, 8B04…), giá trị `{st, note}` với `st` ∈ `Đã điền / Chưa điền / Điền thiếu/sai / —`.
- **status (theo GV):** `— / Đủ / Thiếu / Chưa / Đã báo cáo / Đạt / Tốt nghiệp / Đang buddy / Cờ đỏ`.

## PROMPT (đưa cho AI)
```
Bạn là trợ lý tổng hợp báo cáo Tổ KHCN. Tôi dán nội dung các file GV điền của một KỲ.
1) Xác định trạng thái mỗi GV/lớp theo quy ước: "Đủ/Đã điền" nếu hoàn thành; "Thiếu/Điền thiếu/sai" nếu còn sót (ghi rõ ở note); "Chưa/Chưa điền" nếu chưa làm; "—" nếu không rõ. Số tự khai lệch số hệ thống → "Cờ đỏ".
2) KHÔNG bịa. Chỉ dùng đúng bộ trạng thái cho phép. Ánh xạ tên GV → rowId, và điền theo lớp vào cls.canvas/cls.vo.
3) XUẤT DUY NHẤT một JSON đúng mẫu action=pushReport (kèm namHoc, periodMode, periodValue), không kèm giải thích.
Năm học: <...> · Kỳ: <Tuần/Tháng> <nhãn>. Token: <ADMIN_TOKEN>.
[DÁN NỘI DUNG CÁC FILE Ở ĐÂY]
```

## Trường mở rộng (v2 — 04/07/2026)
Ngoài `snaps` (t0–t5) và `cls`, backend còn merge:
- **`mon`** — chấm vở theo Lớp×Môn (kỳ **Tháng**): key `"<lớp>|<môn>"`, giá trị `{ "st": "Đã chấm / Chấm thiếu / Chưa chấm / —", "note": "..." }`. VD: `"mon": { "6A01|KHTN": { "st": "Đã chấm", "note": "" } }`.
- **`num`** — số liệu LEAD/dự giờ theo GV: `"num": { "lead": { "r16": { "dk": 4, "th": 4, "dks": 2, "ths": 1 } }, "dugio": { "r16": { "dk": 2, "th": 2, "lk": 2 } } }` (dk=đăng kí, th=thực, dks/ths=LEAD-share, lk=số link minh chứng đã điền). App tự tính cờ: thực > đăng kí → 🚩 khai vượt; link < thực dự → thiếu link.
- **`cls.canvas` có thêm `pct`** — tỉ lệ hoàn thành % của lớp: `{ "st": "Đã điền", "pct": 96, "note": "" }`.

## Mẫu JSON trả về
Xem `mau_pushReport.json` cùng thư mục. Gửi bằng POST `Content-Type: text/plain` tới URL Web App; backend merge đúng `namHoc|mode|value`, không đụng phần khác.

## Mở rộng an toàn
Agent nên **GET** dữ liệu trước để đọc roster (`tracks[].rows`, `classAssign`) rồi mới điền — tránh gán nhầm. Thêm lớp/GV/mảng mới chỉ cần giữ đúng tên trường; app bỏ qua trường lạ, không vỡ.

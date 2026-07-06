# QUY TẮC RÀ SOÁT BÁO CÁO TUẦN (cho AI + người kiểm tra)
> Đây là "nhiệm vụ rà soát" để AI đọc bảng KH tuần của GV → quyết định ai **Đã điền / Điền thiếu / Chưa điền** → xuất JSON push vào web. Dán file này cho AI cùng với dữ liệu.

## 1. Cấu trúc bảng KH tuần (nguồn)
- Sheet "KH TCM Tuần X Tháng Y": mỗi giáo viên chiếm **3 cột**: `Công việc | Tiến độ | Báo cáo chi tiết`.
- Các dòng nội dung theo mã: **I. Chuyên môn (1.1–1.6…)**, II. Đào tạo & Chuyên đề, III. Công tác chủ nhiệm, + các dòng phân công cụ thể (đội tuyển, cuộc thi, thực hành…).

## 2. Quy tắc xác định trạng thái mỗi GV
1. **Đã điền (đủ):** GV điền đủ phần **Chuyên môn mục 1.1 → 1.6** (cột Công việc có nội dung). → coi như hoàn thành báo cáo tuần cơ bản.
2. **Điền thiếu:** đã điền phần chính nhưng **bỏ trống ô/phần bắt buộc**, hoặc:
   - GV **có tên được phân công** ở một dòng cụ thể phía dưới (đội tuyển, cuộc thi, thực hành, khóa Canvas…) mà **bỏ trống** dòng đó.
   - GV là **chủ nhiệm** nhưng **không điền mục III. Công tác chủ nhiệm**.
3. **Chưa điền:** để trống phần lớn / không điền Chuyên môn 1.1–1.6.

> Nguyên tắc "soi thêm": các dòng dưới **chỉ kiểm tra với GV có tên** ở dòng đó, không bắt mọi GV.

## 3. Ánh xạ sang web (JSON push)
Điền vào **track `t0` = "Điền KH tuần"**, dùng `status`:
- Đã điền → **"Đã báo cáo"**
- Điền thiếu → **"Thiếu"** (ghi rõ chỗ thiếu ở `note`, vd "thiếu mục chủ nhiệm", "bỏ trống dòng đội tuyển")
- Chưa điền → **"Chưa"**

## 4. Mã giáo viên (rowId) – năm học 2026-2027 (19 GV)
| id | GV | id | GV |
|---|---|---|---|
| r0 | Nguyễn Văn Hiếu | r10 | Nguyễn Nhật Khánh |
| r1 | Dương Đức Hiếu | r11 | Ngô Hoài Thương |
| r2 | Nguyễn Thị Lan Anh (Lí) | r12 | Nguyễn Nhật Hoàng |
| r3 | Vũ Thị Phương Thảo | r13 | Hà Ngọc Ánh |
| r4 | Hoàng Thị Thùy Linh | r14 | Ngô Thu Hằng |
| r5 | Nguyễn Thị Ánh Sao | r15 | Nguyễn Hồng Loan |
| r6 | Phạm Minh Đức | r16 | Trần Phương Thảo |
| r7 | Nguyễn Thị Oanh | r17 | Phạm Minh Hiếu |
| r8 | Lò Linh Chi | r18 | Diệp Phương Mai |
| r9 | Nguyễn Thị Lan Anh (H) | | |

> Roster CHUẨN 19 GV theo file "KH THÁNG 7 của TCM & CÁ NHÂN" bản mới nhất (04/07/2026), rowId = đúng thứ tự cột trong sheet KH tuần. Cô Kiều Anh (TTCM) và cô Hoàng Yến không còn cột KHCN.

## 5. Mẫu JSON AI phải trả (push vào web)
```json
{
  "token": "KHCN-2627-doi-ma-nay",
  "action": "pushReport",
  "namHoc": "2026-2027",
  "periodMode": "Tuần",
  "periodValue": "Tuần 1 · Tháng 7",
  "setCurrent": true,
  "snaps": {
    "t0": {
      "r0": {"status":"Đã báo cáo","note":""},
      "r5": {"status":"Thiếu","note":"chủ nhiệm chưa điền mục III"},
      "r17": {"status":"Chưa","note":""}
    }
  }
}
```
> `periodValue` phải khớp định dạng app: **"Tuần X · Tháng Y"** (không kèm khoảng ngày trong key).

## 6. (Tùy chọn) Rà theo lớp – Canvas & Vở
Nếu đọc được dữ liệu theo lớp, điền thêm `cls.canvas` / `cls.vo` với key là mã lớp: `{ "st": "Đã điền|Chưa điền|Điền thiếu/sai", "note": "" }`. App sẽ hiển thị theo lớp / theo GV và cảnh báo xung đột nếu lớp đã chốt "xong" mà lại báo chưa.

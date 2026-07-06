# Báo Cáo Đánh Giá Mã Nguồn Chuyên Sâu (Deep Code Review)

Dựa trên yêu cầu review **kỹ lưỡng và khắt khe nhất** để hệ thống có thể vận hành ổn định cho quy mô toàn tổ, em đã tiến hành rà soát từng dòng logic từ frontend (`store.jsx`, các tab) đến backend (`Code.gs`). 

Dưới đây là các **lỗ hổng cực kì nghiêm trọng** về kiến trúc, bảo mật, và hiệu năng có thể dẫn đến **mất dữ liệu, sai lệch báo cáo, hoặc crash app** trong quá trình sử dụng thực tế:

---

## 1. Lỗ Hổng Bảo Mật & "Mất Đồng Bộ" Mật Khẩu (`adminPin`)
**Vấn đề:** 
- Hàm `doGet` ở backend cố tình **xóa `adminPin`** khi gửi dữ liệu xuống (nếu request không có token) để bảo mật: `delete d.adminPin;`
- Tuy nhiên, khi frontend nhận dữ liệu về thông qua hàm `cloudPull()`, nó sẽ gọi `replaceAll(data)`.
- Hàm `replaceAll` có logic: `if (data[k] === undefined) data[k] = s[k]`. Vì `adminPin` bị backend xóa, nó sẽ trở thành `undefined`, và frontend sẽ tự động gán lại mã PIN mặc định từ file seed là `"khcn-2627"`.
- **Hậu quả:** Bất kỳ thiết bị nào (ngay cả máy của Tổ trưởng) khi pull dữ liệu mới về đều sẽ bị **reset mật khẩu admin về mặc định**. Tổ trưởng không thể đổi mật khẩu an toàn trên app vì nó luôn bị ghi đè thành `"khcn-2627"` mỗi khi load lại trang.

**Đề xuất:**
- Tách biệt `adminPin` và `adminToken`.
- Không lưu `adminPin` trong khối dữ liệu dùng chung (`S`), mà chỉ lưu cấu hình mật khẩu trên Google Apps Script (Backend) hoặc so sánh băm (hash).

---

## 2. Race Condition - Ghi Đè Mất Dữ Liệu Chéo (Backend)
**Vấn đề:** 
- App có 2 luồng gửi dữ liệu: Tổ trưởng bấm **Lưu toàn bộ** (`action="save"`) và AI Agent tự động đẩy báo cáo (`action="pushReport"`).
- Ở luồng `save`, backend lấy toàn bộ file JSON từ frontend và **ghi đè trắng (overwrite)** vào ô `A1` của Google Sheet.
- **Hậu quả:** Giả sử Tổ trưởng mở app lúc 8:00 (lấy snapshot A). Lúc 8:30, AI Agent chạy `pushReport` để cập nhật trạng thái chấm vở của 5 giáo viên (vào thẳng Sheet). Lúc 8:35, Tổ trưởng mới bấm sửa 1 sự kiện và ấn "Lưu". App sẽ ghi đè bản snapshot A (chưa có báo cáo lúc 8:30 của AI) lên cloud. Toàn bộ báo cáo của 5 GV kia bị **bốc hơi hoàn toàn**.

**Đề xuất:**
- Luồng `save` từ frontend cũng phải thực hiện **merge (hợp nhất)** các properties chứ không được ghi đè 100%. 
- Hoặc backend cần dùng cơ chế Timestamp/ETag để chặn lưu nếu dữ liệu trên server đã bị người khác (hoặc AI) thay đổi so với lúc frontend tải về (hỏi ý kiến user trước khi đè).

---

## 3. Lỗi Thuật Toán Nhận Diện Tên Giáo Viên (Fuzzy Search Bug)
**Vấn đề:**
- Ở `TongQuanTab.jsx` và `TrackTab.jsx`, việc tìm kiếm Buddy dùng logic cắt chuỗi rất rủi ro:
  ```javascript
  const short = gv.replace(/\s*\([^)]*\)/, '').split(' ').slice(-2).join(' ')
  return r.who.includes(short)
  ```
- Nó cắt lấy 2 chữ cuối trong tên. Ví dụ "Nguyễn Thị Phương Thảo (Văn)" sẽ biến thành "Phương Thảo".
- **Hậu quả:** Nếu tổ có "Lê Thị Phương Thảo" và "Nguyễn Thị Phương Thảo", hàm `.includes('Phương Thảo')` sẽ bắt nhầm người, khiến báo cáo công việc Buddy của người này gán lộn sang người kia, dẫn đến việc tính toán % và cờ đỏ sai lệch.

**Đề xuất:**
- **Không dùng chuỗi tên làm ID.** Phải chuẩn hóa danh sách `TEACHERS` thành mảng object có `id` (ví dụ `gv_1`, `gv_2`) và dùng `id` này trên toàn bộ hệ thống (`snaps`, `assign`, `classAssign`). Chỉ dùng chuỗi tên để render UI.

---

## 4. Cổ Chai Hiệu Năng Kéo Sập Trình Duyệt (React Rendering)
**Vấn đề:**
- Trong `store.jsx`, mỗi khi user gõ phím vào ô "Ghi chú" (trigger `setSt`), app sử dụng `structuredClone(prev)` để copy **toàn bộ** cây dữ liệu khổng lồ (với hàng ngàn object con).
- **Hậu quả:** `structuredClone` trên 1 object state có kích thước lớn sẽ tốn thời gian đáng kể. Nếu gõ chữ liên tiếp (typing), hàm này chạy liên tục, gây ra hiện tượng **lag, giật khựng** bàn phím (input lag), đặc biệt trên điện thoại hay thiết bị cấu hình thấp của giáo viên.

**Đề xuất:**
- Không dùng `structuredClone` cho toàn bộ state. Chuyển sang dùng thư viện Immutable state nhẹ gọn như **Immer**, hoặc chỉ copy nông (shallow copy) tới đúng nhánh `snaps` cần sửa đổi.

---

## 5. Rủi Ro Phân Quyền Bề Mặt (Client-Side Auth)
**Vấn đề:**
- Hệ thống thực hiện logic kiểm tra "Quyền Admin" **chỉ trên trình duyệt** (trong `store.jsx`). Admin Token lại được lưu sẵn để push API.
- **Hậu quả:** Bất kì giáo viên nào mở F12 (DevTools) đều có thể sửa `localStorage.khcn_role_v4 = 'admin'` để mở khóa giao diện, sau đó xem được mã token trong Tab Đồng bộ và có thể tự ý can thiệp vào Database mà không để lại dấu vết.

**Đề xuất:**
- Mọi logic xác thực (auth) phải nằm phía Backend. 
- Không trả về token hoặc mật khẩu quản trị xuống cho user có quyền "view". Ai nhập đúng mã PIN mới được cấp Token đẩy (Push).

---

## KẾT LUẬN & HƯỚNG GIẢI QUYẾT
Kiến trúc hiện tại đáp ứng tốt tính "Nhanh - Gọn" nhưng đang bộc lộ rủi ro cao khi mở rộng cho toàn tổ (đặc biệt là vấn đề **Ghi đè mất dữ liệu** khi có AI Agent tham gia). 

Anh chỉ cần phản hồi lại em **ưu tiên xử lý lỗi nào trước**, em sẽ lên code sửa chi tiết (VD: Sửa Backend trước để tránh mất data, hoặc sửa frontend để gỡ lag bàn phím). Không đụng sửa code gốc cho đến khi có sự cho phép của anh!

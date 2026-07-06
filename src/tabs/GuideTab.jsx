import React from 'react'
import { Card, H3, TabTitle } from '../components/ui.jsx'

export default function GuideTab() {
  return (
    <div>
      <TabTitle id="guide">Hướng dẫn</TabTitle>
      <Card>
        <H3>Mô hình</H3>
        <p className="text-sm">Hub = <b>kho/chỉ báo</b>: gom link tổ (giữ cấu trúc 25–26), lịch, deadline, giao việc, sự kiện. GV bấm link ra file tổ để điền. <b>AI agent</b> đọc các file đó → tổng hợp trạng thái → push lên hub (backend Google). Tab Báo cáo BGH gom lại &amp; xuất theo mẫu.</p>
        <H3>Hai chế độ</H3>
        <p className="text-sm"><b>Người xem</b> (GV/BGH): xem được TẤT CẢ bảng tổng hợp — Tổng quan tổ (số liệu tuần, ma trận, biểu đồ), Chấm vở, Canvas &amp; Vở, LEAD &amp; Dự giờ, Theo dõi báo cáo, Phân công — nhưng chỉ đọc. <b>Quản trị</b> (đăng nhập bằng mã, mặc định <b>khcn-2627</b>): thêm Báo cáo BGH, Đồng bộ và mọi nút sửa. Đổi mã ở tab Đồng bộ. Lưu ý: mã chỉ là khóa giao diện — bảo mật thật nằm ở ADMIN_TOKEN phía máy chủ, không chia sẻ token.</p>
        <H3>Nhiều năm học</H3>
        <p className="text-sm">Chọn <b>Năm học</b> ở góc phải; mỗi kỳ báo cáo lưu riêng theo năm học nên dữ liệu các năm không lẫn. Bấm <b>+ năm</b> để mở năm học mới.</p>
        <H3>Canvas &amp; Vở theo lớp</H3>
        <p className="text-sm">Xem theo <b>lớp</b> hoặc theo <b>giáo viên</b>; tick “xong” để chốt. Nếu sau đó báo “chưa” cho lớp đã chốt xong → hiện <b>cảnh báo xung đột</b> để rà soát lại.</p>
        <H3>Triển khai</H3>
        <p className="text-sm"><code>npm install</code> → <code>npm run dev</code> để chạy thử; deploy Vercel: import repo, framework Vite, một link dùng chung. Backend Google Apps Script trong thư mục <code>backend/</code>.</p>
      </Card>
    </div>
  )
}

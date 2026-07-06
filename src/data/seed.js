// Roster CHUẨN năm học 2026-2027 (19 GV) — theo file "KH THÁNG 7 của TCM & CÁ NHÂN" bản mới nhất,
// đúng THỨ TỰ CỘT trong sheet KH tuần. Thứ tự = rowId r0..r18. (Kiều Anh TTCM & Hoàng Yến không còn cột KHCN.)
export const TEACHERS = [
  'Nguyễn Văn Hiếu', 'Dương Đức Hiếu', 'Nguyễn Thị Lan Anh (Lí)',
  'Vũ Thị Phương Thảo', 'Hoàng Thị Thùy Linh', 'Nguyễn Thị Ánh Sao',
  'Phạm Minh Đức', 'Nguyễn Thị Oanh', 'Lò Linh Chi', 'Nguyễn Thị Lan Anh (H)',
  'Nguyễn Nhật Khánh', 'Ngô Hoài Thương', 'Nguyễn Nhật Hoàng', 'Hà Ngọc Ánh',
  'Ngô Thu Hằng', 'Nguyễn Hồng Loan', 'Trần Phương Thảo', 'Phạm Minh Hiếu', 'Diệp Phương Mai'
]

export const ST_OPTS = ['—', 'Đủ', 'Thiếu', 'Chưa', 'Đã báo cáo', 'Đạt', 'Tốt nghiệp', 'Đang buddy', 'Cờ đỏ']
export const GOOD = ['Đủ', 'Đã báo cáo', 'Đạt', 'Tốt nghiệp']
export const NOTYET = ['—', 'Chưa', 'Thiếu']
export const CLS_ST = ['—', 'Đã điền', 'Chưa điền', 'Điền thiếu/sai']
export const VO_ST = ['—', 'Đã chấm', 'Chấm thiếu', 'Chưa chấm']
export const EV_ST = ['Chưa bắt đầu', 'Đang chuẩn bị', 'Đang diễn ra', 'Hoàn thành', 'Hoãn/Hủy']

// Các môn tổ phụ trách — thêm/bớt ở tab Phân công (mở rộng được)
export const SUBJECTS = ['KHTN', 'Science', 'Tin học', 'Công nghệ', 'Math']

function mkRows(buddy) {
  if (buddy) return [
    { who: 'Lan Anh → Đức Hiếu', gvs: ['Nguyễn Thị Lan Anh (Lí)', 'Dương Đức Hiếu'] },
    { who: 'Ngô Hằng → Lan Anh (H)', gvs: ['Ngô Thu Hằng', 'Nguyễn Thị Lan Anh (H)'] },
    { who: 'Ánh Sao → Linh Chi', gvs: ['Nguyễn Thị Ánh Sao', 'Lò Linh Chi'] },
    { who: 'Phương Mai → Hồng Loan', gvs: ['Diệp Phương Mai', 'Nguyễn Hồng Loan'] },
    { who: 'Nhật Hoàng → Ngọc Ánh', gvs: ['Nguyễn Nhật Hoàng', 'Hà Ngọc Ánh'] }
  ].map((w, i) => ({ id: 'b' + i, who: w.who, gvs: w.gvs })) // t3 buddy dùng pairId b0..b4 (KHÔNG trùng rowId roster r0..r18)
  return TEACHERS.map((t, i) => ({ id: 'r' + i, who: t }))
}

// Phân công KHTN theo lớp (47 lớp) - "xương sống" cho theo dõi theo lớp
export const CLASS_ASSIGN = [
  ['6A0', 'Nguyễn Thị Ánh Sao'], ['6A01', 'Dương Đức Hiếu'], ['6A02', 'Vũ Thị Phương Thảo'], ['6A03', 'Dương Đức Hiếu'], ['6A04', 'Lò Linh Chi'], ['6A05', 'Vũ Thị Phương Thảo'], ['6A06', 'Vũ Thị Phương Thảo'], ['6B0', 'Hoàng Thị Thùy Linh'], ['6B01', 'Dương Đức Hiếu'], ['6B02', 'Hoàng Thị Thùy Linh'], ['6B03', 'Lò Linh Chi'], ['6B04', 'Vũ Thị Phương Thảo'], ['6B05', 'Hoàng Thị Thùy Linh'], ['6B06', 'Phạm Minh Đức'],
  ['7A0', 'Chưa phân công'], ['7A01', 'Nguyễn Thị Lan Anh (H)'], ['7A02', 'Lò Linh Chi'], ['7A03', 'Lò Linh Chi'], ['7A04', 'Chưa phân công'], ['7A05', 'Nguyễn Thị Lan Anh (H)'], ['7A06', 'Nguyễn Thị Lan Anh (H)'], ['7B0', 'Nguyễn Nhật Khánh'], ['7B01', 'Nguyễn Thị Lan Anh (H)'], ['7B02', 'Nguyễn Nhật Khánh'], ['7B03', 'Nguyễn Thị Lan Anh (H)'], ['7B04', 'Nguyễn Thị Lan Anh (H)'], ['7B05', 'Hoàng Thị Thùy Linh'], ['7B06', 'Nguyễn Nhật Khánh'], ['7I0', 'Dương Đức Hiếu'],
  ['8A0', 'Nguyễn Thị Lan Anh (Lí)'], ['8A01', 'Nguyễn Thị Lan Anh (Lí)'], ['8A02', 'Phạm Minh Đức'], ['8A03', 'Nguyễn Thị Ánh Sao'], ['8A04', 'Nguyễn Nhật Khánh'], ['8B0', 'Phạm Minh Đức'], ['8B01', 'Nguyễn Thị Lan Anh (H)'], ['8B02', 'Nguyễn Thị Ánh Sao'], ['8B03', 'Dương Đức Hiếu'], ['8B04', 'Nguyễn Thị Lan Anh (H)'], ['8I0', 'Nguyễn Thị Lan Anh (Lí)'],
  ['9A0', 'Nguyễn Thị Lan Anh (Lí)'], ['9A01', 'Nguyễn Nhật Khánh'], ['9A02', 'Nguyễn Thị Ánh Sao'], ['9A03', 'Hoàng Thị Thùy Linh'], ['9B0', 'Chưa phân công'], ['9B01', 'Chưa phân công'], ['9B02', 'Nguyễn Thị Ánh Sao']
].map(([lop, gv]) => ({ lop, gv, khoi: lop[0] }))

// Phân công tổng quát Lớp × Môn × GV — nguồn chuẩn cho Chấm vở / Canvas / KPI.
// Khởi tạo từ phân công KHTN; các môn khác thêm dần ở tab "Phân công".
export const ASSIGN = CLASS_ASSIGN.map(a => ({ lop: a.lop, mon: 'KHTN', gv: a.gv }))

// So khớp tên GV trong chuỗi cặp buddy (chính xác 100% qua mảng gvs)
export function buddyHas(row, full) {
  if (!row || !full) return false
  if (row.gvs) return row.gvs.includes(full)
  // Fallback an toàn nếu thiếu gvs
  const base = full.replace(/\s*\([^)]*\)/, '').trim().split(' ').slice(-2).join(' ')
  return row.who && row.who.includes(base)
}

export function seed() {
  return {
    namHoc: '2026-2027',
    namHocList: ['2025-2026', '2026-2027', '2027-2028'],
    adminPin: 'khcn-2627',
    meetingNotes: '',
    tabLinks: {}, // link "mở nhanh" gắn theo từng tab — bấm tiêu đề tab là mở (admin gắn ở nút ✏️🔗)
    periodMode: 'Tuần',
    periodValue: 'Tuần 1 · Tháng 7',
    subjects: [...SUBJECTS],
    assign: ASSIGN.map(a => ({ ...a })),
    // Khu báo cáo LEAD A0/B0 — NGUỒN LIÊN TỔ (file "Báo tiết iPad A0,B0" do BGH khác phụ trách).
    // Tổ chỉ LỌC phần thành viên KHCN để đọc; cập nhật bằng AI đọc file liên tổ rồi thay rows.
    leadA0B0: {
      link: '', ky: 'Cả năm 2025-2026 (38 tuần)', capNhat: '04/07/2026',
      rows: [
        { gv: 'Ngô Thu Hằng', monlop: 'Science 6A0, 6B0, 7A0 + Hóa 6A0, 6B0', tansuat: '2 tuần 3 tiết', hientrang: 'Nâng cao', tuanBC: 38, tuanTong: 38 },
        { gv: 'Hà Ngọc Ánh', monlop: 'Tin 6B0', tansuat: '3 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 37, tuanTong: 38 },
        { gv: 'Nguyễn Thị Lan Anh (Lí)', monlop: 'Lí 8A0, 8B0', tansuat: '2 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 37, tuanTong: 38 },
        { gv: 'Nguyễn Nhật Hoàng', monlop: 'Tin 6A0, 7A0, 7B0, 8A0, 8B0', tansuat: '2 tuần 3 tiết', hientrang: 'Nâng cao', tuanBC: 37, tuanTong: 38 },
        { gv: 'Nguyễn Hồng Loan', monlop: 'Math 6A0, 6B0', tansuat: '2 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 37, tuanTong: 38 },
        { gv: 'Nguyễn Thị Ánh Sao', monlop: 'Sinh học 6A0, 8A0', tansuat: '1 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 37, tuanTong: 38 },
        { gv: 'Vũ Thị Phương Thảo', monlop: 'Lí 6A0', tansuat: '3 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 37, tuanTong: 38 },
        { gv: 'Nguyễn Thị Lan Anh (H)', monlop: 'Hóa 8B0', tansuat: '2 tuần 1 tiết', hientrang: 'Cơ bản', tuanBC: 36, tuanTong: 38 },
        { gv: 'Phạm Minh Đức', monlop: 'Sinh học 6B0, 7B0, 8B0', tansuat: '1 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 36, tuanTong: 38 },
        { gv: 'Dương Đức Hiếu', monlop: 'Lí 7A0', tansuat: '2 tuần 1 tiết', hientrang: 'Cơ bản', tuanBC: 36, tuanTong: 38 },
        { gv: 'Nguyễn Nhật Khánh', monlop: 'Hóa 7A0, 7B0, 8A0', tansuat: '1 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 36, tuanTong: 38 },
        { gv: 'Hoàng Thị Thùy Linh', monlop: 'Lí 6B0, 7B0', tansuat: '1 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 36, tuanTong: 38 },
        { gv: 'Phạm Thị Hoàng Yến', monlop: 'Sinh học 7A0', tansuat: '3 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 29, tuanTong: 38 },
        { gv: 'Trần Phương Thảo', monlop: '—', tansuat: '—', hientrang: '—', tuanBC: 19, tuanTong: 38 },
        { gv: 'Nguyễn Trần Nguyệt Ánh', monlop: 'Science 7B0', tansuat: '3 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 16, tuanTong: 38 },
        { gv: 'Diệp Phương Mai', monlop: 'Math 7B0', tansuat: '3 tuần 1 tiết', hientrang: 'Nâng cao', tuanBC: 10, tuanTong: 38 }
      ]
    },
    weekly: [
      { id: 'w1', name: 'Sinh hoạt chuyên môn (SHCM)', dow: 1, time: '16:00', on: true, u: '' },
      { id: 'w2', name: 'GV nộp Báo cáo tuần (BCT)', dow: 3, time: '23:00', on: true, u: '' },
      { id: 'w3', name: 'TTCM giao ban BGH', dow: 4, time: '', on: true, u: '' },
      { id: 'w4', name: 'GV nộp KHCN + Lịch báo giảng (LBG)', dow: 5, time: '23:59', on: true, u: '' },
      { id: 'w5', name: 'GV mới/trợ giảng nộp báo cáo buddy', dow: 5, time: '', on: true, u: '' },
      { id: 'w6', name: 'TPCM tổng hợp báo cáo tuần + nhắc', dow: 0, time: '', on: true, u: '' }
    ],
    deadlines: [
      { id: 'd4', name: 'Chốt bảng phân công chuyên môn', date: '', note: 'việc số 1 đầu năm', u: '' },
      { id: 'd5', name: 'Điểm GKI khối 9 – hạn Excel nội bộ', date: '', note: 'mốc 25-26: 21/10', u: '' },
      { id: 'd6', name: 'Điểm GKI khối 6,7,8 – hạn Excel nội bộ', date: '', note: 'mốc 25-26: 27/10', u: '' },
      { id: 'd7', name: 'Điểm HKI – hạn Excel nội bộ', date: '', note: 'mốc 25-26: 26/12', u: '' }
    ],
    events: [
      { id: 'e1', ten: 'Cuộc thi hè – Tên lửa nước (K6+9)', loai: 'Cuộc thi (nội bộ)', nguoi: 'Nguyễn Thị Lan Anh', date: '', trangthai: 'Chưa bắt đầu', u: '', note: '25-26: 22/7' },
      { id: 'e2', ten: 'Cuộc thi hè – Tay đua siêu hạng (K7+8)', loai: 'Cuộc thi (nội bộ)', nguoi: 'Nguyễn Thị Lan Anh', date: '', trangthai: 'Chưa bắt đầu', u: '', note: '' },
      { id: 'e3', ten: 'WYCTO – Olympic Hóa trẻ thế giới', loai: 'Cuộc thi (ngoài)', nguoi: 'Nguyễn Thị Lan Anh (H)', date: '2026-08-23', trangthai: 'Đang chuẩn bị', u: '', note: 'QG 23/8; QT 22–25/10 Ninh Bình' },
      { id: 'e4', ten: 'Ngày hội STEM', loai: 'Sự kiện (nội bộ)', nguoi: 'Nguyễn Thị Kiều Anh', date: '', trangthai: 'Chưa bắt đầu', u: '', note: '25-26: khởi động 25/3, CK 22/4' },
      { id: 'e5', ten: 'VANDA Science', loai: 'Cuộc thi (ngoài)', nguoi: 'Ngô Thu Hằng', date: '2026-05-23', trangthai: 'Chưa bắt đầu', u: '', note: 'QG online' },
      { id: 'e6', ten: 'Tekmonk Coding Olympiad', loai: 'Cuộc thi (ngoài)', nguoi: 'Nguyễn Nhật Hoàng', date: '', trangthai: 'Chưa bắt đầu', u: '', note: 'loại T1/sơ khảo T3/QG T4' },
      { id: 'e7', ten: 'Olympic Tin MT–Tây Nguyên (VKU)', loai: 'Cuộc thi (ngoài)', nguoi: 'Nguyễn Nhật Hoàng', date: '', trangthai: 'Chưa bắt đầu', u: '', note: 'tự luyện 28/2, CK 10–11/4 ĐN' },
      { id: 'e8', ten: 'HKISO / HKICO', loai: 'Cuộc thi (ngoài)', nguoi: 'Nguyễn Nhật Hoàng', date: '', trangthai: 'Chưa bắt đầu', u: '', note: '' },
      { id: 'e9', ten: 'Olympic Hóa học', loai: 'Cuộc thi (ngoài)', nguoi: 'Nguyễn Thị Lan Anh (H)', date: '', trangthai: 'Chưa bắt đầu', u: '', note: 'chọn đội tuyển T3' },
      { id: 'e10', ten: 'ASMOPSS', loai: 'Cuộc thi (ngoài)', nguoi: 'Ngô Hằng / Phương Thảo', date: '', trangthai: 'Chưa bắt đầu', u: '', note: '' },
      { id: 'e11', ten: 'Tin học trẻ – Thành đoàn', loai: 'Cuộc thi (ngoài)', nguoi: 'Nguyễn Nhật Hoàng', date: '', trangthai: 'Chưa bắt đầu', u: '', note: 'lập KH sớm!' },
      { id: 'e12', ten: 'IOAA-jr (Vật lí thiên văn)', loai: 'Cuộc thi (ngoài)', nguoi: '(phân công)', date: '', trangthai: 'Chưa bắt đầu', u: '', note: '' }
    ],
    giao: [
      { viec: 'Điều phối chung sự kiện / cuộc thi', nguoi: 'Nguyễn Thị Lan Anh (TPCM)', han: 'Cả năm', u: '' },
      { viec: 'Kiểm soát kế hoạch cuộc thi + tìm cuộc thi mới', nguoi: 'Dương Đức Hiếu', han: 'Cả năm', u: '' },
      { viec: 'Mảng Tin học & đội tuyển lập trình', nguoi: 'Nguyễn Nhật Hoàng', han: 'Cả năm', u: '' },
      { viec: 'Tổng hợp báo cáo tuần / tháng', nguoi: 'Dương Đức Hiếu', han: 'Tuần / Tháng', u: '' },
      { viec: 'Ngày hội STEM (chủ trì)', nguoi: 'Nguyễn Thị Kiều Anh', han: 'Tháng 3–4', u: '' },
      { viec: 'Chuyên đề & đề thi (kiểm soát)', nguoi: 'TTCM + nhóm CM', han: 'Theo lịch', u: '' },
      { viec: 'Đào tạo / buddy GV mới', nguoi: 'Các cặp buddy', han: 'Cả năm', u: '' },
      { viec: 'Nhập điểm nội bộ đúng hạn', nguoi: 'GVBM + phụ trách CSDL', han: 'Theo lịch điểm', u: '' }
    ],
    reports: [
      { id: 'rp1', ten: 'KHCN cá nhân (kế hoạch công việc)', nhip: 'Tuần', han: 'Thứ 6 · 23:59', ai: 'GVBM', u: '', loi: 'Không hoàn thành KHCN đúng hạn' },
      { id: 'rp2', ten: 'Lịch báo giảng (LBG)', nhip: 'Tuần', han: 'Thứ 6 · 23:59', ai: 'GVBM', u: '', loi: 'Nộp LBG muộn/sai phân phối CT' },
      { id: 'rp3', ten: 'Báo cáo tuần (BCT)', nhip: 'Tuần', han: 'Thứ 4 · 23:00', ai: 'GVBM', u: '', loi: 'Báo cáo tuần sai/thiếu/muộn' },
      { id: 'rp4', ten: 'Điểm danh tiết học (nề nếp)', nhip: 'Mỗi tiết', han: 'Ngay trong tiết', ai: 'GVBM', u: '', loi: 'Quên điểm danh tiết → lỗi nề nếp THCS' },
      { id: 'rp5', ten: 'Up bài & KTĐG Canvas', nhip: 'Tuần', han: 'Thứ 2 (trước 12h) / Thứ 4', ai: 'GVBM', u: '', loi: 'Up Canvas muộn/lỗi, chưa báo cáo' },
      { id: 'rp16', ten: 'Báo cáo Canvas (thống kê % hoàn thành)', nhip: 'Tuần', han: 'Thứ 4', ai: 'GVBM', u: '', loi: 'Chưa báo cáo Canvas / khai sai %' },
      { id: 'rp17', ten: 'Báo cáo LEAD 1:1 & LEAD-share (link riêng)', nhip: 'Tuần', han: 'Thứ 6', ai: 'GVBM', u: '', loi: 'Thiếu tiết LEAD / chưa báo cáo / khai vượt đăng kí' },
      { id: 'rp6', ten: 'Dự giờ + điền link minh chứng', nhip: 'Tuần', han: 'Theo định mức', ai: 'GVBM', u: '', loi: 'Dự thiếu tiết / quên điền link' },
      { id: 'rp7', ten: 'Báo cáo buddy (GV mới/trợ giảng)', nhip: 'Tuần', han: 'Thứ 6', ai: 'GV được HD + GVHD', u: '', loi: 'Thiếu báo cáo buddy tuần' },
      { id: 'rp18', ten: 'Điền báo cáo chấm vở (100% HS)', nhip: 'Tuần', han: 'Hàng tuần', ai: 'GVBM', u: '', loi: 'Chưa chấm / chưa điền báo cáo chấm vở' },
      { id: 'rp19', ten: 'KHBD / Giáo án (up folder)', nhip: 'Tuần', han: 'Trước Thứ 6 tuần trước', ai: 'GVBM', u: '', loi: 'Thiếu / nộp muộn KHBD, giáo án' },
      { id: 'rp20', ten: 'Đăng kí + báo cáo dạy thực hành (phòng TN)', nhip: 'Tuần', han: 'Thứ 6 tuần trước', ai: 'GV KHTN', u: '', loi: 'Không đăng kí / không báo cáo thực hành' },
      { id: 'rp21', ten: 'Điểm cộng văn minh (School Online)', nhip: 'Tuần', han: '1–2 điểm/tiết', ai: 'GVBM', u: '', loi: 'Không chấm điểm văn minh trong tiết' },
      { id: 'rp8', ten: 'Chấm vở theo đợt (đề cương)', nhip: 'Tháng', han: 'Theo đợt chấm', ai: 'GVBM', u: '', loi: 'Chưa chấm đủ 100% lớp/HS' },
      { id: 'rp9', ten: 'Báo cáo Like–Share (truyền thông)', nhip: 'Tháng', han: 'Hằng tháng', ai: 'GVBM', u: '', loi: 'Quên báo cáo like–share hàng tháng' },
      { id: 'rp10', ten: 'Đánh giá tháng buddy', nhip: 'Tháng', han: 'Cuối tháng', ai: 'GVHD', u: '', loi: 'Thiếu đánh giá tháng buddy' },
      { id: 'rp11', ten: 'Báo cáo học tập học sinh', nhip: 'Tháng', han: '12/2025; 4/2026', ai: 'GVBM', u: '', loi: 'Trả báo cáo học tập muộn' },
      { id: 'rp12', ten: 'Số tiết LEAD / LEAD-share đạt yêu cầu', nhip: 'Tháng', han: 'Theo chỉ tiêu', ai: 'GVBM', u: '', loi: 'Thiếu tiết LEAD so đăng ký' },
      { id: 'rp13', ten: 'Ra đề / phản biện đề đúng hạn', nhip: 'Theo lịch', han: 'Trước kỳ KT', ai: 'GV được phân', u: '', loi: 'Ra đề muộn/lỗi' },
      { id: 'rp14', ten: 'Chuyên đề đúng lịch đăng ký', nhip: 'Theo lịch', han: 'Tuần đã đăng ký', ai: 'GV thực hiện', u: '', loi: 'Thực hiện chuyên đề trễ lịch' },
      { id: 'rp15', ten: 'KPI vi phạm (tổng hợp)', nhip: 'Tháng', han: 'Đầu tháng sau', ai: 'TPCM', u: '', loi: '—' }
    ],
    linkCats: [
      { id: 'c1', name: '🏫 Link tổ nội bộ', items: [{ n: 'Kho tổ chuyên môn', u: '' }, { n: 'Link tiến độ giảng dạy', u: '' }, { n: 'Sổ SHCM / Biên bản họp tổ', u: '' }, { n: 'Bảng phân công chuyên môn (xương sống)', u: '' }, { n: 'Phân công up bài Canvas', u: '' }] },
      { id: 'c2', name: '📤 Báo cáo GV nộp lên tổ', items: [{ n: 'KHCN cá nhân', u: '' }, { n: 'Lịch báo giảng (LBG)', u: '' }, { n: 'Báo cáo tuần (BCT)', u: '' }, { n: 'Báo cáo buddy', u: '' }, { n: 'Chấm vở (theo lớp)', u: '' }, { n: 'Thống kê Canvas', u: '' }, { n: 'Đăng ký iPad / LEAD', u: '' }, { n: 'Dự giờ (điền link)', u: '' }] },
      { id: 'c3', name: '📈 Báo cáo tổ → BGH', items: [{ n: 'KH tháng – tuần TCM', u: '' }, { n: 'Báo cáo tuần TTCM', u: '' }, { n: 'KPI – theo dõi vi phạm', u: '' }, { n: 'Báo cáo học kì / tổng kết', u: '' }] },
      { id: 'c4', name: '🤝 Liên phòng ban', items: [{ n: 'Truyền thông – Marketing', u: '' }, { n: 'Hành chính (in ấn, CSVC, kho)', u: '' }, { n: 'CNTT / IT (iPad, âm thanh)', u: '' }, { n: 'LEAD – Báo tiết iPad A0/B0 (liên tổ, BGH khác phụ trách)', u: '' }, { n: 'Giáo vụ (TKB, coi thi)', u: '' }, { n: 'Kế toán (lệ phí, tờ trình)', u: '' }] },
      { id: 'c5', name: '🗂️ Kế hoạch & hồ sơ', items: [{ n: 'KHHĐ / OKR', u: '' }, { n: 'Kế hoạch chuyên đề', u: '' }, { n: 'Kế hoạch đào tạo nội bộ', u: '' }, { n: 'Kế hoạch kiểm tra nội bộ', u: '' }, { n: 'Kế hoạch lấy điểm nội bộ', u: '' }, { n: 'Kế hoạch các cuộc thi', u: '' }] },
      { id: 'c6', name: '📋 Nề nếp & báo lỗi', items: [{ n: 'Nề nếp THCS – báo lỗi điểm danh tiết học', u: '' }, { n: 'Báo cáo Like–Share hàng tháng', u: '' }, { n: 'Báo lỗi/quên báo cáo tuần', u: '' }, { n: 'Theo dõi vi phạm KPI', u: '' }] },
      { id: 'c7', name: '📝 Link đăng ký (điền dần)', items: [{ n: 'Đăng ký chuyên đề', u: '' }, { n: 'Đăng ký mượn iPad', u: '' }, { n: 'Đăng ký báo ăn', u: '' }, { n: 'Đăng ký phòng/CSVC', u: '' }, { n: 'Đăng ký dự giờ', u: '' }, { n: '(thêm link khi có)', u: '' }] }
    ],
    tracks: [
      { id: 't0', name: '🧾 Điền KH tuần (báo cáo tuần)', cadence: 'Tuần', rows: mkRows() },
      { id: 't1', name: '📓 Chấm vở', cadence: 'Tháng', rows: mkRows() },
      { id: 't2', name: '💻 Canvas', cadence: 'Tuần', rows: mkRows() },
      { id: 't3', name: '👥 Buddy / Đào tạo', cadence: 'Tháng', rows: mkRows(true) },
      { id: 't4', name: '📱 LEAD', cadence: 'Tuần', rows: mkRows() },
      { id: 't5', name: '👁️ Dự giờ', cadence: 'Tuần', rows: mkRows() }
    ],
    classAssign: CLASS_ASSIGN,
    bgh: [
      { id: 'b1', name: 'Báo cáo tuần TTCM gửi BGH', cadence: 'Tuần', due: 'Thứ 5 (giao ban)', status: 'Định kỳ', u: '' },
      { id: 'b2', name: 'KH tháng – tuần của TCM', cadence: 'Tháng', due: 'Ngày 25 tháng trước', status: 'Định kỳ', u: '' },
      { id: 'b3', name: 'KPI vi phạm tháng', cadence: 'Tháng', due: 'Đầu tháng sau', status: 'Định kỳ', u: '' },
      { id: 'b4', name: 'Báo cáo học kì / tổng kết', cadence: 'Học kì', due: 'Cuối HK', status: 'Chưa tới', u: '' }
    ],
    monthPlan: {
      thang: 'Tháng 7', namHoc: '2026-2027', link: '',
      sections: [
        {
          ten: 'I. CHUYÊN MÔN', items: [
            { v: 'Xây dựng kế hoạch (KH tháng + KH tuần)', m: 'GV xây dựng KH tuần cá nhân theo KH tháng của TTCM; TTCM xây dựng KH tháng của TCM.', han: 'KH tuần: Thứ 6 hàng tuần; KH tháng: 25 tháng trước', ns: 'TCM' },
            { v: 'Hồ sơ tổ CM', m: 'Upload HSSS Phòng GD (KHDH cả năm PL1, PL2, PL3); hoàn thành HSSS cá nhân (giáo án, LBG theo TKB nội bộ); xây KHDH nội bộ các môn.', han: '31/7', ns: 'TCM' },
            { v: 'Hồ sơ cá nhân GV', m: 'Hoàn thiện HSSS cá nhân trước thứ 6 tuần liền trước: KHBD + Báo giảng + KHCN tuần.', han: 'Thứ 6 hàng tuần', ns: 'GVBM' },
            { v: 'Sinh hoạt chuyên môn', m: 'SHCM 16h15 thứ 4; TTCM giao ban BGH chiều thứ 5.', han: 'Thứ 4 / Thứ 5 hàng tuần', ns: 'TCM' },
            { v: 'Triển khai dạy học chương trình hè', m: 'Lên lớp theo TKB; ghi rõ số tiết mất kèm lí do và KH dạy bù/ghép.', han: 'Hàng tuần', ns: 'GVBM' },
            { v: 'Chuyên / Đội tuyển HSG', m: 'Soạn phiếu chuyên, dạy chuyên & ĐT HSG 9 (T3–6); chấm 100% BTVN, báo cáo tình hình; thông báo PHHS lớp chuyên theo tuần.', han: 'Hàng tuần', ns: 'GV chuyên' },
            { v: 'Đội tuyển Khoa học tiếng Anh (KHTN)', m: 'Ôn bồi dưỡng 2 buổi/tuần; phiếu bài up kho thứ 6 trước 2 tuần; điểm danh, báo cáo sau mỗi buổi.', han: 'Hàng tuần', ns: 'Ngô Hằng, Minh Đức' },
            { v: 'Khóa tự học Canvas – Science, Math', m: 'Xây dựng khóa tự học khối 6,7; cập nhật tiến độ hàng tuần.', han: '28/7', ns: 'Ngô Hằng, Phương Thảo' },
            { v: 'Khóa tự học Canvas – ôn cuộc thi Tin học, KHTN', m: 'Xây dựng khóa tự ôn luyện đội tuyển Tin học, KHTN.', han: '28/7', ns: 'Nhật Hoàng, GV KHTN' },
            { v: 'Tin chuyên Khối 8', m: 'Xây dựng chương trình, giáo án, PHT; báo cáo tiến độ; dự giờ trao đổi chuyên môn.', han: '28/7', ns: 'Nhật Hoàng' },
            { v: 'Đội tuyển IMSO Khoa học (K5 lên 6)', m: 'Ôn bồi dưỡng 3 buổi/tuần; phiếu bài up kho thứ 6 trước 2 tuần; điểm danh, báo cáo.', han: 'Hàng tuần', ns: 'Ngô Hằng, Minh Đức, Lan Anh (L)' },
            { v: 'Khảo thí – KTĐG hàng tuần trên Canvas', m: 'Hoàn thành trước 12h00 thứ 2 hàng tuần.', han: 'Hàng tuần', ns: 'TCM' },
            { v: 'Kiểm tra vở / chấm chữa bài', m: 'Chấm vở 100% học sinh; điền báo cáo chấm vở tại link.', han: 'Hàng tuần', ns: 'GVBM' },
            { v: 'Thi Khảo sát chuyên 8, 9 (tháng 7)', m: 'Nộp đề, HDC, ma trận chuyên 8, 9.', han: '10/7', ns: 'GV chuyên' },
            { v: 'Hoàn thành HSSS và nhập điểm', m: 'Hoàn thành HSSS học sinh lớp 9; nhập điểm khối 6,7,8.', han: '31/7', ns: 'TCM' },
            { v: 'Báo cáo sau KT HKII & phương án hỗ trợ', m: 'Mẫu báo cáo học tập cuối HKII 6,7,8; đánh giá kết quả; TTCM hoàn thành báo cáo sau kiểm tra HK.', han: '', ns: 'TCM / TTCM' },
            { v: 'Số hóa – giao & chấm bài trên Canvas', m: 'Giao BT trực tiếp; up giáo án/PPT/PHT hàng tuần; xây khóa học gốc.', han: 'Hàng tuần', ns: 'TCM' },
            { v: 'Bài tập Canvas (gắn outcome)', m: '2 phiếu KHTN/tháng/khối; 2 phiếu Science, Math/tháng/khối.', han: 'Hàng tuần', ns: 'GVBM' },
            { v: 'Báo cáo dự án LEAD / LEAD-share', m: 'Số tiết LEAD trong tuần + vấn đề gặp phải; LEAD-share ghi rõ lý do chưa thực hiện.', han: 'Hàng tuần', ns: 'GVBM' },
            { v: 'Chấm điểm văn minh trên School Online', m: 'Tối thiểu 1–2 điểm cộng văn minh/tiết; điểm trừ theo tình hình lớp.', han: 'Hàng tuần', ns: 'GVBM' },
            { v: 'Xây hệ thống khóa học 26-27 trên Canvas', m: 'Hoàn thành 31/7/2026.', han: '31/7', ns: 'TCM' },
            { v: 'Bồi dưỡng cuộc thi WYCTO/WYCPO', m: 'Lập nhóm zalo, giao bài tự luyện; đôn đốc HS ôn luyện.', han: '31/7', ns: 'Cô Lan Anh (H) + nhóm Hóa' }
          ]
        },
        {
          ten: 'II. ĐÀO TẠO ĐỘI NGŨ & CHUYÊN ĐỀ', items: [
            { v: 'Dự giờ / buddy GV', m: 'GV cứng-cũ 2 tiết/tháng; GV mới-trẻ 2 tiết/tuần; báo cáo dự giờ trong 24h; báo cáo buddy.', han: 'Hàng tuần', ns: 'TCM' },
            { v: 'Nâng số lượng GV vượt chuẩn', m: '04 GV học thạc sỹ theo lịch: Ánh Sao, Phương Thảo, Minh Đức, Trần Thảo.', han: '31/7', ns: 'Ánh Sao, Phương Thảo, Minh Đức, Trần Thảo' },
            { v: 'Tham gia đào tạo do nhà trường tổ chức', m: '', han: '31/7', ns: 'TCM' },
            { v: 'Soạn giáo án STEM, thực hành', m: '', han: '', ns: 'GV KHTN' },
            { v: 'Chuyên đề', m: 'Đăng kí chuyên đề năm học 26-27 (từ tháng 8/26 đến tháng 2/27).', han: '', ns: 'TCM' },
            { v: 'Giáo viên sáng tạo tài năng (GVST)', m: 'Hoàn thiện hồ sơ báo cáo chung kết.', han: '25/5', ns: 'Nhóm cô Linh, cô Hằng' },
            { v: 'Chương trình dạy học thực hành 26-27', m: 'Cập nhật, điều chỉnh, hoàn thiện chương trình dạy học thực hành.', han: '28/7', ns: 'Ánh Sao, Thùy Linh' },
            { v: 'Quản lí phòng thí nghiệm', m: 'Triển khai đăng kí sử dụng; sắp xếp, kiểm kê đồ dùng phòng TN.', han: '', ns: 'Ánh Sao, Thùy Linh' },
            { v: 'Đăng kí lịch dạy thực hành', m: 'Ghi rõ tiết/ngày/lớp; đăng kí phòng TN trên link (hạn thứ 6 tuần trước); báo cáo dạy thực hành.', han: 'Hàng tuần', ns: 'GV KHTN' },
            { v: 'Kế hoạch kiểm tra thực hành KHTN', m: 'TT/TP xây KH KT thực hành khối 6,7,8; phân công ra đề; ma trận, rubric, đề, HDC.', han: 'Tháng 11', ns: 'TT/TP + GV KHTN' },
            { v: 'Tổ chức kiểm tra thực hành', m: 'Họp triển khai, tập huấn GV coi KT; tổ chức; họp rút kinh nghiệm.', han: 'Tháng 11', ns: 'GV KHTN' }
          ]
        },
        {
          ten: 'III. CÔNG TÁC CHỦ NHIỆM', items: [
            { v: 'Sổ chủ nhiệm', m: 'Hoàn thành: thông tin chung + cập nhật TT tháng + kế hoạch tháng.', han: '31/7', ns: 'GVCN HC' },
            { v: 'Giáo án KNS', m: 'Up giáo án KNS lên folder trước thứ 6 tuần liền trước.', han: 'Hàng tuần', ns: 'GVCN HC' },
            { v: 'Công tác chung của GVCN', m: 'Truy bài; hỗ trợ bán trú (ăn trưa); thông tin nhóm CMHS.', han: 'Hàng tuần', ns: 'GVCN HC' }
          ]
        }
      ]
    },
    // DEMO: dữ liệu mẫu Tuần 1 Tháng 7 (2026-2027) để kiểm tra hiển thị — xóa bằng "Về mặc định" khi chạy thật
    snaps: {
      '2026-2027|Tuần|Tuần 1 · Tháng 7': {
        t0: {
          r1: { status: 'Đã báo cáo', note: '' }, r2: { status: 'Đã báo cáo', note: '' },
          r10: { status: 'Thiếu', note: 'thiếu mục chủ nhiệm' }, r12: { status: 'Chưa', note: '' },
          r14: { status: 'Đã báo cáo', note: '' }
        },
        t2: { r1: { status: 'Đã báo cáo', note: '96%' }, r12: { status: 'Cờ đỏ', note: 'khai 11 lớp, log IT 10' } },
        cls: {
          canvas: {
            '6A01': { st: 'Đã điền', note: '', pct: 96 }, '6A03': { st: 'Đã điền', note: '', pct: 88 },
            '7A04': { st: 'Chưa điền', note: '', pct: '' }, '8B04': { st: 'Điền thiếu/sai', note: 'thiếu outcome', pct: 71 }
          },
          vo: { '6A01': { st: 'Đã điền', note: '' }, '8B04': { st: 'Điền thiếu/sai', note: 'thiếu đề cương' } }
        },
        num: {
          lead: { r1: { dk: 4, th: 4, dks: 2, ths: 1 }, r12: { dk: 10, th: 11, dks: 0, ths: 0 } },
          dugio: { r1: { dk: 2, th: 2, lk: 2 }, r3: { dk: 2, th: 1, lk: 0 } }
        }
      },
      '2026-2027|Tháng|Tháng 7': {
        mon: {
          '6A01|KHTN': { st: 'Đã chấm', note: '' }, '6A03|KHTN': { st: 'Đã chấm', note: '' },
          '6B01|KHTN': { st: 'Chấm thiếu', note: 'thiếu 3 HS' }, '7A04|KHTN': { st: 'Chưa chấm', note: '' }
        }
      }
    }
  }
}

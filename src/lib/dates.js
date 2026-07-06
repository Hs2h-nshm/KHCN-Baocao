// Tiện ích ngày tháng + mức khẩn deadline
export const WD = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

export const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }

export function isoWeek(dd) {
  const t = new Date(dd); t.setHours(0, 0, 0, 0)
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7))
  const w1 = new Date(t.getFullYear(), 0, 4)
  return 1 + Math.round(((t - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7)
}

export function nextDow(dow) {
  const d = today(); const diff = (dow - d.getDay() + 7) % 7
  d.setDate(d.getDate() + diff); return d
}

export const daysTo = (d) => Math.round((d - today()) / 86400000)

export function urgClass(n) {
  if (n <= 1) return 'bad'
  if (n <= 2) return 'warn'
  if (n <= 7) return 'yellow'
  return 'good'
}
export function urgText(n) {
  if (n < 0) return 'Quá hạn ' + (-n) + 'n'
  if (n === 0) return 'HÔM NAY'
  if (n === 1) return 'NGÀY MAI'
  return 'còn ' + n + ' ngày'
}
export function fmtVN(d) { return d.toLocaleDateString('vi-VN') }

// Năm học hiện tại theo mốc tháng 8 (>= tháng 8 => năm học mới)
export function currentNamHoc() {
  const d = new Date(); const y = d.getFullYear()
  return d.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

// Năm dương lịch của một tháng trong năm học (T8-12 = năm đầu; T1-7 = năm sau)
export function yearOfMonth(namHoc, month) {
  const [a, b] = String(namHoc).split('-').map(Number)
  return month >= 8 ? a : (b || a)
}

const pad = (n) => String(n).padStart(2, '0')
// Các tuần (Thứ 2 - Chủ nhật) chạm vào một tháng; Tuần 1 = tuần chứa ngày 1.
export function weeksOfMonth(year, month) {
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  // Thứ 2 của tuần chứa ngày 1
  const mon1 = new Date(first); mon1.setDate(first.getDate() - ((first.getDay() + 6) % 7))
  const weeks = []
  let cur = new Date(mon1)
  while (cur <= last) {
    const from = new Date(cur)
    const to = new Date(cur); to.setDate(to.getDate() + 6)
    weeks.push({
      from, to,
      range: `${pad(from.getDate())}/${pad(from.getMonth() + 1)}–${pad(to.getDate())}/${pad(to.getMonth() + 1)}`
    })
    cur.setDate(cur.getDate() + 7)
  }
  return weeks
}

import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, Btn, Mini, Empty, toast, TabTitle } from '../components/ui.jsx'
import { urgText } from '../lib/dates.js'
import PeriodBar from '../components/PeriodBar.jsx'

function reminderLine(n) {
  if (n < 0) return 'Lần 3 · QUÁ HẠN · gửi BGH·TTCM·TPCM·GV'
  if (n <= 1) return 'Lần 2 · sát hạn · gửi TTCM·TPCM·GV'
  return 'Lần 1 · nhắc trước · gửi TPCM·GV'
}

export default function BghTab() {
  const { S, set, isAdmin, getSt, getCls, getMon, getNum, allDeadlines, conflicts, GOOD, NOTYET } = useStore()

  const report = () => {
    const d = new Date()
    let t = `BÁO CÁO NHANH TỔ KHCN – THCS\nNăm học ${S.namHoc} · Kỳ: ${S.periodMode} ${S.periodValue} · Ngày lập: ${d.toLocaleDateString('vi-VN')}\n\n`
    t += '1) DEADLINE SẮP TỚI (trong 0–7 ngày):\n'
    const dlAll = allDeadlines().filter(x => x.when)
    const dl = dlAll.filter(x => x.n >= 0 && x.n <= 7)
    t += (dl.length ? dl.map(x => `   - ${x.name} (${x.label}, ${urgText(x.n)})`).join('\n') : '   - (không có)') + '\n'
    const overdue = dlAll.filter(x => x.n < 0)
    if (overdue.length) t += '   ⚠️ QUÁ HẠN cần xử lý:\n' + overdue.map(x => `      · ${x.name} (${x.label}, ${urgText(x.n)})`).join('\n') + '\n'
    t += '\n'
    t += `2) TRẠNG THÁI BÁO CÁO (đủ/tổng) – ${S.periodValue}:\n`
    S.tracks.forEach(tr => { const g = tr.rows.filter(r => GOOD.includes(getSt(tr.id, r.id).status)).length; t += `   - ${tr.name}: ${g}/${tr.rows.length}\n` })
    // 2b) Số liệu tổng hợp toàn tổ — BGH nắm số lượng mọi chỉ số
    const n0 = (v) => (v === '' || v === undefined || v === null) ? 0 : +v
    const rids = (S.tracks.find(x => x.id === 't0')?.rows || []).map(r => r.id)
    const sum = (kind, k) => rids.reduce((s, rid) => s + n0(getNum(kind, rid)[k]), 0)
    const asg = S.assign || []
    const asgReal = asg.filter(a => a.gv !== 'Chưa phân công') // mẫu số chỉ tính lớp ĐÃ phân công
    const kh0 = asgReal.filter(a => a.mon === 'KHTN').map(a => ({ lop: a.lop, gv: a.gv }))
    const lops = kh0.length ? kh0 : (S.classAssign || [])
    const unassigned = asg.filter(a => a.gv === 'Chưa phân công' && a.mon === 'KHTN').map(a => a.lop)
    const cvD = lops.filter(a => getCls('canvas', a.lop).st === 'Đã điền').length
    const pcts = lops.map(a => n0(getCls('canvas', a.lop).pct)).filter(x => x > 0)
    const cvPct = pcts.length ? Math.round(pcts.reduce((s, x) => s + x, 0) / pcts.length) : null
    const voD = asgReal.filter(a => getMon(a.lop, a.mon).st === 'Đã chấm').length
    const la = S.leadA0B0 || { rows: [] }
    const laBC = (la.rows || []).reduce((s, r) => s + (r.tuanBC || 0), 0)
    const laT = (la.rows || []).reduce((s, r) => s + (r.tuanTong || 0), 0)
    t += '\n2b) SỐ LIỆU TỔNG HỢP TOÀN TỔ:\n'
    t += `   - Canvas theo lớp: ${cvD}/${lops.length} lớp đã điền${cvPct !== null ? ` · TB % các lớp có log: ${cvPct}%` : ''}\n`
    t += `   - Chấm vở Lớp×Môn (kỳ Tháng): ${voD}/${asgReal.length} lớp·môn đã chấm\n`
    if (unassigned.length) t += `   - ⚠️ Lớp CHƯA phân công KHTN: ${unassigned.length} lớp (${unassigned.join(', ')}) — chưa có người chịu trách nhiệm\n`
    t += `   - LEAD 1:1: thực ${sum('lead', 'th')}/${sum('lead', 'dk')} tiết ĐK · LEAD-share: ${sum('lead', 'ths')}/${sum('lead', 'dks')}\n`
    t += `   - Dự giờ: thực dự ${sum('dugio', 'th')}/${sum('dugio', 'dk')} tiết ĐK · link minh chứng đã điền: ${sum('dugio', 'lk')}/${sum('dugio', 'th')}\n`
    t += `   - LEAD A0/B0 (nguồn liên tổ): ${laBC}/${laT} tuần·GV đã báo cáo\n`
    t += '\n3) CHƯA / THIẾU BÁO CÁO:\n'; let any = false
    S.tracks.forEach(tr => { const bad = tr.rows.filter(r => NOTYET.includes(getSt(tr.id, r.id).status)); if (bad.length) { any = true; const nm = bad.slice(0, 6).map(r => r.who).join(', '); t += `   • ${tr.name}: ${bad.length} GV${bad.length > 6 ? ` (vd: ${nm}…)` : ` — ${nm}`}\n` } })
    if (!any) t += '   - (tất cả đã báo cáo)\n'
    const conf = conflicts()
    if (conf.length) { t += '\n⚠️ XUNG ĐỘT “đã xong” (cần chốt lại):\n'; conf.forEach(c => { t += `   - ${c.mang === 'canvas' ? 'Canvas' : 'Vở'} ${c.lop} (${c.gv}): ${c.c.st}\n` }) }
    // 3b) CỜ ĐỎ / CẦN ĐỐI CHIẾU — số khai lệch số thật (track "Cờ đỏ" + LEAD vượt ĐK + dự giờ thiếu link)
    const t0rows = S.tracks.find(x => x.id === 't0')?.rows || []
    const reds = []
    S.tracks.forEach(tr => tr.rows.forEach(r => { const c = getSt(tr.id, r.id); if (c.status === 'Cờ đỏ') reds.push(`${tr.name} · ${r.who}${c.note ? ' (' + c.note + ')' : ''}`) }))
    t0rows.forEach(r => { const v = getNum('lead', r.id); if ((v.dk !== '' || v.th !== '') && (n0(v.th) > n0(v.dk) || n0(v.ths) > n0(v.dks))) reds.push(`LEAD vượt đăng kí · ${r.who} (thực ${n0(v.th)}/${n0(v.dk)})`) })
    t0rows.forEach(r => { const v = getNum('dugio', r.id); if (n0(v.lk) < n0(v.th)) reds.push(`Dự giờ thiếu link · ${r.who} (${n0(v.lk)}/${n0(v.th)} link)`) })
    t += '\n3b) CỜ ĐỎ / CẦN ĐỐI CHIẾU:\n' + (reds.length ? reds.map(x => `   🚩 ${x}`).join('\n') + '\n' : '   - (không có)\n')
    t += '\n4) SỰ KIỆN / CUỘC THI:\n'; S.events.forEach(e => { t += `   - ${e.ten} [${e.trangthai}]${e.nguoi ? ' – ' + e.nguoi : ''}${e.date ? ' – ' + new Date(e.date + 'T00:00:00').toLocaleDateString('vi-VN') : ''}\n` })
    t += '\n5) KẾ HOẠCH BÁO CÁO BGH:\n'; S.bgh.forEach(b => { t += `   - ${b.name} [${b.status}] – ${b.due}\n` })
    const rem = allDeadlines().filter(x => x.when && x.n <= 3)
    if (rem.length) { t += '\n🔔 CẦN NHẮC:\n'; rem.forEach(x => { t += `   - ${x.name} (${x.label}) · ${reminderLine(x.n)}\n` }) }
    if (S.meetingNotes && S.meetingNotes.trim()) t += '\n6) GHI CHÚ:\n' + S.meetingNotes + '\n'
    return t
  }

  const txt = report()
  const doCopy = () => { if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(() => toast('Đã copy báo cáo')).catch(() => window.prompt('Copy:', txt)); else window.prompt('Copy:', txt) }
  const doDownload = () => { const b = new Blob([txt], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `bao_cao_KHCN_${S.periodValue.replace(/\s/g, '_')}.txt`; a.click() }

  const setBgh = (i, k, v) => set(n => { n.bgh[i][k] = v })
  const editLink = (i) => { const u = window.prompt('Link báo cáo:', S.bgh[i].u); if (u === null) return; set(n => { n.bgh[i].u = u.trim() }) }
  const add = () => { const nm = window.prompt('Nội dung báo cáo:'); if (!nm) return; set(n => n.bgh.push({ id: 'b' + Date.now(), name: nm, cadence: 'Tháng', due: '', status: 'Định kỳ', u: '' })) }
  const del = (i) => set(n => { n.bgh.splice(i, 1) })

  return (
    <div>
      <TabTitle id="bgh">Báo cáo BGH</TabTitle>
      <PeriodBar />
      <div className="flex gap-2 mb-3 flex-wrap no-print">
        {isAdmin && <Btn onClick={add}>+ Thêm mục</Btn>}
        <Btn onClick={doCopy}>📤 Xuất báo cáo (copy)</Btn>
        <Btn onClick={doDownload}>⬇️ Tải .txt theo mẫu</Btn>
      </div>
      <Card>
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Nội dung</th><th className="p-2 border-b border-line">Nhịp</th><th className="p-2 border-b border-line">Hạn</th><th className="p-2 border-b border-line">Trạng thái</th><th className="p-2 border-b border-line">Link</th>{isAdmin && <th className="p-2 border-b border-line"></th>}</tr></thead>
          <tbody>
            {S.bgh.map((b, i) => (
              <tr key={b.id}>
                <td className="p-2 border-b border-line">{b.name}</td>
                <td className="p-2 border-b border-line">{b.cadence}</td>
                <td className="p-2 border-b border-line">{b.due}</td>
                <td className="p-2 border-b border-line"><select disabled={!isAdmin} value={b.status} onChange={e => setBgh(i, 'status', e.target.value)} className="bg-bg text-ink border border-line rounded-md px-2 py-0.5 text-[13px]">{['Định kỳ', 'Đang làm', 'Xong', 'Chưa tới', 'Trễ'].map(o => <option key={o}>{o}</option>)}</select></td>
                <td className="p-2 border-b border-line whitespace-nowrap">{b.u ? <a className="text-brand" href={b.u} target="_blank" rel="noreferrer">mở</a> : <Empty>—</Empty>} {isAdmin && <Mini onClick={() => editLink(i)}>✏️</Mini>}</td>
                {isAdmin && <td className="p-2 border-b border-line"><Mini onClick={() => del(i)}>✕</Mini></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <H3>Xem trước báo cáo (theo mẫu)</H3>
        <pre className="whitespace-pre-wrap text-[13px] m-0">{txt}</pre>
      </Card>
    </div>
  )
}

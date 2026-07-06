import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, Pill, Mini, Btn, TabTitle } from '../components/ui.jsx'
import { EV_ST } from '../data/seed.js'
import { daysTo, urgClass, urgText } from '../lib/dates.js'

export default function EventsTab() {
  const { S, set, isAdmin } = useStore()
  const setSt = (i, v) => set(n => { n.events[i].trangthai = v })
  const editLink = (i) => { const u = window.prompt('Link kế hoạch/theo dõi cuộc thi:', S.events[i].u || ''); if (u === null) return; set(n => { n.events[i].u = u.trim() }) }
  const edit = (i) => { const e = S.events[i]; const t = window.prompt('Tên:', e.ten); if (t === null) return; const l = window.prompt('Loại:', e.loai || ''); if (l === null) return; const ng = window.prompt('Người phụ trách:', e.nguoi || ''); if (ng === null) return; const d = window.prompt('Ngày (YYYY-MM-DD):', e.date || ''); if (d === null) return; const no = window.prompt('Ghi chú:', e.note || ''); if (no === null) return; set(n => { n.events[i] = { ...n.events[i], ten: t, loai: l, nguoi: ng, date: d.trim(), note: no } }) }
  const add = () => { const t = window.prompt('Tên sự kiện/cuộc thi:'); if (!t) return; const l = window.prompt('Loại (Cuộc thi/Sự kiện):', 'Cuộc thi (ngoài)') || ''; const ng = window.prompt('Người phụ trách:', '') || ''; const d = window.prompt('Ngày (YYYY-MM-DD), để trống nếu chưa rõ:', '') || ''; set(n => n.events.push({ id: 'e' + Date.now(), ten: t, loai: l, nguoi: ng, date: d.trim(), trangthai: 'Chưa bắt đầu', u: '', note: '' })) }
  const del = (i) => set(n => { n.events.splice(i, 1) })

  return (
    <div>
      <TabTitle id="events">🏆 Sự kiện &amp; Cuộc thi (theo dõi riêng)</TabTitle>
      {isAdmin && <div className="mb-3 no-print"><Btn onClick={add}>+ Thêm sự kiện / cuộc thi</Btn></div>}
      <Card>
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Sự kiện / Cuộc thi</th><th className="p-2 border-b border-line">Người phụ trách</th><th className="p-2 border-b border-line">Mốc / Đếm ngược</th><th className="p-2 border-b border-line">Trạng thái</th><th className="p-2 border-b border-line"></th></tr></thead>
          <tbody>
            {S.events.map((e, i) => {
              const n = e.date ? daysTo(new Date(e.date + 'T00:00:00')) : null
              return (
                <tr key={e.id}>
                  <td className="p-2 border-b border-line">{e.u ? <a className="text-brand hover:underline" href={e.u} target="_blank" rel="noreferrer">{e.ten} 🔗</a> : e.ten}<div className="text-xs text-muted">{e.loai}{e.note ? ' · ' + e.note : ''}</div></td>
                  <td className="p-2 border-b border-line">{e.nguoi}</td>
                  <td className="p-2 border-b border-line">{e.date ? new Date(e.date + 'T00:00:00').toLocaleDateString('vi-VN') : <span className="text-muted text-xs">chưa đặt</span>} {n !== null && <Pill tone={urgClass(n)}>{urgText(n)}</Pill>}</td>
                  <td className="p-2 border-b border-line"><select disabled={!isAdmin} value={e.trangthai} onChange={ev => setSt(i, ev.target.value)} className="bg-bg text-ink border border-line rounded-md px-2 py-0.5 text-[13px] disabled:opacity-60">{EV_ST.map(o => <option key={o}>{o}</option>)}</select></td>
                  <td className="p-2 border-b border-line whitespace-nowrap">{isAdmin && <><Mini onClick={() => editLink(i)}>✏️🔗</Mini> <Mini onClick={() => edit(i)}>✏️</Mini> <Mini onClick={() => del(i)}>✕</Mini></>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

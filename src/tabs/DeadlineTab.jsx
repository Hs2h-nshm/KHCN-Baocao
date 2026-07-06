import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, Pill, Mini, Btn, Empty, TabTitle } from '../components/ui.jsx'
import { urgClass, urgText, WD } from '../lib/dates.js'

export default function DeadlineTab() {
  const { S, set, isAdmin, allDeadlines } = useStore()
  const items = allDeadlines()

  const editLink = (src, id) => {
    const arr = src === 'w' ? S.weekly : src === 'e' ? S.events : S.deadlines
    const it = arr.find(x => x.id === id); if (!it) return
    const u = window.prompt('Dán link để bấm vào báo cáo/xem:', it.u || ''); if (u === null) return
    set(n => { (src === 'w' ? n.weekly : src === 'e' ? n.events : n.deadlines).find(x => x.id === id).u = u.trim() })
  }
  const addD = () => {
    const name = window.prompt('Tên mốc:'); if (!name) return
    const date = window.prompt('Ngày (YYYY-MM-DD), để trống nếu chưa rõ:', '') || ''
    const note = window.prompt('Ghi chú:', '') || ''
    const u = window.prompt('Link (tùy chọn):', '') || ''
    set(n => n.deadlines.push({ id: 'd' + Date.now(), name, date: date.trim(), note, u: u.trim() }))
  }
  const delD = (id) => set(n => { n.deadlines = n.deadlines.filter(x => x.id !== id) })
  const setW = (id, k, v) => set(n => { const w = n.weekly.find(x => x.id === id); w[k] = k === 'dow' ? +v : v })
  const delW = (id) => set(n => { n.weekly = n.weekly.filter(x => x.id !== id) })

  return (
    <div>
      <TabTitle id="deadline">Lịch &amp; Deadline</TabTitle>
      <div className="text-sm text-muted mb-2.5"><Pill tone="bad">đỏ</Pill> ≤1 ngày/quá hạn · <Pill tone="warn">cam</Pill> ≤2 ngày · <Pill tone="yellow">vàng</Pill> ≤7 ngày.</div>
      {isAdmin && <div className="mb-3 no-print"><Btn onClick={addD}>+ Thêm mốc</Btn></div>}

      <Card>
        <H3>Sắp tới (gồm cả sự kiện/cuộc thi có ngày)</H3>
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Việc</th><th className="p-2 border-b border-line">Loại</th><th className="p-2 border-b border-line">Khi nào</th><th className="p-2 border-b border-line">Còn</th><th className="p-2 border-b border-line">Link</th></tr></thead>
          <tbody>
            {items.map((x, i) => (
              <tr key={i}>
                <td className="p-2 border-b border-line">{x.u ? <a className="text-brand hover:underline" href={x.u} target="_blank" rel="noreferrer">{x.name} 🔗</a> : x.name}{x.note && <div className="text-xs text-muted">{x.note}</div>}</td>
                <td className="p-2 border-b border-line"><span className="text-[11px] text-muted border border-line px-1.5 py-0.5 rounded-md">{x.kind}</span></td>
                <td className="p-2 border-b border-line">{x.label}</td>
                <td className="p-2 border-b border-line">{x.when ? <Pill tone={urgClass(x.n)}>{urgText(x.n)}</Pill> : <span className="text-muted text-sm">—</span>}</td>
                <td className="p-2 border-b border-line whitespace-nowrap">
                  {x.u ? <a className="text-brand" href={x.u} target="_blank" rel="noreferrer">Mở</a> : <Empty />}{' '}
                  {isAdmin && <><Mini onClick={() => editLink(x.src, x.id)}>✏️🔗</Mini>{' '}</>}
                  {isAdmin && x.src === 'd' && <Mini onClick={() => delD(x.id)}>✕</Mini>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {isAdmin && (
        <Card>
          <H3>⚙️ Việc lặp hằng tuần</H3>
          <table className="w-full text-sm border-collapse">
            <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Việc</th><th className="p-2 border-b border-line">Thứ</th><th className="p-2 border-b border-line">Giờ</th><th className="p-2 border-b border-line">Bật</th><th className="p-2 border-b border-line">Link</th></tr></thead>
            <tbody>
              {S.weekly.map(w => (
                <tr key={w.id}>
                  <td className="p-2 border-b border-line">{w.u ? <a className="text-brand hover:underline" href={w.u} target="_blank" rel="noreferrer">{w.name} 🔗</a> : w.name}</td>
                  <td className="p-2 border-b border-line"><select value={w.dow} onChange={e => setW(w.id, 'dow', e.target.value)} className="bg-bg text-ink border border-line rounded-md px-1 py-0.5 text-[13px]">{WD.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></td>
                  <td className="p-2 border-b border-line"><input value={w.time} onChange={e => setW(w.id, 'time', e.target.value)} className="w-20 bg-bg text-ink border border-line rounded-md px-1.5 py-0.5 text-[13px]" /></td>
                  <td className="p-2 border-b border-line"><input type="checkbox" checked={w.on} onChange={e => setW(w.id, 'on', e.target.checked)} /></td>
                  <td className="p-2 border-b border-line whitespace-nowrap"><Mini onClick={() => editLink('w', w.id)}>✏️🔗</Mini> <Mini onClick={() => delW(w.id)}>✕</Mini></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

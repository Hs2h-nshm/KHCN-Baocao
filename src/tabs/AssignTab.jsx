import React, { useState } from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, KPI, Badge, Mini, Btn, toast, TabTitle } from '../components/ui.jsx'
import { TEACHERS } from '../data/seed.js'

// Phân công Lớp × Môn × GV — "xương sống" của mọi bảng tổng hợp (chấm vở, Canvas, KPI).
// Mở rộng được: thêm môn mới, thêm lớp mới, đổi GV — các tab khác tự ăn theo.
export default function AssignTab() {
  const { S, set, isAdmin, me, gvFilter } = useStore()
  const [filterMon, setFilterMon] = useState('(tất cả)')
  const [filterGv, setFilterGv] = useState(gvFilter || '(tất cả)')

  const assign = S.assign || []
  const mons = [...new Set([...(S.subjects || []), ...assign.map(a => a.mon)])]
  const gvs = [...new Set(assign.map(a => a.gv))].sort()
  const list = assign.filter(a =>
    (filterMon === '(tất cả)' || a.mon === filterMon) &&
    (filterGv === '(tất cả)' || a.gv === filterGv))

  const addRow = () => {
    const lop = window.prompt('Mã lớp (vd 6A01):'); if (!lop) return
    const mon = window.prompt(`Môn (${mons.join(' / ')}):`, mons[0]) || mons[0]
    const gv = window.prompt('GV phụ trách (đúng tên trong roster):', TEACHERS[0]) || ''
    if (!gv) return
    if (assign.some(a => a.lop === lop.trim() && a.mon === mon.trim())) { toast('Đã có phân công lớp+môn này'); return }
    set(n => n.assign.push({ lop: lop.trim(), mon: mon.trim(), gv: gv.trim() }))
  }
  const addMon = () => {
    const m = window.prompt('Tên môn mới (vd Công nghệ):'); if (!m) return
    set(n => { if (!n.subjects.includes(m.trim())) n.subjects.push(m.trim()) })
  }
  const setGv = (a, gv) => set(n => { const x = n.assign.find(y => y.lop === a.lop && y.mon === a.mon); if (x) x.gv = gv })
  const del = (a) => set(n => { n.assign = n.assign.filter(y => !(y.lop === a.lop && y.mon === a.mon)) })

  // Tổng hợp GV → số lớp theo môn (BGH nhìn tải việc)
  const gvSummary = gvs.map(gv => {
    const mine = assign.filter(a => a.gv === gv)
    const byMon = {}
    mine.forEach(a => { byMon[a.mon] = (byMon[a.mon] || 0) + 1 })
    return { gv, total: mine.length, byMon, lops: mine.map(a => a.lop) }
  }).sort((a, b) => b.total - a.total)

  return (
    <div>
      <TabTitle id="assign">🧩 Phân công chuyên môn (xương sống)</TabTitle>
      <div className="text-sm text-muted mb-2.5">GV nào dạy <b>lớp nào · môn nào</b> — mọi bảng tổng hợp (Chấm vở, Canvas, KPI) join với bảng này. {isAdmin ? 'Sửa tại đây, các tab khác tự cập nhật.' : 'Liên hệ TPCM nếu sai phân công.'}</div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
        <KPI color="#3da9fc" n={assign.length} l="Dòng phân công (lớp·môn)" />
        <KPI color="#37b24d" n={[...new Set(assign.map(a => a.lop))].length} l="Lớp" />
        <KPI color="#f59e0b" n={mons.length} l="Môn" />
        <KPI color="#8b5cf6" n={gvs.length} l="GV có phân công" />
      </div>

      <div className="flex gap-2 mb-3 flex-wrap no-print items-center">
        {isAdmin && <><Btn onClick={addRow}>+ Thêm phân công</Btn><Btn onClick={addMon}>+ Thêm môn</Btn></>}
        <span className="text-sm text-muted ml-2">Môn:</span>
        <select value={filterMon} onChange={e => setFilterMon(e.target.value)} className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
          {['(tất cả)', ...mons].map(m => <option key={m}>{m}</option>)}
        </select>
        <span className="text-sm text-muted">GV:</span>
        <select value={filterGv} onChange={e => setFilterGv(e.target.value)} className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
          {['(tất cả)', ...gvs].map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        <Card>
          <H3>Bảng phân công <Badge>{list.length} dòng</Badge></H3>
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Lớp</th><th className="p-2 border-b border-line">Môn</th><th className="p-2 border-b border-line">GV phụ trách</th>{isAdmin && <th className="p-2 border-b border-line" />}</tr></thead>
              <tbody>
                {list.map(a => (
                  <tr key={a.lop + '|' + a.mon} className={me && a.gv === me ? 'bg-brand/5' : ''}>
                    <td className="p-2 border-b border-line font-semibold">{a.lop}</td>
                    <td className="p-2 border-b border-line"><Badge>{a.mon}</Badge></td>
                    <td className="p-2 border-b border-line">
                      {isAdmin
                        ? <select value={a.gv} onChange={e => setGv(a, e.target.value)} className="bg-bg text-ink border border-line rounded-md px-2 py-0.5 text-[13px]">
                          {[...new Set([a.gv, ...TEACHERS])].map(t => <option key={t}>{t}</option>)}
                        </select>
                        : a.gv}
                    </td>
                    {isAdmin && <td className="p-2 border-b border-line"><Mini onClick={() => del(a)}>✕</Mini></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <H3>Tải việc theo GV (số lớp phụ trách)</H3>
          {gvSummary.map(x => (
            <div key={x.gv} className={`py-1.5 border-b border-line ${me && x.gv === me ? 'bg-brand/5' : ''}`}>
              <div className="flex items-center justify-between">
                <b>{me && x.gv === me ? '⭐ ' : ''}{x.gv}</b>
                <Badge>{x.total} lớp·môn</Badge>
              </div>
              <div className="text-xs text-muted mt-0.5">
                {Object.entries(x.byMon).map(([m, c]) => `${m}: ${c}`).join(' · ')} — {x.lops.join(', ')}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

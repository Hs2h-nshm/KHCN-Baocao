import React, { useState } from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, KPI, Pill, Badge, Bar, toneOfSt, TabTitle } from '../components/ui.jsx'
import { VO_ST } from '../data/seed.js'
import PeriodBar from '../components/PeriodBar.jsx'

// Chấm vở tổng hợp theo THÁNG — 2 trục theo yêu cầu TTCM/BGH:
//  · dọc = LỚP: tháng này lớp được chấm những môn gì, đủ chưa
//  · ngang = GIÁO VIÊN: có chấm đủ các lớp mình dạy không (để chấm KPI)
// (chất lượng ghi vở nghiên cứu sau — đây là lớp "bề nổi" số lượng)
export default function ChamVoTab() {
  const { S, isAdmin, getMon, setMonSt, me, gvFilter } = useStore()
  const [view, setView] = useState('lop')
  const [filterMon, setFilterMon] = useState('(tất cả)')

  const mons = [...new Set((S.assign || []).map(a => a.mon))]
  const assign = (S.assign || []).filter(a => !gvFilter || a.gv === gvFilter)
  const cols = filterMon === '(tất cả)' ? mons : [filterMon]
  const lops = [...new Set(assign.map(a => a.lop))].sort()
  const khois = [...new Set(lops.map(l => l[0]))].sort()
  const gvs = [...new Set(assign.map(a => a.gv))].filter(g => g !== 'Chưa phân công').sort()

  const cellOf = (lop, mon) => assign.find(a => a.lop === lop && a.mon === mon)
  const pairs = assign.filter(a => cols.includes(a.mon))
  const done = pairs.filter(a => getMon(a.lop, a.mon).st === 'Đã chấm').length
  const lack = pairs.filter(a => getMon(a.lop, a.mon).st === 'Chấm thiếu').length
  const not = pairs.length - done - lack

  // GV chưa chấm đủ (mọi môn trong bộ lọc)
  const gvLack = gvs.map(gv => {
    const mine = pairs.filter(a => a.gv === gv)
    const d = mine.filter(a => getMon(a.lop, a.mon).st === 'Đã chấm').length
    return { gv, d, t: mine.length, miss: mine.filter(a => getMon(a.lop, a.mon).st !== 'Đã chấm') }
  }).filter(x => x.t > 0)

  const StCell = ({ lop, mon }) => {
    const a = cellOf(lop, mon)
    if (!a) return <span className="text-line">·</span>
    const c = getMon(lop, mon)
    if (!isAdmin) return <Pill tone={toneOfSt(c.st)}>{c.st}</Pill>
    return (
      <select value={c.st} title={`${a.gv}${c.note ? ' — ' + c.note : ''}`}
        onChange={e => setMonSt(lop, mon, 'st', e.target.value)}
        className={`bg-bg border border-line rounded-md px-1.5 py-0.5 text-[12px] ${c.st === 'Đã chấm' ? 'text-good' : c.st === 'Chưa chấm' ? 'text-bad' : c.st === 'Chấm thiếu' ? 'text-warn' : 'text-muted'}`}>
        {VO_ST.map(o => <option key={o}>{o}</option>)}
      </select>
    )
  }

  return (
    <div>
      <TabTitle id="chamvo">📓 Chấm vở — tổng hợp Lớp × Môn × GV</TabTitle>
      <div className="text-sm text-muted mb-2.5">Chấm theo <b>tháng</b> (chọn kỳ = Tháng). Trục dọc <b>Lớp</b>: tháng này được chấm môn gì, đủ chưa. Trục ngang <b>GV</b>: chấm đủ các lớp mình dạy chưa → KPI. Phân công lấy từ tab <b>Phân công</b>; chất lượng ghi vở làm sau.</div>
      <PeriodBar />

      <div className="flex gap-2 mb-3 flex-wrap no-print items-center">
        <span className="text-sm text-muted">Xem:</span>
        {[['lop', '🏫 Theo lớp'], ['gv', '🧑‍🏫 Theo giáo viên']].map(([v, l]) =>
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${view === v ? 'bg-brand text-white' : 'bg-panel2 text-muted'}`}>{l}</button>)}
        <span className="text-sm text-muted ml-3">Môn:</span>
        <select value={filterMon} onChange={e => setFilterMon(e.target.value)} className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
          {['(tất cả)', ...mons].map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
        <KPI color="#37b24d" n={`${done}/${pairs.length}`} l="Lớp·môn đã chấm" />
        <KPI color="#f59e0b" n={lack} l="Chấm thiếu" />
        <KPI color="#e5484d" n={not} l="Chưa chấm / chưa rõ" />
        <KPI color="#3da9fc" n={gvLack.filter(x => x.d < x.t).length} l="GV chưa chấm đủ lớp" />
      </div>

      {view === 'lop' ? (
        <>
          {khois.map(k => (
            <Card key={k}>
              <H3>Khối {k} <Badge>{lops.filter(l => l[0] === k).length} lớp</Badge></H3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="text-muted text-left">
                    <th className="p-2 border-b border-line">Lớp</th>
                    {cols.map(m => <th key={m} className="p-2 border-b border-line">{m}</th>)}
                    <th className="p-2 border-b border-line">GV phụ trách</th>
                  </tr></thead>
                  <tbody>
                    {lops.filter(l => l[0] === k).map(lop => (
                      <tr key={lop}>
                        <td className="p-2 border-b border-line font-semibold">{lop}</td>
                        {cols.map(m => <td key={m} className="p-2 border-b border-line"><StCell lop={lop} mon={m} /></td>)}
                        <td className="p-2 border-b border-line text-xs text-muted">
                          {cols.map(m => cellOf(lop, m)).filter(Boolean).map(a => `${a.mon}: ${a.gv}`).join(' · ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </>
      ) : (
        <>
          <Card>
            <H3>🚩 GV chưa chấm đủ các lớp mình dạy (kỳ này)</H3>
            {gvLack.filter(x => x.d < x.t).length ? gvLack.filter(x => x.d < x.t).map(x => (
              <div key={x.gv} className="flex items-center justify-between py-1.5 border-b border-line flex-wrap gap-1">
                <span><b>{x.gv}</b> <span className="text-muted text-xs">— thiếu: {x.miss.map(a => `${a.lop} (${a.mon})`).join(', ')}</span></span>
                <Pill tone={x.d === 0 ? 'bad' : 'warn'}>{x.d}/{x.t} lớp</Pill>
              </div>
            )) : <div className="text-muted italic text-sm">Tất cả GV đã chấm đủ 🎉</div>}
          </Card>
          {gvLack.sort((a, b) => (a.d / a.t) - (b.d / b.t)).map(x => {
            const mine = pairs.filter(a => a.gv === x.gv)
            const isMe = me && x.gv === me
            return (
              <Card key={x.gv} className={isMe ? 'border-brand/60' : ''}>
                <H3>{isMe ? '⭐ ' : ''}{x.gv} <Badge>{x.d}/{x.t} lớp·môn đã chấm</Badge> {x.d === x.t ? <Pill tone="good">Đủ</Pill> : <Pill tone={x.d === 0 ? 'bad' : 'warn'}>Thiếu {x.t - x.d}</Pill>}</H3>
                <Bar label="Tiến độ chấm" val={x.d} max={x.t} color={x.d === x.t ? '#37b24d' : '#f59e0b'} />
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Lớp</th><th className="p-2 border-b border-line">Môn</th><th className="p-2 border-b border-line">Trạng thái</th><th className="p-2 border-b border-line">Ghi chú</th></tr></thead>
                  <tbody>
                    {mine.map(a => {
                      const c = getMon(a.lop, a.mon)
                      return (
                        <tr key={a.lop + a.mon}>
                          <td className="p-2 border-b border-line font-semibold">{a.lop}</td>
                          <td className="p-2 border-b border-line">{a.mon}</td>
                          <td className="p-2 border-b border-line"><StCell lop={a.lop} mon={a.mon} /></td>
                          <td className="p-2 border-b border-line">
                            {isAdmin
                              ? <input key={`${S.periodValue}-${a.lop}-${a.mon}`} defaultValue={c.note || ''} onBlur={e => setMonSt(a.lop, a.mon, 'note', e.target.value)} placeholder="vd: thiếu 3 HS..." className="w-full bg-bg text-ink border border-line rounded-md px-2 py-0.5 text-[13px]" />
                              : <span className="text-xs text-muted">{c.note}</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}

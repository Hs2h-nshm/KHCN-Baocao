import React, { useState } from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, KPI, Pill, Mini, Badge, toneOfSt, TabTitle } from '../components/ui.jsx'
import { CLS_ST } from '../data/seed.js'
import PeriodBar from '../components/PeriodBar.jsx'

const MANG = [{ id: 'canvas', label: '💻 Canvas' }, { id: 'vo', label: '📓 Vở ghi' }]
const n0 = (v) => (v === '' || v === undefined || v === null) ? 0 : +v

// Canvas & Vở theo lớp: Lớp → trạng thái + % hoàn thành (Canvas) · GV → đã báo cáo đủ các lớp chưa
export default function ClassTab() {
  const { isAdmin, getCls, setCls, toggleClsDone, isConflict, me, gvFilter, cvAssign, pkey } = useStore()
  const [mang, setMang] = useState('canvas')
  const [view, setView] = useState('lop')

  const list = cvAssign().filter(a => a.gv !== 'Chưa phân công' && (!gvFilter || a.gv === gvFilter))
  const done = list.filter(a => getCls(mang, a.lop).st === 'Đã điền').length
  const notdone = list.filter(a => ['Chưa điền', 'Điền thiếu/sai'].includes(getCls(mang, a.lop).st)).length
  const conf = list.filter(a => isConflict(mang, a.lop)).length
  const pcts = mang === 'canvas' ? list.map(a => n0(getCls('canvas', a.lop).pct)).filter(x => x > 0) : []
  const avgPct = pcts.length ? Math.round(pcts.reduce((s, x) => s + x, 0) / pcts.length) : null

  const StatusCell = ({ lop }) => {
    const c = getCls(mang, lop)
    const cf = isConflict(mang, lop)
    if (!isAdmin) return (
      <span className="flex items-center gap-1.5 flex-wrap">
        <Pill tone={toneOfSt(c.st)}>{c.st}</Pill>
        {mang === 'canvas' && c.pct !== '' && c.pct !== undefined && <Badge>{c.pct}%</Badge>}
        {cf && <Pill tone="bad">⚠️</Pill>}
      </span>
    )
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <select value={c.st} onChange={e => setCls(mang, lop, 'st', e.target.value)}
          className="bg-bg text-ink border border-line rounded-md px-2 py-0.5 text-[13px]">
          {CLS_ST.map(o => <option key={o}>{o}</option>)}
        </select>
        {mang === 'canvas' && (
          <label className="text-xs flex items-center gap-1" title="% hoàn thành bài Canvas của lớp">
            <input type="number" min="0" max="100" value={c.pct === undefined ? '' : c.pct}
              onChange={e => setCls(mang, lop, 'pct', e.target.value === '' ? '' : Math.min(100, Math.max(0, +e.target.value)))}
              className="w-14 bg-bg text-ink border border-line rounded-md px-1.5 py-0.5 text-[13px]" />%
          </label>
        )}
        <label className="text-xs flex items-center gap-1 cursor-pointer" title="Chốt đã xong">
          <input type="checkbox" checked={!!c.done} onChange={() => toggleClsDone(mang, lop)} /> xong
        </label>
        {cf && <span className="flex items-center gap-1"><Pill tone="bad">⚠️ xung đột</Pill>
          <Mini onClick={() => setCls(mang, lop, 'st', 'Đã điền')} title="Giữ đã xong">Vẫn xong</Mini>
          <Mini onClick={() => setCls(mang, lop, 'done', false)} title="Đúng là chưa xong">Đúng là chưa</Mini></span>}
      </div>
    )
  }

  const NoteCell = ({ lop }) => {
    const c = getCls(mang, lop)
    if (!isAdmin) return <span className="text-xs text-muted">{c.note}</span>
    return <input key={`${pkey}-${mang}-${lop}`} defaultValue={c.note || ''} onBlur={e => setCls(mang, lop, 'note', e.target.value)}
      placeholder="vd: thiếu 6A01..." className="w-full bg-bg text-ink border border-line rounded-md px-2 py-0.5 text-[13px]" />
  }

  const khois = ['6', '7', '8', '9']
  const gvs = [...new Set(list.map(a => a.gv))].filter(g => g !== 'Chưa phân công').sort()
  // GV chưa báo cáo đủ (có lớp Chưa điền / —)
  const gvMiss = gvs.map(gv => {
    const rows = list.filter(a => a.gv === gv)
    const d = rows.filter(a => getCls(mang, a.lop).st === 'Đã điền').length
    return { gv, d, t: rows.length, miss: rows.filter(a => getCls(mang, a.lop).st !== 'Đã điền').map(a => a.lop) }
  }).filter(x => x.d < x.t)

  return (
    <div>
      <TabTitle id="class">🏫 Canvas &amp; Vở ghi theo lớp</TabTitle>
      <div className="text-muted text-sm mb-2.5"><b>Lớp</b>: trạng thái + tỉ lệ hoàn thành (%). <b>GV</b>: đã báo cáo đủ các lớp mình dạy chưa. Tick “xong” để chốt; báo lại “chưa” sẽ hiện cảnh báo xung đột.</div>

      <PeriodBar />

      <div className="flex gap-2 mb-3 flex-wrap no-print">
        <span className="text-sm text-muted self-center">Mảng:</span>
        {MANG.map(m => <button key={m.id} onClick={() => setMang(m.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${mang === m.id ? 'bg-brand text-white' : 'bg-panel2 text-muted'}`}>{m.label}</button>)}
        <span className="text-sm text-muted self-center ml-3">Xem:</span>
        {[['lop', 'Theo lớp'], ['gv', 'Theo giáo viên']].map(([v, l]) => <button key={v} onClick={() => setView(v)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${view === v ? 'bg-brand text-white' : 'bg-panel2 text-muted'}`}>{l}</button>)}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
        <KPI color="#37b24d" n={`${done}/${list.length}`} l={`Đã điền (${mang === 'canvas' ? 'Canvas' : 'Vở'})`} />
        <KPI color="#e5484d" n={notdone} l="Chưa/điền thiếu" />
        <KPI color="#f59e0b" n={conf} l="⚠️ Xung đột đã-xong" />
        {mang === 'canvas'
          ? <KPI color="#3da9fc" n={avgPct !== null ? avgPct + '%' : '—'} l="Tỉ lệ hoàn thành TB" />
          : <KPI color="#3da9fc" n={gvMiss.length} l="GV chưa báo cáo đủ" />}
      </div>

      {gvMiss.length > 0 && (
        <Card className="border-warn/50">
          <H3 className="text-warn">🔔 GV chưa báo cáo đủ các lớp mình dạy ({gvMiss.length})</H3>
          {gvMiss.map(x => (
            <div key={x.gv} className="flex items-center justify-between py-1 border-b border-line text-sm flex-wrap gap-1">
              <span><b>{x.gv}</b> <span className="text-muted text-xs">— còn: {x.miss.join(', ')}</span></span>
              <Pill tone={x.d === 0 ? 'bad' : 'warn'}>{x.d}/{x.t} lớp</Pill>
            </div>
          ))}
        </Card>
      )}

      {view === 'lop' ? khois.map(k => {
        const rows = list.filter(a => a.khoi === k)
        return (
          <Card key={k}>
            <H3>Khối {k} <Badge>{rows.length} lớp</Badge></H3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Lớp</th><th className="p-2 border-b border-line">GV phụ trách</th><th className="p-2 border-b border-line w-[360px]">Trạng thái{mang === 'canvas' ? ' · % hoàn thành' : ''}</th><th className="p-2 border-b border-line">Ghi chú</th></tr></thead>
              <tbody>
                {rows.map(a => (
                  <tr key={a.lop} className={isConflict(mang, a.lop) ? 'bg-bad/10' : (me && a.gv === me ? 'bg-brand/5' : '')}>
                    <td className="p-2 border-b border-line font-semibold">{a.lop}</td>
                    <td className="p-2 border-b border-line">{me && a.gv === me ? '⭐ ' : ''}{a.gv}</td>
                    <td className="p-2 border-b border-line"><StatusCell lop={a.lop} /></td>
                    <td className="p-2 border-b border-line"><NoteCell lop={a.lop} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      }) : gvs.map(gv => {
        const rows = list.filter(a => a.gv === gv)
        const d = rows.filter(a => getCls(mang, a.lop).st === 'Đã điền').length
        const gpcts = mang === 'canvas' ? rows.map(a => n0(getCls('canvas', a.lop).pct)).filter(x => x > 0) : []
        const gavg = gpcts.length ? Math.round(gpcts.reduce((s, x) => s + x, 0) / gpcts.length) : null
        return (
          <Card key={gv} className={me && gv === me ? 'border-brand/60' : ''}>
            <H3>{me && gv === me ? '⭐ ' : ''}{gv} <Badge>{d}/{rows.length} lớp đã điền</Badge>
              {gavg !== null && <Badge>TB {gavg}%</Badge>}
              {d === rows.length ? <Pill tone="good">Đủ</Pill> : <Pill tone={d === 0 ? 'bad' : 'warn'}>Thiếu {rows.length - d}</Pill>}</H3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Lớp</th><th className="p-2 border-b border-line w-[360px]">Trạng thái{mang === 'canvas' ? ' · %' : ''}</th><th className="p-2 border-b border-line">Ghi chú</th></tr></thead>
              <tbody>
                {rows.map(a => (
                  <tr key={a.lop} className={isConflict(mang, a.lop) ? 'bg-bad/10' : ''}>
                    <td className="p-2 border-b border-line font-semibold">{a.lop}</td>
                    <td className="p-2 border-b border-line"><StatusCell lop={a.lop} /></td>
                    <td className="p-2 border-b border-line"><NoteCell lop={a.lop} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      })}
    </div>
  )
}

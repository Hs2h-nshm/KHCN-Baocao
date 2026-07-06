import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, Badge, EditSelect, resolveTone, TabTitle } from '../components/ui.jsx'
import { ST_OPTS, buddyHas } from '../data/seed.js'
import PeriodBar from '../components/PeriodBar.jsx'

const DONE = ['Đủ', 'Đã báo cáo', 'Đạt', 'Tốt nghiệp']
const LACK = ['Thiếu', 'Cờ đỏ', 'Điền thiếu/sai']

export default function TrackTab() {
  const { S, isAdmin, getSt, setSt, me, gvFilter } = useStore()
  const t0 = S.tracks.find(t => t.id === 't0')

  // Báo cáo nhanh: dựa trên cột "Điền KH tuần" (t0)
  const buckets = { done: [], lack: [], none: [] }
  if (t0) t0.rows.forEach(r => {
    const st = getSt('t0', r.id).status
    if (DONE.includes(st)) buckets.done.push(r.who)
    else if (LACK.includes(st)) buckets.lack.push({ who: r.who, note: getSt('t0', r.id).note })
    else buckets.none.push(r.who)
  })

  const Box = ({ color, title, items, isObj }) => (
    <div className="bg-panel2 rounded-xl p-3 border-t-4" style={{ borderColor: resolveTone(color) }}>
      <div className="font-bold" style={{ color: resolveTone(color) }}>{title} · {items.length}</div>
      <div className="text-sm mt-1 leading-6">
        {items.length ? (isObj ? items.map((x, i) => <div key={i}>• {x.who}{x.note ? <span className="text-muted"> — {x.note}</span> : ''}</div>) : items.join(', ')) : <span className="text-muted italic">(không có)</span>}
      </div>
    </div>
  )

  return (
    <div>
      <TabTitle id="track">Theo dõi báo cáo</TabTitle>
      <div className="text-sm text-muted mb-2.5">Chọn Kỳ báo cáo (tuần của tháng) để xem{isAdmin ? '/nhập' : ''}. Quy tắc: điền đủ Chuyên môn 1.1–1.6 coi như <b>Đã điền</b>; các dòng dưới chỉ soi thêm GV có tên phân công.{!isAdmin && ' Số liệu do TPCM/AI cập nhật — GV xem trạng thái của mình (⭐).'}</div>
      <PeriodBar />

      <Card>
        <H3>🚦 Báo cáo nhanh – Điền KH tuần ({S.periodValue})</H3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Box color="#37b24d" title="✅ Đã điền" items={buckets.done} />
          <Box color="#f59e0b" title="⚠️ Điền thiếu" items={buckets.lack} isObj />
          <Box color="#e5484d" title="❌ Chưa điền" items={buckets.none} />
        </div>
      </Card>

      {S.tracks.map(t => {
        const rows = t.rows.filter(r => !gvFilter || (t.id === 't3' ? buddyHas(r, gvFilter) : r.who === gvFilter))
        if (gvFilter && !rows.length) return null
        return (
        <Card key={t.id}>
          <H3>{t.name} <Badge>{t.cadence}</Badge>{gvFilter && <Badge>đang lọc: {gvFilter}</Badge>}</H3>
          <table className="w-full text-sm border-collapse">
            <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">{t.id === 't3' ? 'Cặp buddy' : 'Giáo viên'}</th><th className="p-2 border-b border-line w-[160px]">Trạng thái</th><th className="p-2 border-b border-line">Ghi chú</th></tr></thead>
            <tbody>
              {rows.map(r => {
                const st = getSt(t.id, r.id)
                const isMe = me && (t.id === 't3' ? buddyHas(r, me) : r.who === me)
                return (
                  <tr key={r.id} className={isMe ? 'bg-brand/5' : ''}>
                    <td className="p-2 border-b border-line">{isMe ? '⭐ ' : ''}{r.who}</td>
                    <td className="p-2 border-b border-line"><EditSelect editable={isAdmin} value={st.status} onChange={e => setSt(t.id, r.id, 'status', e.target.value)} options={ST_OPTS} /></td>
                    <td className="p-2 border-b border-line">
                      {isAdmin
                        ? <input key={`${S.periodValue}-${t.id}-${r.id}`} defaultValue={st.note || ''} onBlur={e => setSt(t.id, r.id, 'note', e.target.value)} placeholder="vd: thiếu ô báo cáo; chủ nhiệm chưa điền..." className="w-[96%] bg-bg text-ink border border-line rounded-md px-2 py-0.5 text-[13px]" />
                        : <span className="text-xs text-muted">{st.note}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
        )
      })}
    </div>
  )
}

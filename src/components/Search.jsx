import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useStore } from '../data/store.jsx'
import { TEACHERS } from '../data/seed.js'
import { LinkActions } from './ui.jsx'

// bỏ dấu tiếng Việt để tìm không cần gõ dấu
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

// 🔍 Tìm kiếm toàn trang: link (tên + url), giáo viên, đầu việc, lớp, sự kiện, kế hoạch...
export default function GlobalSearch({ goTab }) {
  const { S, setGvFilter, isAdmin } = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // gom chỉ mục — thêm nguồn mới chỉ cần push thêm vào đây (mở rộng được)
  const index = useMemo(() => {
    const ix = []
    ;(S.linkCats || []).forEach(c => c.items.forEach(it => ix.push({ icon: '🔗', title: it.n, sub: c.name + (it.u ? '' : ' · chưa có link'), text: it.n + ' ' + it.u, tab: 'links', url: it.u })))
    ;(S.reports || []).forEach(r => ix.push({ icon: '🧾', title: r.ten, sub: `${r.nhip} · hạn ${r.han || '—'} · ${r.ai}`, text: r.ten + ' ' + r.ai + ' ' + r.loi, tab: 'reports', url: r.u }))
    ;(S.giao || []).forEach(g => ix.push({ icon: '🧑‍🏫', title: g.viec, sub: `phụ trách: ${g.nguoi}`, text: g.viec + ' ' + g.nguoi, tab: 'giao', url: g.u }))
    ;(S.events || []).forEach(e => ix.push({ icon: '🏆', title: e.ten, sub: `${e.trangthai}${e.nguoi ? ' · ' + e.nguoi : ''}`, text: e.ten + ' ' + e.nguoi + ' ' + e.loai + ' ' + (e.note || ''), tab: 'events', url: e.u }))
    ;(S.weekly || []).forEach(w => ix.push({ icon: '⏰', title: w.name, sub: 'việc lặp hằng tuần', text: w.name, tab: 'deadline', url: w.u }))
    ;(S.deadlines || []).forEach(d => ix.push({ icon: '📌', title: d.name, sub: d.date || 'chưa đặt ngày', text: d.name + ' ' + (d.note || ''), tab: 'deadline', url: d.u }))
    // Mục BGH chỉ index cho admin — người xem không thấy tên/link báo cáo BGH qua tìm kiếm
    if (isAdmin) (S.bgh || []).forEach(b => ix.push({ icon: '📈', title: b.name, sub: `BGH · ${b.cadence} · ${b.due}`, text: b.name, tab: 'bgh', url: b.u }))
    TEACHERS.forEach(t => {
      const lops = (S.assign || []).filter(a => a.gv === t)
      ix.push({ icon: '🧑‍🏫', title: t, sub: (lops.length ? `phụ trách ${lops.length} lớp·môn: ${lops.slice(0, 6).map(a => a.lop).join(', ')}${lops.length > 6 ? '…' : ''}` : 'giáo viên trong tổ') + ' · bấm để lọc theo GV này', text: t, tab: 'tongquan', gv: t })
    })
    ;[...new Set((S.assign || []).map(a => a.lop))].forEach(lop => {
      const who = (S.assign || []).filter(a => a.lop === lop)
      ix.push({ icon: '🏫', title: 'Lớp ' + lop, sub: who.map(a => `${a.mon}: ${a.gv}`).join(' · '), text: lop + ' ' + who.map(a => a.gv + ' ' + a.mon).join(' '), tab: 'assign' })
    })
    ;(S.monthPlan?.sections || []).forEach(s => s.items.forEach(it => ix.push({ icon: '📅', title: it.v, sub: `${S.monthPlan.thang} · ${it.ns}${it.han ? ' · hạn ' + it.han : ''}`, text: it.v + ' ' + it.m + ' ' + it.ns, tab: 'kehoach' })))
    return ix
  }, [S, isAdmin])

  const results = useMemo(() => {
    const f = fold(q.trim())
    if (f.length < 2) return []
    return index.filter(x => fold(x.text).includes(f) || fold(x.title).includes(f)).slice(0, 18)
  }, [q, index])

  const TAB_LABEL = { links: 'Cổng link', reports: 'Việc định kỳ', giao: 'Giao việc', events: 'Sự kiện', deadline: 'Lịch', bgh: 'BGH', tongquan: 'Tổng quan tổ', assign: 'Phân công', kehoach: 'KH tháng' }

  return (
    <div ref={boxRef} className="relative no-print">
      <input value={q} onFocus={() => setOpen(true)} onChange={e => { setQ(e.target.value); setOpen(true) }}
        placeholder="🔍 Tìm link · GV · công việc · lớp…"
        className="bg-bg text-ink border border-line rounded-lg px-3 py-1.5 text-[13px] w-[230px] focus:border-brand outline-none" />
      {open && q.trim().length >= 2 && (
        <div className="absolute right-0 mt-1 w-[380px] max-w-[92vw] max-h-[420px] overflow-y-auto bg-panel border border-line rounded-xl shadow-2xl z-50 p-1.5">
          {results.length ? results.map((r, i) => (
            <div key={i} className="flex items-start gap-2 px-2.5 py-2 rounded-lg hover:bg-panel2 cursor-pointer"
              onClick={() => { if (r.gv) setGvFilter(r.gv); if (r.tab) goTab(r.tab); setOpen(false) }}>
              <span className="text-base leading-5">{r.icon}</span>
              <span className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{r.title}</div>
                <div className="text-xs text-muted truncate">{r.sub}</div>
              </span>
              <span className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-muted border border-line rounded px-1">{TAB_LABEL[r.tab] || r.tab}</span>
                {r.url ? <span onClick={e => e.stopPropagation()}><LinkActions url={r.url} /></span> : null}
              </span>
            </div>
          )) : <div className="text-muted italic text-sm p-3">Không thấy kết quả cho “{q}”.</div>}
        </div>
      )}
    </div>
  )
}

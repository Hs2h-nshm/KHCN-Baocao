import React from 'react'
import { useStore } from '../data/store.jsx'
import { weeksOfMonth, yearOfMonth } from '../lib/dates.js'
import { Badge } from './ui.jsx'

const MONTHS = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7] // thứ tự theo năm học

export default function PeriodBar() {
  const { S, set } = useStore()
  const mode = S.periodMode

  // parse "Tuần X · Tháng Y"
  const m = /Tuần\s*(\d+).*Tháng\s*(\d+)/.exec(S.periodValue || '')
  const thang = m ? +m[2] : 7
  const tuan = m ? +m[1] : 1
  const mm = /Tháng\s*(\d+)/.exec(S.periodValue || '')
  const thangOnly = mm ? +mm[1] : 7

  const year = yearOfMonth(S.namHoc, mode === 'Tháng' ? thangOnly : thang)
  const weeks = weeksOfMonth(year, mode === 'Tháng' ? thangOnly : thang)
  const range = (mode === 'Tuần' && weeks[tuan - 1]) ? weeks[tuan - 1].range : ''

  const setMode = (v) => set(n => { n.periodMode = v; if (v === 'Học kì') n.periodValue = 'HK1'; else if (v === 'Tháng') n.periodValue = `Tháng ${thang}`; else n.periodValue = `Tuần ${tuan} · Tháng ${thang}` })
  const setThang = (v) => set(n => { n.periodValue = mode === 'Tháng' ? `Tháng ${v}` : `Tuần 1 · Tháng ${v}` })
  const setTuan = (v) => set(n => { n.periodValue = `Tuần ${v} · Tháng ${thang}` })
  const setHK = (v) => set(n => { n.periodValue = v })

  return (
    <div className="bg-panel2 border border-line rounded-xl p-3 mb-4 flex gap-2.5 items-center flex-wrap no-print">
      <b>🗓️ Kỳ báo cáo:</b>
      <select value={mode} onChange={e => setMode(e.target.value)} className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
        {['Tuần', 'Tháng', 'Học kì'].map(x => <option key={x}>{x}</option>)}
      </select>

      {mode !== 'Học kì' && (
        <label className="flex items-center gap-1 text-sm">Tháng
          <select value={mode === 'Tháng' ? thangOnly : thang} onChange={e => setThang(+e.target.value)} className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
            {MONTHS.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
      )}

      {mode === 'Tuần' && (
        <label className="flex items-center gap-1 text-sm">Tuần
          <select value={tuan} onChange={e => setTuan(+e.target.value)} className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
            {weeks.map((w, i) => <option key={i} value={i + 1}>{i + 1} ({w.range})</option>)}
          </select>
        </label>
      )}

      {mode === 'Học kì' && (
        <select value={S.periodValue} onChange={e => setHK(e.target.value)} className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
          {['HK1', 'HK2'].map(x => <option key={x}>{x}</option>)}
        </select>
      )}

      <Badge>Năm học {S.namHoc} · {S.periodValue}{range ? ` · ${range}` : ''}</Badge>
    </div>
  )
}

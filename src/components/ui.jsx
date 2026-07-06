import React, { useEffect } from 'react'
import { useStore } from '../data/store.jsx'

// Map mã màu trạng thái (hex cũ, truyền từ các tab) → token theme, để tự đổi Sáng/Tối
// và đủ tương phản (AA) trên nền sáng. Hex lạ giữ nguyên.
const TONE_HEX = {
  '#3da9fc': 'rgb(var(--c-brand))', '#37b24d': 'rgb(var(--c-good))',
  '#f59e0b': 'rgb(var(--c-warn))', '#e5484d': 'rgb(var(--c-bad))',
  '#8b5cf6': 'rgb(var(--c-violet))', '#93a6b8': 'rgb(var(--c-muted))'
}
export const resolveTone = (c) => TONE_HEX[c] || c

export function Card({ className = '', children }) {
  return <div className={`bg-panel border border-line rounded-xl p-4 mb-4 ${className}`}>{children}</div>
}
export function H3({ children, className = '' }) {
  return <h3 className={`text-muted text-[13px] font-semibold uppercase tracking-wide mb-2 ${className}`}>{children}</h3>
}
export function KPI({ n, l, color = '#3da9fc' }) {
  return (
    <div className="bg-panel2 rounded-xl p-3 text-center">
      <div className="text-2xl font-extrabold" style={{ color: resolveTone(color) }}>{n}</div>
      <div className="text-muted text-xs mt-0.5">{l}</div>
    </div>
  )
}
const TONE = {
  good: 'bg-good/20 text-good', bad: 'bg-bad/20 text-bad',
  warn: 'bg-warn/20 text-warn', yellow: 'bg-yellow-400/15 text-yellow-300',
  grey: 'bg-chip text-muted', brand: 'bg-brand/20 text-brand'
}
export function Pill({ tone = 'grey', children }) {
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${TONE[tone] || TONE.grey}`}>{children}</span>
}
// Tone chuẩn cho mọi bộ trạng thái — dùng chung để app nhất quán
export function toneOfSt(st) {
  if (['Đủ', 'Đã báo cáo', 'Đạt', 'Tốt nghiệp', 'Đã điền', 'Đã chấm', 'Hoàn thành'].includes(st)) return 'good'
  if (['Cờ đỏ', 'Chưa', 'Chưa điền', 'Chưa chấm', 'Trễ'].includes(st)) return 'bad'
  if (['Thiếu', 'Điền thiếu/sai', 'Chấm thiếu'].includes(st)) return 'warn'
  if (['Đang buddy', 'Đang làm', 'Đang diễn ra', 'Đang chuẩn bị'].includes(st)) return 'brand'
  return 'grey'
}
// Select khi được sửa (admin) / Pill khi chỉ xem — để GV và quản lí cùng nhìn một bảng
export function EditSelect({ editable, value, onChange, options }) {
  if (!editable) return <Pill tone={toneOfSt(value)}>{value}</Pill>
  return (
    <select value={value} onChange={onChange}
      className="bg-bg text-ink border border-line rounded-md px-2 py-0.5 text-[13px]">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}
// Ô nhập số nhỏ (LEAD, dự giờ) — chỉ admin sửa
export function NumIn({ editable, value, onChange, w = 'w-14' }) {
  if (!editable) return <span className="font-semibold">{value === '' || value === undefined ? '—' : value}</span>
  return <input type="number" min="0" value={value === undefined ? '' : value} onChange={onChange}
    className={`${w} bg-bg text-ink border border-line rounded-md px-1.5 py-0.5 text-[13px]`} />
}
export function Btn({ children, onClick, className = '', title }) {
  return (
    <button onClick={onClick} title={title}
      className={`bg-panel2 text-ink border border-line rounded-lg px-3 py-1.5 text-[13px] font-semibold hover:border-brand hover:text-brand transition ${className}`}>
      {children}
    </button>
  )
}
export function Mini({ children, onClick, title, className = '' }) {
  return (
    <button onClick={onClick} title={title}
      className={`bg-panel2 text-ink border border-line rounded-md px-2 py-0.5 text-xs font-semibold hover:border-brand hover:text-brand transition ${className}`}>
      {children}
    </button>
  )
}
export function Badge({ children }) {
  return <span className="text-[11px] text-muted border border-line px-1.5 py-0.5 rounded-md">{children}</span>
}
export function Input(props) {
  return <input {...props} className={`bg-bg text-ink border border-line rounded-lg px-2.5 py-1.5 text-sm ${props.className || ''}`} />
}
export function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange}
      className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 no-print" onClick={onClose}>
      <div className="bg-panel border border-line rounded-xl p-5 min-w-[300px] max-w-[92vw]" onClick={e => e.stopPropagation()}>
        {title && <h3 className="text-ink font-semibold mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
export function Empty({ children = 'chưa có' }) {
  return <span className="text-muted italic text-sm">{children}</span>
}

// Thanh tiến độ nhỏ dùng khắp nơi (biểu đồ nhất quán)
export function Bar({ label, val, max, color = '#37b24d', suffix = '' }) {
  const pct = max ? Math.round(val / max * 100) : 0
  return (
    <div className="my-2">
      <div className="flex items-center justify-between text-sm"><span>{label}</span><Badge>{val}/{max}{suffix ? ' ' + suffix : ''} · {pct}%</Badge></div>
      <div className="bg-panel2 rounded-md h-3 overflow-hidden mt-1"><div style={{ width: pct + '%', height: '100%', background: resolveTone(color), transition: 'width .4s' }} /></div>
    </div>
  )
}
export function Donut({ segs, subtitle = 'ổn' }) {
  const total = segs.reduce((s, x) => s + x.v, 0) || 1
  const r = 52, c = 2 * Math.PI * r; let off = 0
  const pctGood = Math.round((segs[0] ? segs[0].v : 0) / total * 100)
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" width="140" height="140">
        {segs.map((s, i) => { const len = s.v / total * c; const el = <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={resolveTone(s.color)} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" />; off += len; return el })}
        <text x="70" y="66" textAnchor="middle" style={{ fill: 'rgb(var(--c-ink))' }} fontSize="20" fontWeight="800">{pctGood}%</text>
        <text x="70" y="84" textAnchor="middle" style={{ fill: 'rgb(var(--c-muted))' }} fontSize="10">{subtitle}</text>
      </svg>
      <div>{segs.map((s, i) => <div key={i} className="flex items-center gap-2 text-sm my-0.5"><span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, display: 'inline-block' }} /> {s.label}: <b>&nbsp;{s.v}</b></div>)}</div>
    </div>
  )
}

let toastTimer
export function toast(msg) {
  let el = document.getElementById('khcn-toast')
  if (!el) {
    el = document.createElement('div'); el.id = 'khcn-toast'
    el.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#37b24d;color:#04121f;font-weight:700;padding:8px 16px;border-radius:999px;z-index:99;transition:opacity .2s'
    document.body.appendChild(el)
  }
  el.textContent = msg; el.style.opacity = '1'
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.style.opacity = '0' }, 1300)
}
export function copyText(t) {
  if (!t) { toast('Chưa có link'); return }
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(() => toast('Đã copy link')).catch(() => window.prompt('Copy:', t))
  else window.prompt('Copy:', t)
}
export function LinkActions({ url }) {
  if (!url) return <Empty />
  return (
    <span className="whitespace-nowrap">
      <a className="bg-panel2 text-ink border border-line rounded-md px-2 py-0.5 text-xs font-semibold no-underline hover:text-brand" href={url} target="_blank" rel="noreferrer">↗ Mở</a>{' '}
      <Mini onClick={() => copyText(url)}>⧉ Copy</Mini>
    </span>
  )
}

// Tiêu đề tab bấm được: nếu tab có link đi kèm (S.tabLinks[id]) → bấm tiêu đề mở luôn link.
// Admin thấy nút ✏️🔗 để gắn/sửa link; người xem chỉ bấm để mở. Tiện xem nhất: 1 cú bấm ra nguồn.
export function TabTitle({ id, children }) {
  const { S, set, isAdmin } = useStore()
  const url = (S.tabLinks && S.tabLinks[id]) || ''
  const edit = () => {
    const u = window.prompt('Dán link "mở nhanh" cho mục này (Google Sheet/Drive/Form…). Để trống để bỏ:', url)
    if (u === null) return
    set(n => { if (!n.tabLinks) n.tabLinks = {}; n.tabLinks[id] = u.trim() })
  }
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <h2 className="text-lg font-bold pl-2.5 border-l-4 border-brand m-0">
        {url
          ? <a href={url} target="_blank" rel="noreferrer" className="hover:underline decoration-brand/50 underline-offset-4" title="Bấm để mở link đi kèm ↗">{children} <span className="text-brand">↗</span></a>
          : <span title={isAdmin ? 'Chưa gắn link — bấm ✏️🔗 để thêm' : ''}>{children}</span>}
      </h2>
      {isAdmin && <button onClick={edit} title="Gắn/sửa link mở nhanh cho tab này"
        className="no-print text-xs bg-panel2 text-muted border border-line rounded-md px-1.5 py-0.5 font-semibold hover:text-brand hover:border-brand">
        {url ? '✏️🔗' : '＋🔗'}</button>}
    </div>
  )
}

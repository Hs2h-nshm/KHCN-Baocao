import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, KPI, Pill, Badge, NumIn, Bar, TabTitle } from '../components/ui.jsx'
import { TEACHERS } from '../data/seed.js'
import PeriodBar from '../components/PeriodBar.jsx'

const n0 = (v) => (v === '' || v === undefined || v === null) ? 0 : +v
const hasAny = (o, ks) => ks.some(k => o[k] !== '' && o[k] !== undefined)

// Cờ tự động cho LEAD: so đăng kí vs thực (cả LEAD 1:1 và LEAD-share)
function leadFlag(v) {
  if (!hasAny(v, ['dk', 'th', 'dks', 'ths'])) return { t: 'grey', l: '—' }
  const over = n0(v.th) > n0(v.dk) || n0(v.ths) > n0(v.dks)
  const under = n0(v.th) < n0(v.dk) || n0(v.ths) < n0(v.dks)
  if (over) return { t: 'bad', l: '🚩 Khai vượt đăng kí' }
  if (under) return { t: 'warn', l: `Thiếu ${(n0(v.dk) - n0(v.th)) + (n0(v.dks) - n0(v.ths))} tiết` }
  return { t: 'good', l: 'Đủ' }
}
// Cờ dự giờ: thực dự vs đăng kí, link đã điền vs thực dự
function duGioFlag(v) {
  if (!hasAny(v, ['dk', 'th', 'lk'])) return { t: 'grey', l: '—' }
  if (n0(v.th) > n0(v.dk)) return { t: 'brand', l: 'Dự vượt đăng kí' }
  if (n0(v.th) < n0(v.dk)) return { t: 'warn', l: `Dự thiếu ${n0(v.dk) - n0(v.th)}` }
  if (n0(v.lk) < n0(v.th)) return { t: 'bad', l: `Thiếu ${n0(v.th) - n0(v.lk)} link` }
  return { t: 'good', l: 'Đủ + đủ link' }
}

// LEAD & Dự giờ: số tiết đăng kí ↔ dạy/dự thực ↔ link minh chứng, cờ đỏ tự động
export default function SoLieuTab() {
  const { S, set, isAdmin, getNum, setNum, me, gvFilter } = useStore()
  const rows = TEACHERS.map((t, i) => ({ id: 'r' + i, who: t })).filter(r => !gvFilter || r.who === gvFilter)

  const sum = (kind, k) => rows.reduce((s, r) => s + n0(getNum(kind, r.id)[k]), 0)
  const leadTot = { dk: sum('lead', 'dk'), th: sum('lead', 'th'), dks: sum('lead', 'dks'), ths: sum('lead', 'ths') }
  const dgTot = { dk: sum('dugio', 'dk'), th: sum('dugio', 'th'), lk: sum('dugio', 'lk') }
  const leadFlags = rows.map(r => leadFlag(getNum('lead', r.id)))
  const dgFlags = rows.map(r => duGioFlag(getNum('dugio', r.id)))

  const Row = ({ r, kind }) => {
    const v = getNum(kind, r.id)
    const f = kind === 'lead' ? leadFlag(v) : duGioFlag(v)
    const isMe = me && r.who === me
    const cell = (k) => <NumIn editable={isAdmin} value={v[k]} onChange={e => setNum(kind, r.id, k, e.target.value)} />
    return (
      <tr className={isMe ? 'bg-brand/5' : ''}>
        <td className="p-2 border-b border-line">{isMe ? '⭐ ' : ''}{r.who}</td>
        {kind === 'lead' ? (<>
          <td className="p-2 border-b border-line text-center">{cell('dk')}</td>
          <td className="p-2 border-b border-line text-center">{cell('th')}</td>
          <td className="p-2 border-b border-line text-center">{cell('dks')}</td>
          <td className="p-2 border-b border-line text-center">{cell('ths')}</td>
        </>) : (<>
          <td className="p-2 border-b border-line text-center">{cell('dk')}</td>
          <td className="p-2 border-b border-line text-center">{cell('th')}</td>
          <td className="p-2 border-b border-line text-center">{cell('lk')}</td>
        </>)}
        <td className="p-2 border-b border-line"><Pill tone={f.t}>{f.l}</Pill></td>
      </tr>
    )
  }

  return (
    <div>
      <TabTitle id="solieu">📱 LEAD &amp; 👁️ Dự giờ — đăng kí vs thực</TabTitle>
      <div className="text-sm text-muted mb-2.5">Nguyên tắc <b>số thật &gt; số khai</b>: cột <b>đăng kí</b> lấy từ link đăng kí/log IT, cột <b>thực</b> từ báo cáo GV. Lệch nhau → cờ tự động (khai vượt đăng kí = 🚩 cờ đỏ). Dự giờ thêm cột <b>link minh chứng đã điền</b>.</div>
      <PeriodBar />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
        <KPI color="#3da9fc" n={`${leadTot.th}/${leadTot.dk}`} l="LEAD: thực / đăng kí" />
        <KPI color="#3da9fc" n={`${leadTot.ths}/${leadTot.dks}`} l="LEAD-share: thực / đăng kí" />
        <KPI color="#37b24d" n={`${dgTot.th}/${dgTot.dk}`} l="Dự giờ: thực dự / đăng kí" />
        <KPI color={dgTot.lk < dgTot.th ? '#e5484d' : '#37b24d'} n={`${dgTot.lk}/${dgTot.th}`} l="Link minh chứng / thực dự" />
      </div>

      <div className="grid gap-3.5 md:grid-cols-2 mb-4">
        <Card>
          <H3>Toàn tổ — LEAD</H3>
          <Bar label="LEAD 1:1 (thực/đăng kí)" val={leadTot.th} max={leadTot.dk || 1} color="#3da9fc" suffix="tiết" />
          <Bar label="LEAD-share (thực/đăng kí)" val={leadTot.ths} max={leadTot.dks || 1} color="#8b5cf6" suffix="tiết" />
          <div className="text-xs text-muted mt-1">🚩 {leadFlags.filter(f => f.t === 'bad').length} GV khai vượt · ⚠️ {leadFlags.filter(f => f.t === 'warn').length} GV thiếu tiết</div>
        </Card>
        <Card>
          <H3>Toàn tổ — Dự giờ</H3>
          <Bar label="Thực dự / đăng kí" val={dgTot.th} max={dgTot.dk || 1} color="#37b24d" suffix="tiết" />
          <Bar label="Link đã điền / thực dự" val={dgTot.lk} max={dgTot.th || 1} color="#f59e0b" suffix="link" />
          <div className="text-xs text-muted mt-1">🚩 {dgFlags.filter(f => f.t === 'bad').length} GV thiếu link · ⚠️ {dgFlags.filter(f => f.t === 'warn').length} GV dự thiếu</div>
        </Card>
      </div>

      <Card>
        <H3>📱 LEAD theo giáo viên <Badge>{S.periodValue}</Badge></H3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="text-muted text-left">
              <th className="p-2 border-b border-line">Giáo viên</th>
              <th className="p-2 border-b border-line text-center">ĐK LEAD</th>
              <th className="p-2 border-b border-line text-center">Thực LEAD</th>
              <th className="p-2 border-b border-line text-center">ĐK share</th>
              <th className="p-2 border-b border-line text-center">Thực share</th>
              <th className="p-2 border-b border-line">Đánh giá</th>
            </tr></thead>
            <tbody>{rows.map(r => <Row key={r.id} r={r} kind="lead" />)}</tbody>
            <tfoot><tr className="font-bold">
              <td className="p-2">Tổng</td>
              <td className="p-2 text-center">{leadTot.dk}</td><td className="p-2 text-center">{leadTot.th}</td>
              <td className="p-2 text-center">{leadTot.dks}</td><td className="p-2 text-center">{leadTot.ths}</td><td />
            </tr></tfoot>
          </table>
        </div>
      </Card>

      <Card>
        <H3>👁️ Dự giờ theo giáo viên <Badge>{S.periodValue}</Badge></H3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="text-muted text-left">
              <th className="p-2 border-b border-line">Giáo viên</th>
              <th className="p-2 border-b border-line text-center">Đăng kí</th>
              <th className="p-2 border-b border-line text-center">Thực dự</th>
              <th className="p-2 border-b border-line text-center">Link đã điền</th>
              <th className="p-2 border-b border-line">Đánh giá</th>
            </tr></thead>
            <tbody>{rows.map(r => <Row key={r.id} r={r} kind="dugio" />)}</tbody>
            <tfoot><tr className="font-bold">
              <td className="p-2">Tổng</td>
              <td className="p-2 text-center">{dgTot.dk}</td><td className="p-2 text-center">{dgTot.th}</td>
              <td className="p-2 text-center">{dgTot.lk}</td><td />
            </tr></tfoot>
          </table>
        </div>
      </Card>

      <LeadA0B0 S={S} set={set} isAdmin={isAdmin} me={me} gvFilter={gvFilter} />
    </div>
  )
}

// 🔗 KHU BÁO CÁO LEAD A0/B0 — nguồn LIÊN TỔ (file do BGH khác phụ trách),
// đã lọc riêng thành viên tổ KHCN. Cập nhật: AI đọc file liên tổ → thay rows (hoặc admin sửa tay).
function LeadA0B0({ S, set, isAdmin, me, gvFilter }) {
  const la = S.leadA0B0 || { link: '', ky: '', capNhat: '', rows: [] }
  const rows = (la.rows || []).filter(r => !gvFilter || r.gv === gvFilter)
  const sumBC = rows.reduce((s, r) => s + (r.tuanBC || 0), 0)
  const sumT = rows.reduce((s, r) => s + (r.tuanTong || 0), 0)
  const toneOf = (r) => { const p = r.tuanTong ? r.tuanBC / r.tuanTong : 0; return p >= 0.9 ? 'good' : p >= 0.6 ? 'warn' : 'bad' }
  const editLink = () => { const u = window.prompt('Link file LEAD A0/B0 (liên tổ):', la.link || ''); if (u === null) return; set(n => { n.leadA0B0.link = u.trim() }) }
  return (
    <Card className="border-brand/40">
      <H3>🔗 Báo cáo LEAD A0/B0 — lọc riêng thành viên tổ <Badge>{la.ky}</Badge> <Badge>nguồn liên tổ · BGH khác phụ trách</Badge></H3>
      <div className="text-sm text-muted mb-2">
        Dữ liệu lọc từ file "Báo tiết iPad A0, B0" (chỉ đọc, không sửa file gốc). Cập nhật lần cuối: {la.capNhat || '—'}.
        {la.link ? <> · <a className="text-brand hover:underline" href={la.link} target="_blank" rel="noreferrer">Mở file gốc ↗</a></> : ' · (chưa gắn link file gốc)'}
        {isAdmin && <> <button onClick={editLink} className="bg-panel2 text-ink border border-line rounded-md px-2 py-0.5 text-xs font-semibold hover:border-brand ml-1">✏️🔗 gắn link</button></>}
      </div>
      <Bar label="Toàn tổ: tuần đã báo cáo / tổng tuần" val={sumBC} max={sumT || 1} color="#3da9fc" suffix="tuần" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-muted text-left">
            <th className="p-2 border-b border-line">Giáo viên</th>
            <th className="p-2 border-b border-line">Môn · Lớp A0/B0</th>
            <th className="p-2 border-b border-line">Tần suất đăng kí</th>
            <th className="p-2 border-b border-line">Mức hoàn thành</th>
            <th className="p-2 border-b border-line text-center">Tuần đã BC</th>
            <th className="p-2 border-b border-line">Chuyên cần</th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={me && r.gv === me ? 'bg-brand/5' : ''}>
                <td className="p-2 border-b border-line">{me && r.gv === me ? '⭐ ' : ''}{r.gv}</td>
                <td className="p-2 border-b border-line">{r.monlop}</td>
                <td className="p-2 border-b border-line"><Badge>{r.tansuat}</Badge></td>
                <td className="p-2 border-b border-line"><Pill tone={r.hientrang === 'Nâng cao' ? 'good' : r.hientrang === 'Cơ bản' ? 'brand' : 'grey'}>{r.hientrang}</Pill></td>
                <td className="p-2 border-b border-line text-center font-semibold">{r.tuanBC}/{r.tuanTong}</td>
                <td className="p-2 border-b border-line"><Pill tone={toneOf(r)}>{Math.round((r.tuanTong ? r.tuanBC / r.tuanTong : 0) * 100)}%</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted mt-2">💡 Sang 26-27: AI đọc file liên tổ theo kỳ → cập nhật bảng này; số "thực dạy" đối chiếu vào bảng LEAD phía trên.</div>
    </Card>
  )
}

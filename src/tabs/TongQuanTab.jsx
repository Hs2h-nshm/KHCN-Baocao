import React, { useState } from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, KPI, Pill, Badge, Bar, Donut, toneOfSt } from '../components/ui.jsx'
import { TEACHERS, buddyHas } from '../data/seed.js'
import { TabTitle } from '../components/ui.jsx'
import PeriodBar from '../components/PeriodBar.jsx'

const n0 = (v) => (v === '' || v === undefined || v === null) ? 0 : +v
// Tên ngắn cho cột ma trận (giữ hậu tố phân biệt 2 Lan Anh / 2 Phương Thảo)
function shortName(full) {
  const m = /\(([^)]+)\)/.exec(full)
  const base = full.replace(/\s*\([^)]*\)/, '').trim().split(' ').slice(-2).join(' ')
  return m ? `${base} (${m[1].split('/').pop()})` : base
}
const DOT = { good: 'rgb(var(--c-good))', warn: 'rgb(var(--c-warn))', bad: 'rgb(var(--c-bad))', grey: 'rgb(var(--c-muted))', brand: 'rgb(var(--c-brand))', yellow: 'rgb(var(--c-warn))' }

// 📊 TỔNG QUAN TỔ cho BGH/TTCM — "mở một cái là thấy":
//  ① KPI từng mảng  ② Ma trận ĐẦU VIỆC × GV (heatmap)  ③ Ai chưa nộp  ④ Soi từng GV: đầu việc → lớp → %
// 📋 Bảng số liệu tuần cho BGH: mỗi chỉ số 1 dòng — số lượng · tiến độ · cần chú ý.
// Luôn tính trên TOÀN TỔ (19 GV), không phụ thuộc bộ Lọc GV. In được kèm báo cáo tuần.
function SoLieuTuan({ S, getSt, getCls, getMon, getNum, GOOD }) {
  const n0v = (v) => (v === '' || v === undefined || v === null) ? 0 : +v
  const all = TEACHERS.map((t, i) => ({ id: 'r' + i, who: t }))
  const assign = (S.assign || []).filter(a => a.gv !== 'Chưa phân công') // mẫu số chỉ tính lớp đã phân công
  const unassigned = (S.assign || []).filter(a => a.gv === 'Chưa phân công' && a.mon === 'KHTN').map(a => a.lop)
  const kh0 = assign.filter(a => a.mon === 'KHTN').map(a => ({ lop: a.lop, gv: a.gv }))
  const lops = kh0.length ? kh0 : (S.classAssign || [])

  const tCount = (tid) => {
    const t = S.tracks.find(x => x.id === tid)
    if (!t) return { d: 0, tot: 0 }
    return { d: t.rows.filter(r => GOOD.includes(getSt(tid, r.id).status)).length, tot: t.rows.length }
  }
  const sum = (kind, k) => all.reduce((s, r) => s + n0v(getNum(kind, r.id)[k]), 0)
  const gvCo = (kind, ks) => all.filter(r => { const v = getNum(kind, r.id); return ks.some(k => v[k] !== '' && v[k] !== undefined) }).length

  const kh = tCount('t0'), bcVo = tCount('t1'), bcCv = tCount('t2'), bud = tCount('t3')
  const cvD = lops.filter(a => getCls('canvas', a.lop).st === 'Đã điền').length
  const pcts = lops.map(a => n0v(getCls('canvas', a.lop).pct)).filter(x => x > 0)
  const cvPct = pcts.length ? Math.round(pcts.reduce((s, x) => s + x, 0) / pcts.length) : null
  const voD = assign.filter(a => getMon(a.lop, a.mon).st === 'Đã chấm').length
  const ld = { dk: sum('lead', 'dk'), th: sum('lead', 'th'), dks: sum('lead', 'dks'), ths: sum('lead', 'ths') }
  const dg = { dk: sum('dugio', 'dk'), th: sum('dugio', 'th'), lk: sum('dugio', 'lk') }
  const dgThieuLink = all.filter(r => { const v = getNum('dugio', r.id); return n0v(v.lk) < n0v(v.th) }).length
  const ldVuot = all.filter(r => { const v = getNum('lead', r.id); return (v.dk !== '' || v.th !== '') && (n0v(v.th) > n0v(v.dk) || n0v(v.ths) > n0v(v.dks)) }).length
  const la = S.leadA0B0 || { rows: [] }
  const laBC = (la.rows || []).reduce((s, r) => s + (r.tuanBC || 0), 0)
  const laT = (la.rows || []).reduce((s, r) => s + (r.tuanTong || 0), 0)

  const R = ({ icon, ten, so, d, tot, note, noteTone = 'grey' }) => {
    const pct = tot ? Math.round(d / tot * 100) : 0
    return (
      <tr>
        <td className="p-2 border-b border-line whitespace-nowrap">{icon} <b>{ten}</b></td>
        <td className="p-2 border-b border-line font-bold whitespace-nowrap">{so}</td>
        <td className="p-2 border-b border-line w-[34%]">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-panel2 rounded-md h-3 overflow-hidden"><div style={{ width: pct + '%', height: '100%', background: pct >= 90 ? 'rgb(var(--c-good))' : pct >= 60 ? 'rgb(var(--c-warn))' : 'rgb(var(--c-bad))' }} /></div>
            <span className="text-xs font-bold w-10 text-right">{pct}%</span>
          </div>
        </td>
        <td className="p-2 border-b border-line">{note ? <Pill tone={noteTone}>{note}</Pill> : <span className="text-muted text-xs">—</span>}</td>
      </tr>
    )
  }

  return (
    <Card className="border-brand/40">
      <H3>📋 Số liệu tuần — toàn bộ chỉ số (BGH/TTCM nắm nhanh) <Badge>{S.periodValue}</Badge></H3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Chỉ số</th><th className="p-2 border-b border-line">Số lượng</th><th className="p-2 border-b border-line">Tiến độ</th><th className="p-2 border-b border-line">Cần chú ý</th></tr></thead>
          <tbody>
            <R icon="🧾" ten="Điền KH tuần" so={`${kh.d}/${kh.tot} GV`} d={kh.d} tot={kh.tot}
              note={kh.tot - kh.d > 0 ? `${kh.tot - kh.d} GV chưa/thiếu` : 'đủ'} noteTone={kh.tot - kh.d > 0 ? 'bad' : 'good'} />
            <R icon="📓" ten="BC Chấm vở (GV nộp)" so={`${bcVo.d}/${bcVo.tot} GV`} d={bcVo.d} tot={bcVo.tot}
              note={bcVo.tot - bcVo.d > 0 ? `${bcVo.tot - bcVo.d} chưa nộp` : 'đủ'} noteTone={bcVo.tot - bcVo.d > 0 ? 'warn' : 'good'} />
            <R icon="📓" ten="Chấm vở theo Lớp×Môn (kỳ Tháng)" so={`${voD}/${assign.length} lớp·môn`} d={voD} tot={assign.length} />
            <R icon="💻" ten="BC Canvas (GV nộp)" so={`${bcCv.d}/${bcCv.tot} GV`} d={bcCv.d} tot={bcCv.tot} />
            <R icon="💻" ten="Canvas theo lớp (đã điền)" so={`${cvD}/${lops.length} lớp`} d={cvD} tot={lops.length}
              note={cvPct !== null ? `TB % lớp có log ${cvPct}%` : ''} noteTone="brand" />
            {unassigned.length > 0 && <R icon="🧩" ten="Lớp CHƯA phân công KHTN" so={`${unassigned.length} lớp`} d={0} tot={0}
              note={unassigned.join(', ')} noteTone="bad" />}
            <R icon="📱" ten="LEAD 1:1 (thực/đăng kí)" so={`${ld.th}/${ld.dk} tiết`} d={ld.th} tot={ld.dk}
              note={ldVuot ? `🚩 ${ldVuot} GV khai vượt ĐK` : (gvCo('lead', ['dk', 'th']) + ' GV có số liệu')} noteTone={ldVuot ? 'bad' : 'grey'} />
            <R icon="📱" ten="LEAD-share (thực/đăng kí)" so={`${ld.ths}/${ld.dks} tiết`} d={ld.ths} tot={ld.dks} />
            <R icon="👁️" ten="Dự giờ (thực dự/đăng kí)" so={`${dg.th}/${dg.dk} tiết`} d={dg.th} tot={dg.dk} />
            <R icon="🔗" ten="Điền link minh chứng dự giờ" so={`${dg.lk}/${dg.th} link`} d={dg.lk} tot={dg.th}
              note={dgThieuLink ? `${dgThieuLink} GV thiếu link` : 'đủ link'} noteTone={dgThieuLink ? 'bad' : 'good'} />
            <R icon="👥" ten="Buddy / Đào tạo" so={`${bud.d}/${bud.tot} cặp ổn`} d={bud.d} tot={bud.tot} />
            <R icon="🔗" ten="LEAD A0/B0 (liên tổ, tuần BC)" so={`${laBC}/${laT} tuần·GV`} d={laBC} tot={laT}
              note="nguồn BGH khác phụ trách" noteTone="brand" />
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted mt-2">Bảng tính trên toàn tổ (không bị ảnh hưởng bởi Lọc GV) · bấm 🖨️ In/PDF để đính kèm báo cáo tuần gửi BGH.</div>
    </Card>
  )
}

export default function TongQuanTab() {
  const { S, getSt, getCls, getMon, getNum, me, gvFilter, GOOD, NOTYET, cvAssign } = useStore()
  const [gvPick, setGvPick] = useState(me || 'Dương Đức Hiếu')

  const rows = TEACHERS.map((t, i) => ({ id: 'r' + i, who: t })).filter(r => !gvFilter || r.who === gvFilter)
  const assign = S.assign || []
  const canvasLops = cvAssign()

  // ---- trạng thái theo track (đầu việc chấm theo GV) ----
  const trackStat = (S.tracks || []).map(t => {
    const good = t.rows.filter(r => GOOD.includes(getSt(t.id, r.id).status)).length
    const flags = t.rows.filter(r => getSt(t.id, r.id).status === 'Cờ đỏ')
    const notYet = t.rows.filter(r => NOTYET.includes(getSt(t.id, r.id).status))
    return { t, good, total: t.rows.length, flags, notYet }
  })

  // ---- chấm vở (Lớp×Môn, kỳ Tháng) & canvas (theo lớp) gộp mức GV ----
  const voOfGv = (gv) => {
    const mine = assign.filter(a => a.gv === gv)
    const d = mine.filter(a => getMon(a.lop, a.mon).st === 'Đã chấm').length
    return { d, t: mine.length, mine }
  }
  const cvOfGv = (gv) => {
    const mine = canvasLops.filter(a => a.gv === gv)
    const d = mine.filter(a => getCls('canvas', a.lop).st === 'Đã điền').length
    const pcts = mine.map(a => n0(getCls('canvas', a.lop).pct)).filter(x => x > 0)
    const avg = pcts.length ? Math.round(pcts.reduce((s, x) => s + x, 0) / pcts.length) : null
    return { d, t: mine.length, avg, mine }
  }
  const assignReal = assign.filter(a => a.gv !== 'Chưa phân công')
  const canvasReal = canvasLops.filter(a => a.gv !== 'Chưa phân công')
  const voAll = assignReal.length ? { d: assignReal.filter(a => getMon(a.lop, a.mon).st === 'Đã chấm').length, t: assignReal.length } : { d: 0, t: 0 }
  const cvAll = { d: canvasReal.filter(a => getCls('canvas', a.lop).st === 'Đã điền').length, t: canvasReal.length }

  // ---- ma trận Đầu việc × GV: mỗi ô 1 chấm màu ----
  const matrixRows = [
    { key: 't0', label: '🧾 KH tuần', cell: (r) => toneOfSt(getSt('t0', r.id).status), tip: (r) => getSt('t0', r.id).status },
    {
      key: 'vo', label: '📓 Chấm vở', cell: (r) => { const v = voOfGv(r.who); return v.t === 0 ? 'grey' : v.d === v.t ? 'good' : v.d === 0 ? 'bad' : 'warn' },
      tip: (r) => { const v = voOfGv(r.who); return v.t ? `${v.d}/${v.t} lớp·môn đã chấm` : 'không có phân công' }
    },
    {
      key: 'cv', label: '💻 Canvas', cell: (r) => { const v = cvOfGv(r.who); return v.t === 0 ? 'grey' : v.d === v.t ? 'good' : v.d === 0 ? 'bad' : 'warn' },
      tip: (r) => { const v = cvOfGv(r.who); return v.t ? `${v.d}/${v.t} lớp đã điền${v.avg !== null ? ' · TB ' + v.avg + '%' : ''}` : 'không có lớp' }
    },
    {
      key: 'lead', label: '📱 LEAD', cell: (r) => { const v = getNum('lead', r.id); if (v.dk === '' && v.th === '') return 'grey'; if (n0(v.th) > n0(v.dk) || n0(v.ths) > n0(v.dks)) return 'bad'; if (n0(v.th) < n0(v.dk) || n0(v.ths) < n0(v.dks)) return 'warn'; return 'good' },
      tip: (r) => { const v = getNum('lead', r.id); return `LEAD ${n0(v.th)}/${n0(v.dk)} · share ${n0(v.ths)}/${n0(v.dks)}` }
    },
    {
      key: 'dugio', label: '👁️ Dự giờ', cell: (r) => { const v = getNum('dugio', r.id); if (v.dk === '' && v.th === '') return 'grey'; if (n0(v.lk) < n0(v.th)) return 'bad'; if (n0(v.th) < n0(v.dk)) return 'warn'; return 'good' },
      tip: (r) => { const v = getNum('dugio', r.id); return `dự ${n0(v.th)}/${n0(v.dk)} · link ${n0(v.lk)}` }
    },
    { key: 't2', label: '💻 BC Canvas', cell: (r) => toneOfSt(getSt('t2', r.id).status), tip: (r) => getSt('t2', r.id).status },
    { key: 't1', label: '📓 BC Chấm vở', cell: (r) => toneOfSt(getSt('t1', r.id).status), tip: (r) => getSt('t1', r.id).status }
  ]

  // ---- ai chưa nộp KH tuần / cờ đỏ toàn cục ----
  const notT0 = rows.filter(r => ['—', 'Chưa'].includes(getSt('t0', r.id).status))
  const allFlags = []
  ;(S.tracks || []).forEach(t => t.rows.forEach(r => { if (getSt(t.id, r.id).status === 'Cờ đỏ') allFlags.push({ mang: t.name, who: r.who, note: getSt(t.id, r.id).note }) }))
  rows.forEach(r => {
    const v = getNum('lead', r.id)
    if ((v.dk !== '' || v.th !== '') && (n0(v.th) > n0(v.dk) || n0(v.ths) > n0(v.dks))) allFlags.push({ mang: '📱 LEAD', who: r.who, note: 'thực khai vượt đăng kí' })
  })

  // ---- drill-down 1 GV ----
  const gv = gvFilter || gvPick
  const rid = 'r' + TEACHERS.indexOf(gv)
  const vo = voOfGv(gv), cv = cvOfGv(gv)
  const lead = getNum('lead', rid), dg = getNum('dugio', rid)
  const buddyRows = (S.tracks.find(t => t.id === 't3')?.rows || []).filter(r => buddyHas(r, gv))

  let g = 0, b = 0, o = 0
  S.tracks.forEach(t => t.rows.forEach(r => { const st = getSt(t.id, r.id).status; if (GOOD.includes(st)) g++; else if (NOTYET.includes(st)) b++; else o++ }))

  return (
    <div>
      <TabTitle id="tongquan">📊 Tổng quan tổ — cho TTCM / BGH</TabTitle>
      <div className="text-sm text-muted mb-2.5">Một màn hình thấy cả tổ: <b>đầu việc × giáo viên</b> (ma trận màu), ai chưa nộp, cờ đỏ; bấm chọn GV để soi <b>GV → đầu việc → lớp → %</b>. Chấm vở xem đúng nhất ở kỳ <b>Tháng</b>.</div>
      <PeriodBar />

      {/* ① dải KPI theo mảng */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-4">
        <KPI color="#3da9fc" n={`${trackStat[0]?.good ?? 0}/${rows.length}`} l="KH tuần đã điền" />
        <KPI color="#37b24d" n={voAll.t ? `${voAll.d}/${voAll.t}` : '—'} l="Chấm vở (lớp·môn)" />
        <KPI color="#8b5cf6" n={`${cvAll.d}/${cvAll.t}`} l="Canvas (lớp đã điền)" />
        <KPI color="#e5484d" n={notT0.length} l="GV chưa nộp KH tuần" />
        <KPI color="#e5484d" n={allFlags.length} l="🚩 Cờ đỏ (nghi khai sai)" />
      </div>

      {/* ①b BẢNG SỐ LIỆU TUẦN — BGH nắm số lượng TOÀN BỘ chỉ số trong 1 bảng */}
      <SoLieuTuan S={S} getSt={getSt} getCls={getCls} getMon={getMon} getNum={getNum} GOOD={GOOD} />

      {/* ② ma trận Đầu việc × GV */}
      <Card>
        <H3>Ma trận Đầu việc × Giáo viên <Badge>{S.periodValue}</Badge></H3>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-1.5 text-left text-muted border-b border-line sticky left-0 bg-panel">Đầu việc</th>
                {rows.map(r => (
                  <th key={r.id} className="border-b border-line px-0.5 pb-1 align-bottom">
                    <div className="text-[10px] text-muted font-semibold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: 110, margin: '0 auto' }}>
                      {me === r.who ? '⭐' : ''}{shortName(r.who)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixRows.map(mr => (
                <tr key={mr.key}>
                  <td className="p-1.5 font-semibold whitespace-nowrap border-b border-line sticky left-0 bg-panel">{mr.label}</td>
                  {rows.map(r => (
                    <td key={r.id} className="text-center border-b border-line px-0.5 py-1 cursor-pointer" title={`${r.who}: ${mr.tip(r)}`} onClick={() => setGvPick(r.who)}>
                      <span style={{ display: 'inline-block', width: 13, height: 13, borderRadius: 4, background: DOT[mr.cell(r)] || DOT.grey }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-muted mt-2 flex gap-3 flex-wrap">
          <span><span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: DOT.good }} /> đủ/ổn</span>
          <span><span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: DOT.warn }} /> thiếu một phần</span>
          <span><span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: DOT.bad }} /> chưa làm / cờ đỏ</span>
          <span><span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: DOT.grey }} /> chưa có dữ liệu</span>
          <span className="ml-auto">💡 bấm vào ô để soi GV tương ứng</span>
        </div>
      </Card>

      {/* ③ ai chưa nộp + cờ đỏ */}
      <div className="grid gap-3.5 md:grid-cols-2">
        <Card>
          <H3>❌ Chưa nộp KH tuần ({notT0.length})</H3>
          {notT0.length ? <div className="text-sm leading-7">{notT0.map(r => <Pill key={r.id} tone="bad">{shortName(r.who)}</Pill>).reduce((acc, x, i) => acc === null ? [x] : [...acc, ' ', x], null)}</div>
            : <div className="text-muted italic text-sm">Cả tổ đã nộp 🎉</div>}
        </Card>
        <Card>
          <H3>🚩 Cờ đỏ — số khai lệch số thật ({allFlags.length})</H3>
          {allFlags.length ? allFlags.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-line text-sm">
              <span><b>{f.who}</b> · {f.mang}</span><span className="text-xs text-bad">{f.note || 'cần đối chiếu'}</span>
            </div>
          )) : <div className="text-muted italic text-sm">Không có cờ đỏ.</div>}
        </Card>
      </div>

      {/* ④ soi từng GV */}
      <Card className={me && gv === me ? 'border-brand/60' : ''}>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <H3 className="mb-0">🔎 Soi giáo viên:</H3>
          <select value={gv} onChange={e => setGvPick(e.target.value)} className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
            {TEACHERS.map(t => <option key={t}>{t}</option>)}
          </select>
          <Badge>{S.periodValue}</Badge>
        </div>
        <div className="grid gap-3.5 md:grid-cols-2">
          <div>
            <Bar label="📓 Chấm vở (lớp·môn của GV)" val={vo.d} max={vo.t || 1} color={vo.d === vo.t && vo.t ? '#37b24d' : '#f59e0b'} />
            <div className="text-xs text-muted mb-2">
              {vo.t ? vo.mine.map(a => { const c = getMon(a.lop, a.mon); return <Pill key={a.lop + a.mon} tone={toneOfSt(c.st)}>{a.lop}·{a.mon}</Pill> }).reduce((acc, x) => acc === null ? [x] : [...acc, ' ', x], null) : 'không có phân công chấm vở'}
            </div>
            <Bar label="💻 Canvas (lớp đã điền)" val={cv.d} max={cv.t || 1} color="#3da9fc" />
            <div className="text-xs text-muted mb-2">
              {cv.t ? cv.mine.map(a => { const c = getCls('canvas', a.lop); return <Pill key={a.lop} tone={toneOfSt(c.st)}>{a.lop}{c.pct !== '' && c.pct !== undefined ? ` ${c.pct}%` : ''}</Pill> }).reduce((acc, x) => acc === null ? [x] : [...acc, ' ', x], null) : 'không có lớp Canvas'}
              {cv.avg !== null && <div className="mt-1">Tỉ lệ hoàn thành TB các lớp: <b className="text-ink">{cv.avg}%</b></div>}
            </div>
          </div>
          <div>
            <div className="text-sm py-1 border-b border-line flex justify-between"><span>🧾 KH tuần</span><Pill tone={toneOfSt(getSt('t0', rid).status)}>{getSt('t0', rid).status}</Pill></div>
            <div className="text-sm py-1 border-b border-line flex justify-between"><span>📱 LEAD (thực/ĐK)</span><b>{n0(lead.th)}/{n0(lead.dk)} · share {n0(lead.ths)}/{n0(lead.dks)}</b></div>
            <div className="text-sm py-1 border-b border-line flex justify-between"><span>👁️ Dự giờ (thực/ĐK · link)</span><b>{n0(dg.th)}/{n0(dg.dk)} · {n0(dg.lk)} link</b></div>
            {buddyRows.map(r => (
              <div key={r.id} className="text-sm py-1 border-b border-line flex justify-between"><span>👥 Buddy: {r.who}</span><Pill tone={toneOfSt(getSt('t3', r.id).status)}>{getSt('t3', r.id).status}</Pill></div>
            ))}
            <div className="text-sm py-1 flex justify-between"><span>💻 BC Canvas · 📓 BC Chấm vở</span>
              <span><Pill tone={toneOfSt(getSt('t2', rid).status)}>{getSt('t2', rid).status}</Pill> <Pill tone={toneOfSt(getSt('t1', rid).status)}>{getSt('t1', rid).status}</Pill></span></div>
          </div>
        </div>
      </Card>

      {/* ⑤ biểu đồ chung */}
      <div className="grid gap-3.5 md:grid-cols-2">
        <Card><H3>Tỉ lệ “ổn” theo mảng (báo cáo GV)</H3>{trackStat.map(x => <Bar key={x.t.id} label={x.t.name} val={x.good} max={x.total} color="#37b24d" />)}</Card>
        <Card><H3>Phân bố trạng thái toàn tổ</H3><Donut segs={[{ v: g, color: '#37b24d', label: 'Ổn' }, { v: b, color: '#e5484d', label: 'Chưa/Thiếu' }, { v: o, color: '#f59e0b', label: 'Khác' }]} /><div className="text-xs text-muted mt-2">Tổng {g + b + o} dòng theo dõi · kỳ {S.periodValue}.</div></Card>
      </div>
    </div>
  )
}

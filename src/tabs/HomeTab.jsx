import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, KPI, Pill, Badge, toneOfSt, TabTitle } from '../components/ui.jsx'
import { urgClass, urgText } from '../lib/dates.js'
import { TEACHERS } from '../data/seed.js'

const n0 = (v) => (v === '' || v === undefined || v === null) ? 0 : +v

function reminderLevel(n) {
  if (n < 0) return { l: '🔴 Lần 3 · QUÁ HẠN', aud: 'BGH · TTCM · TPCM · GV', tone: 'bad' }
  if (n <= 1) return { l: '🟠 Lần 2 · sát hạn', aud: 'TTCM · TPCM · GV', tone: 'warn' }
  return { l: '🟡 Lần 1 · nhắc trước', aud: 'TPCM · GV', tone: 'yellow' }
}

export default function HomeTab() {
  const { S, set, isAdmin, allDeadlines, getSt, getCls, getMon, getNum, conflicts, me, GOOD, cvAssign } = useStore()
  const dls = allDeadlines().filter(x => x.when && x.n <= 7)
  const over = dls.filter(x => x.n < 0).length
  const rem = allDeadlines().filter(x => x.when && x.n <= 3)
  const conf = conflicts()

  const t0 = S.tracks.find(t => t.id === 't0')
  let notRep = 0
  if (t0) t0.rows.forEach(r => { if (['—', 'Chưa', 'Chưa điền', 'Thiếu', 'Cờ đỏ'].includes(getSt('t0', r.id).status)) notRep++ })

  const kpis = isAdmin
    ? [['#3da9fc', dls.length, 'Tới hạn ≤7 ngày'], ['#e5484d', over, 'Đang quá hạn'], ['#f59e0b', notRep, `Chưa/thiếu điền KH tuần`], ['#e5484d', conf.length, '⚠️ Xung đột "đã xong"']]
    : [['#3da9fc', dls.length, 'Tới hạn ≤7 ngày'], ['#e5484d', over, 'Đang quá hạn'], ['#37b24d', S.events.length, 'Sự kiện / cuộc thi'], ['#93a6b8', S.giao.length, 'Đầu việc được giao']]

  // ⭐ Góc của tôi (khi đã chọn "Tôi là" ở góc phải)
  const rid = me ? 'r' + TEACHERS.indexOf(me) : null
  const myAssign = me ? (S.assign || []).filter(a => a.gv === me) : []
  const myCanvas = me ? cvAssign().filter(a => a.gv === me) : []
  const myVoDone = myAssign.filter(a => getMon(a.lop, a.mon).st === 'Đã chấm').length
  const myCvDone = myCanvas.filter(a => getCls('canvas', a.lop).st === 'Đã điền').length
  const myLead = rid ? getNum('lead', rid) : null
  const myDg = rid ? getNum('dugio', rid) : null

  return (
    <div>
      <TabTitle id="home">Trang chính · Năm học {S.namHoc}</TabTitle>

      {!me && (
        <Card className="border-brand/40">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-lg leading-5">👋</span>
            <span>Chào thầy/cô! Chọn <b>tên của mình</b> ở ô <b>“Tôi là”</b> (góc trên bên phải) để xem nhanh phần <b>⭐ Việc của tôi</b>. Nút <b>🌙/☀️</b> cạnh đó để đổi giao diện Sáng/Tối cho dễ nhìn.</span>
          </div>
        </Card>
      )}

      {isAdmin && conf.length > 0 && (
        <Card className="border-bad/60">
          <H3 className="text-bad">⚠️ Cảnh báo xung đột: {conf.length} lớp trước đã chốt XONG, nay báo CHƯA</H3>
          {conf.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-line">
              <span>{c.mang === 'canvas' ? '💻 Canvas' : '📓 Vở'} · <b>{c.lop}</b> · {c.gv} — trạng thái: <span className="text-bad">{c.c.st}</span></span>
              <span className="text-xs text-muted">Kiểm tra lại ở tab “Canvas & Vở theo lớp”</span>
            </div>
          ))}
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
        {kpis.map((k, i) => <KPI key={i} color={k[0]} n={k[1]} l={k[2]} />)}
      </div>

      {me && rid && (
        <Card className="border-brand/60">
          <H3 className="text-brand">⭐ Việc của tôi — {me} <Badge>{S.periodValue}</Badge></H3>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div className="flex justify-between py-1 border-b border-line"><span>🧾 KH tuần</span><Pill tone={toneOfSt(getSt('t0', rid).status)}>{getSt('t0', rid).status}</Pill></div>
            <div className="flex justify-between py-1 border-b border-line"><span>📓 Chấm vở (kỳ Tháng)</span><Pill tone={myAssign.length && myVoDone === myAssign.length ? 'good' : myVoDone ? 'warn' : 'grey'}>{myVoDone}/{myAssign.length} lớp·môn</Pill></div>
            <div className="flex justify-between py-1 border-b border-line"><span>💻 Canvas ({myCanvas.map(a => a.lop).join(', ') || '—'})</span><Pill tone={myCanvas.length && myCvDone === myCanvas.length ? 'good' : myCvDone ? 'warn' : 'grey'}>{myCvDone}/{myCanvas.length} lớp</Pill></div>
            <div className="flex justify-between py-1 border-b border-line"><span>📱 LEAD thực/ĐK · share</span><b>{n0(myLead.th)}/{n0(myLead.dk)} · {n0(myLead.ths)}/{n0(myLead.dks)}</b></div>
            <div className="flex justify-between py-1 border-b border-line"><span>👁️ Dự giờ thực/ĐK · link</span><b>{n0(myDg.th)}/{n0(myDg.dk)} · {n0(myDg.lk)} link</b></div>
            <div className="flex justify-between py-1 border-b border-line"><span>💻 BC Canvas · 📓 BC Chấm vở</span><span><Pill tone={toneOfSt(getSt('t2', rid).status)}>{getSt('t2', rid).status}</Pill> <Pill tone={toneOfSt(getSt('t1', rid).status)}>{getSt('t1', rid).status}</Pill></span></div>
          </div>
        </Card>
      )}

      <div className="grid gap-3.5 md:grid-cols-2">
        <Card>
          <H3>🔔 Sắp đến hạn (7 ngày)</H3>
          {dls.length ? dls.map((x, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-line">
              <span>{x.u ? <a className="text-brand hover:underline" href={x.u} target="_blank" rel="noreferrer">{x.name} 🔗</a> : x.name} <span className="text-muted text-xs">· {x.label}</span></span>
              <Pill tone={urgClass(x.n)}>{urgText(x.n)}</Pill>
            </div>
          )) : <div className="text-muted italic text-sm">Không có việc tới hạn trong 7 ngày.</div>}
        </Card>

        <Card>
          <H3>{isAdmin ? `📋 Trạng thái báo cáo · ${S.periodValue}` : '🧑‍🏫 Ai phụ trách việc gì'}</H3>
          {isAdmin
            ? S.tracks.map(t => {
              const done = t.rows.filter(r => GOOD.includes(getSt(t.id, r.id).status)).length
              return <div key={t.id} className="flex items-center justify-between py-1 border-b border-line"><span>{t.name}</span><Pill tone={done === t.rows.length ? 'good' : 'grey'}>{done}/{t.rows.length} ổn</Pill></div>
            })
            : S.giao.map((g, i) => <div key={i} className="flex items-center justify-between py-1 border-b border-line"><span>{g.u ? <a className="text-brand hover:underline" href={g.u} target="_blank" rel="noreferrer">{g.viec}</a> : g.viec}</span><span className="text-[11px] text-muted border border-line px-1.5 py-0.5 rounded-md">{g.nguoi}</span></div>)}
        </Card>
      </div>

      <Card>
        <H3>🔔 Cần nhắc (escalation ≥3 mức)</H3>
        {rem.length ? rem.map((x, i) => {
          const r = reminderLevel(x.n)
          return <div key={i} className="flex items-center justify-between py-1.5 border-b border-line">
            <span>{x.u ? <a className="text-brand hover:underline" href={x.u} target="_blank" rel="noreferrer">{x.name}</a> : x.name} <span className="text-muted text-xs">· {x.label} · gửi: {r.aud}</span></span>
            <Pill tone={r.tone}>{r.l}</Pill>
          </div>
        }) : <div className="text-muted italic text-sm">Chưa có việc cần nhắc trong 3 ngày.</div>}
      </Card>

      {isAdmin && (
        <Card>
          <H3>🗒️ Ghi chú để đi họp (tự lưu)</H3>
          <textarea key={S.namHoc} defaultValue={S.meetingNotes} onBlur={e => set(n => { n.meetingNotes = e.target.value })}
            className="w-full min-h-[90px] bg-bg text-ink border border-line rounded-lg p-2.5 text-sm"
            placeholder="Ý cần báo cáo khi đi họp..." />
        </Card>
      )}
    </div>
  )
}

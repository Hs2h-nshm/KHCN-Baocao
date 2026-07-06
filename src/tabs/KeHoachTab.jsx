import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, Badge, Mini, TabTitle } from '../components/ui.jsx'

export default function KeHoachTab() {
  const { S, set, isAdmin } = useStore()
  const mp = S.monthPlan || { thang: '', namHoc: '', sections: [], link: '' }

  const editLink = () => { const u = window.prompt('Link file kế hoạch tháng (Google Sheet/Drive):', mp.link || ''); if (u === null) return; set(n => { n.monthPlan.link = u.trim() }) }

  return (
    <div>
      <TabTitle id="kehoach">📅 Kế hoạch {mp.thang} · Năm học {mp.namHoc}</TabTitle>
      <div className="text-sm text-muted mb-3">
        Kế hoạch công việc của tổ theo tháng (nạp từ bảng KH tháng của TTCM). GV tra cứu đầu việc – hạn – ai làm.
        {mp.link ? <> · <a className="text-brand hover:underline" href={mp.link} target="_blank" rel="noreferrer">Mở file gốc ↗</a></> : ''}
        {isAdmin && <> <Mini onClick={editLink} className="ml-1">✏️🔗 gắn link file</Mini></>}
      </div>

      {mp.sections.map((s, si) => (
        <Card key={si}>
          <H3>{s.ten}</H3>
          <table className="w-full text-sm border-collapse">
            <thead><tr className="text-muted text-left">
              <th className="p-2 border-b border-line w-[26%]">Đầu việc</th>
              <th className="p-2 border-b border-line">Mô tả / Yêu cầu</th>
              <th className="p-2 border-b border-line w-[130px]">Hạn</th>
              <th className="p-2 border-b border-line w-[150px]">Nhân sự</th>
            </tr></thead>
            <tbody>
              {s.items.map((it, i) => (
                <tr key={i}>
                  <td className="p-2 border-b border-line font-semibold">{it.v}</td>
                  <td className="p-2 border-b border-line text-muted">{it.m}</td>
                  <td className="p-2 border-b border-line">{it.han ? <Badge>{it.han}</Badge> : ''}</td>
                  <td className="p-2 border-b border-line">{it.ns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  )
}

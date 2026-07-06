import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, Badge, Mini, Btn, Empty, LinkActions, TabTitle } from '../components/ui.jsx'

const GROUPS = [
  ['Tuần', '🗓️ Hằng tuần'], ['Mỗi tiết', '⏱️ Mỗi tiết'],
  ['Tháng', '📆 Hằng tháng'], ['Theo lịch', '🔁 Theo lịch']
]

export default function ReportsTab() {
  const { S, set, isAdmin } = useStore()
  const editLink = (id) => { const it = S.reports.find(r => r.id === id); const u = window.prompt('Link để báo cáo/điền việc này:', it.u || ''); if (u === null) return; set(n => { n.reports.find(r => r.id === id).u = u.trim() }) }
  const add = () => { const ten = window.prompt('Đầu việc báo cáo:'); if (!ten) return; const nhip = window.prompt('Nhịp (Tuần/Tháng/Mỗi tiết/Theo lịch):', 'Tuần') || 'Tuần'; set(n => n.reports.push({ id: 'rp' + Date.now(), ten, nhip, han: '', ai: 'GVBM', u: '', loi: '' })) }
  const del = (id) => set(n => { n.reports = n.reports.filter(r => r.id !== id) })

  return (
    <div>
      <TabTitle id="reports">🧾 Việc báo cáo định kỳ (chuẩn hóa)</TabTitle>
      <div className="text-sm text-muted mb-2.5">Đầu việc GV phải báo cáo theo Tuần / Tháng. Bấm <b>Mở</b> vào đúng link tổ để điền. Cột “Lỗi nếu quên” = cái bị ghi vào KPI.</div>
      {isAdmin && <div className="mb-3 no-print"><Btn onClick={add}>+ Thêm đầu việc báo cáo</Btn></div>}
      {GROUPS.map(([g, title]) => {
        const rows = S.reports.filter(r => r.nhip === g)
        if (!rows.length) return null
        return (
          <Card key={g}>
            <H3>{title}</H3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Đầu việc</th><th className="p-2 border-b border-line">Hạn</th><th className="p-2 border-b border-line">Ai làm</th><th className="p-2 border-b border-line">Lỗi nếu quên</th><th className="p-2 border-b border-line">Link</th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td className="p-2 border-b border-line">{r.ten}</td>
                    <td className="p-2 border-b border-line">{r.han}</td>
                    <td className="p-2 border-b border-line"><Badge>{r.ai}</Badge></td>
                    <td className="p-2 border-b border-line text-xs text-muted">{r.loi}</td>
                    <td className="p-2 border-b border-line whitespace-nowrap">{r.u ? <LinkActions url={r.u} /> : <Empty />}{isAdmin && <> <Mini onClick={() => editLink(r.id)}>✏️🔗</Mini> <Mini onClick={() => del(r.id)}>✕</Mini></>}</td>
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

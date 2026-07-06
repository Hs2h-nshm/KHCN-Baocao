import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, Mini, Btn, Empty, TabTitle } from '../components/ui.jsx'

export default function GiaoTab() {
  const { S, set, isAdmin } = useStore()
  const editLink = (i) => { const u = window.prompt('Link để làm/điền việc này:', S.giao[i].u || ''); if (u === null) return; set(n => { n.giao[i].u = u.trim() }) }
  const edit = (i) => { const g = S.giao[i]; const v = window.prompt('Đầu việc:', g.viec); if (v === null) return; const ng = window.prompt('Người phụ trách:', g.nguoi); if (ng === null) return; const h = window.prompt('Nhịp/Hạn:', g.han || ''); if (h === null) return; set(n => { n.giao[i] = { ...n.giao[i], viec: v, nguoi: ng, han: h } }) }
  const add = () => { const v = window.prompt('Đầu việc:'); if (!v) return; const ng = window.prompt('Người phụ trách:', '') || ''; set(n => n.giao.push({ viec: v, nguoi: ng, han: '', u: '' })) }
  const del = (i) => set(n => { n.giao.splice(i, 1) })

  return (
    <div>
      <TabTitle id="giao">Giao việc &amp; Người phụ trách</TabTitle>
      {isAdmin && <div className="mb-3 no-print"><Btn onClick={add}>+ Thêm đầu việc</Btn></div>}
      <Card>
        <table className="w-full text-sm border-collapse">
          <thead><tr className="text-muted text-left"><th className="p-2 border-b border-line">Đầu việc / Mảng</th><th className="p-2 border-b border-line">Người phụ trách</th><th className="p-2 border-b border-line">Nhịp / Hạn</th><th className="p-2 border-b border-line">Link</th>{isAdmin && <th className="p-2 border-b border-line"></th>}</tr></thead>
          <tbody>
            {S.giao.map((g, i) => (
              <tr key={i}>
                <td className="p-2 border-b border-line">{g.viec}</td>
                <td className="p-2 border-b border-line">{g.nguoi}</td>
                <td className="p-2 border-b border-line">{g.han}</td>
                <td className="p-2 border-b border-line whitespace-nowrap">{g.u ? <a className="text-brand" href={g.u} target="_blank" rel="noreferrer">Mở</a> : <Empty>—</Empty>} {isAdmin && <Mini onClick={() => editLink(i)}>✏️🔗</Mini>}</td>
                {isAdmin && <td className="p-2 border-b border-line whitespace-nowrap"><Mini onClick={() => edit(i)}>✏️</Mini> <Mini onClick={() => del(i)}>✕</Mini></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

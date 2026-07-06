import React from 'react'
import { useStore } from '../data/store.jsx'
import { Card, Mini, Btn, Empty, LinkActions, TabTitle } from '../components/ui.jsx'

export default function LinksTab() {
  const { S, set, isAdmin } = useStore()
  const editLink = (cid, i) => { const it = S.linkCats.find(c => c.id === cid).items[i]; const u = window.prompt('Dán link cho: ' + it.n, it.u); if (u === null) return; set(n => { n.linkCats.find(c => c.id === cid).items[i].u = u.trim() }) }
  const addItem = (cid) => { const nm = window.prompt('Tên mục mới:'); if (!nm) return; set(n => n.linkCats.find(c => c.id === cid).items.push({ n: nm, u: '' })) }
  const delItem = (cid, i) => set(n => { n.linkCats.find(c => c.id === cid).items.splice(i, 1) })
  const addCat = () => { const nm = window.prompt('Tên nhóm link:'); if (!nm) return; set(n => n.linkCats.push({ id: 'c' + Date.now(), name: nm, items: [] })) }
  const delCat = (cid) => { if (!window.confirm('Xóa cả nhóm?')) return; set(n => { n.linkCats = n.linkCats.filter(c => c.id !== cid) }) }

  return (
    <div>
      <TabTitle id="links">Cổng link</TabTitle>
      <div className="text-sm text-muted mb-2.5">Giữ nguyên cấu trúc link tổ 25–26. GV bấm <b>Mở</b> để điền, hoặc <b>Copy</b> để dán nơi khác.</div>
      {S.linkCats.map(c => (
        <Card key={c.id}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="m-0 text-muted text-[13px] font-semibold uppercase tracking-wide">{c.name}</h3>
            {isAdmin && <span className="no-print"><Mini onClick={() => addItem(c.id)}>+ mục</Mini> <Mini onClick={() => delCat(c.id)}>✕ nhóm</Mini></span>}
          </div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {c.items.map((it, i) => (
                <tr key={i}>
                  <td className="p-2 border-b border-line w-[40%]">{it.n}</td>
                  <td className="p-2 border-b border-line text-xs text-muted break-all">{it.u || <Empty>chưa có link</Empty>}</td>
                  <td className="p-2 border-b border-line whitespace-nowrap w-[190px]">
                    {it.u && <LinkActions url={it.u} />}{' '}
                    {isAdmin && <><Mini onClick={() => editLink(c.id, i)}>✏️</Mini>{' '}</>}
                    {isAdmin && <Mini onClick={() => delItem(c.id, i)}>✕</Mini>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
      {isAdmin && <Btn onClick={addCat} className="no-print">+ Thêm nhóm link</Btn>}
    </div>
  )
}

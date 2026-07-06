import React, { useState } from 'react'
import { useStore } from '../data/store.jsx'
import { Card, H3, Btn, toast, TabTitle } from '../components/ui.jsx'
import { seed } from '../data/seed.js'

const ROLE_LABEL = { gv: 'Giáo viên', bgh: 'BGH', tt: 'Tổ trưởng', tp: 'Tổ phó' }

export default function CloudTab() {
  const { S, replaceAll, cloudPull, cloudPush, hasSupabase, session, profileRole, isAdmin } = useStore()
  const [status, setStatus] = useState('')

  const pull = async () => { try { setStatus('Đang tải…'); const at = await cloudPull(); setStatus('✔ Đã tải bản mới nhất' + (at ? ' (' + at + ')' : '')) } catch (e) { setStatus('Lỗi: ' + e.message) } }
  const push = async () => { try { setStatus('Đang lưu…'); const at = await cloudPush(); setStatus('✔ Đã lưu lên máy chủ ' + at) } catch (e) { setStatus('Lỗi: ' + e.message) } }

  const exportJson = () => { const b = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'khcn_dieu_hanh.json'; a.click() }
  const importJson = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json'; inp.onchange = e => { const f = e.target.files[0]; const r = new FileReader(); r.onload = () => { try { replaceAll(JSON.parse(r.result)); toast('Đã nhập dữ liệu') } catch { toast('File không hợp lệ') } }; r.readAsText(f) }; inp.click() }
  const reset = () => { if (window.confirm('Đưa về dữ liệu mẫu? Mọi thay đổi sẽ mất.')) replaceAll(seed()) }

  return (
    <div>
      <TabTitle id="cloud">Đồng bộ Supabase (dùng chung cả tổ)</TabTitle>
      <Card>
        <H3>Kết nối máy chủ Supabase</H3>
        {!hasSupabase
          ? <div className="text-sm text-bad">⚠️ Chưa cấu hình Supabase. Điền <b>VITE_SUPABASE_URL</b> và <b>VITE_SUPABASE_ANON_KEY</b> trong file <b>.env</b> (xem thư mục <code>supabase/</code> + hướng dẫn setup), rồi chạy lại. Hiện app đang chạy tạm bằng bộ nhớ trình duyệt.</div>
          : <div className="text-sm text-muted">Trạng thái: {session ? <>đã đăng nhập <b>{session.user.email}</b> · vai <b>{ROLE_LABEL[profileRole] || profileRole || '—'}</b></> : 'chưa đăng nhập (chỉ xem)'}. Dữ liệu tự tải khi mở trang và cập nhật trực tiếp (realtime).</div>}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Btn onClick={pull} title="Tải bản mới nhất từ máy chủ">⬇️ Tải bản mới nhất</Btn>
          {isAdmin && <Btn onClick={push} title="Lưu bản hiện tại thành bản chung">☁️ Lưu lên máy chủ</Btn>}
        </div>
        {status && <div className="text-sm text-muted mt-2.5">{status}</div>}
      </Card>

      <Card>
        <H3>Sao lưu / khôi phục (cục bộ)</H3>
        <div className="flex gap-2 flex-wrap"><Btn onClick={exportJson}>⬇️ Xuất JSON</Btn><Btn onClick={importJson}>⬆️ Nhập JSON</Btn>{isAdmin && <Btn onClick={reset}>↺ Về mặc định</Btn>}</div>
      </Card>
    </div>
  )
}

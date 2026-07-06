import React, { useEffect, useState } from 'react'
import { useStore } from './data/store.jsx'
import { Modal, Input, Btn } from './components/ui.jsx'
import { WD } from './lib/dates.js'
import { TEACHERS } from './data/seed.js'
import GlobalSearch from './components/Search.jsx'

import HomeTab from './tabs/HomeTab.jsx'
import TongQuanTab from './tabs/TongQuanTab.jsx'
import ChamVoTab from './tabs/ChamVoTab.jsx'
import SoLieuTab from './tabs/SoLieuTab.jsx'
import AssignTab from './tabs/AssignTab.jsx'
import DeadlineTab from './tabs/DeadlineTab.jsx'
import LinksTab from './tabs/LinksTab.jsx'
import GiaoTab from './tabs/GiaoTab.jsx'
import ReportsTab from './tabs/ReportsTab.jsx'
import EventsTab from './tabs/EventsTab.jsx'
import ClassTab from './tabs/ClassTab.jsx'
import TrackTab from './tabs/TrackTab.jsx'
import BghTab from './tabs/BghTab.jsx'
import CloudTab from './tabs/CloudTab.jsx'
import GuideTab from './tabs/GuideTab.jsx'
import KeHoachTab from './tabs/KeHoachTab.jsx'

const ROLE_LABEL = { gv: 'Giáo viên', bgh: 'BGH', tt: 'Tổ trưởng', tp: 'Tổ phó' }

// GV (view) và quản lí (admin) xem cùng các bảng tổng hợp — chỉ khác quyền sửa.
const TABS = [
  { id: 'home', label: '🏠 Trang chính', roles: ['view', 'admin'], Comp: HomeTab },
  { id: 'tongquan', label: '📊 Tổng quan tổ', roles: ['admin'], Comp: TongQuanTab },
  { id: 'kehoach', label: '📅 Kế hoạch tháng', roles: ['view', 'admin'], Comp: KeHoachTab },
  { id: 'chamvo', label: '📓 Chấm vở', roles: ['view', 'admin'], Comp: ChamVoTab },
  { id: 'class', label: '💻 Canvas & Vở theo lớp', roles: ['view', 'admin'], Comp: ClassTab },
  { id: 'solieu', label: '📱 LEAD & Dự giờ', roles: ['admin'], Comp: SoLieuTab },
  { id: 'track', label: '📋 Theo dõi báo cáo', roles: ['admin'], Comp: TrackTab },
  { id: 'assign', label: '🧩 Phân công', roles: ['view', 'admin'], Comp: AssignTab },
  { id: 'deadline', label: '⏰ Lịch & Deadline', roles: ['view', 'admin'], Comp: DeadlineTab },
  { id: 'reports', label: '🧾 Việc định kỳ', roles: ['view', 'admin'], Comp: ReportsTab },
  { id: 'links', label: '🔗 Cổng link', roles: ['view', 'admin'], Comp: LinksTab },
  { id: 'giao', label: '🧑‍🏫 Giao việc', roles: ['view', 'admin'], Comp: GiaoTab },
  { id: 'events', label: '🏆 Sự kiện & Cuộc thi', roles: ['view', 'admin'], Comp: EventsTab },
  { id: 'bgh', label: '📈 Báo cáo BGH', roles: ['admin'], Comp: BghTab },
  { id: 'cloud', label: '☁️ Đồng bộ', roles: ['view', 'admin'], Comp: CloudTab },
  { id: 'guide', label: '❓ Hướng dẫn', roles: ['view', 'admin'], Comp: GuideTab }
]

export default function App() {
  const { S, set, role, isAdmin, session, profileRole, login, logout, me, setMe, gvFilter, setGvFilter, theme, toggleTheme } = useStore()
  const [tab, setTab] = useState('home')
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [busy, setBusy] = useState(false)

  const visible = TABS.filter(t => t.roles.includes(role))
  useEffect(() => { if (!visible.find(t => t.id === tab)) setTab('home') }, [role]) // eslint-disable-line

  const Active = (visible.find(t => t.id === tab) || visible[0]).Comp
  const now = new Date()

  const doLogin = async () => {
    setBusy(true); setLoginErr('')
    try {
      await login(email, password)
      setLoginOpen(false); setEmail(''); setPassword('')
    } catch (e) { setLoginErr(e.message) }
    finally { setBusy(false) }
  }

  const addNamHoc = () => {
    const v = window.prompt('Năm học mới (vd 2027-2028):', '')
    if (!v) return
    set(n => { if (!n.namHocList.includes(v)) n.namHocList.push(v); n.namHoc = v })
  }
  const goTab = (id) => { if (TABS.find(t => t.id === id && t.roles.includes(role))) setTab(id); else setTab('home') }

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="app-header sticky top-0 z-20 flex items-center gap-3 flex-wrap px-5 py-3 border-b border-line">
        <div>
          <h1 className="text-lg font-bold m-0 text-white">🧭 Trung tâm điều hành – Tổ KHCN THCS</h1>
          <div className="text-white/80 text-xs mt-0.5 no-print">Ngôi Sao Hoàng Mai · {WD[now.getDay()]}, {now.toLocaleDateString('vi-VN')}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 no-print flex-wrap">
          <GlobalSearch goTab={goTab} />
          <span className="text-xs text-white/80">Tôi là</span>
          <select value={me} onChange={e => setMe(e.target.value)}
            className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px] max-w-[150px]">
            <option value="">(chọn tên)</option>
            {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="text-xs text-white/80">Lọc GV</span>
          <select value={gvFilter} onChange={e => setGvFilter(e.target.value)}
            className={`bg-bg text-ink border rounded-lg px-2 py-1 text-[13px] max-w-[150px] ${gvFilter ? 'border-brand text-brand font-semibold' : 'border-line'}`}
            title="Chọn 1 GV → mọi bảng chỉ hiện người đó. Chọn (tất cả) để bỏ lọc.">
            <option value="">(tất cả)</option>
            {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="text-xs text-white/80">Năm học</span>
          <select value={S.namHoc} onChange={e => set(n => { n.namHoc = e.target.value })}
            className="bg-bg text-ink border border-line rounded-lg px-2 py-1 text-[13px]">
            {S.namHocList.map(y => <option key={y}>{y}</option>)}
          </select>
          {isAdmin && <Btn onClick={addNamHoc} className="px-2 py-1">+ năm</Btn>}
          <Btn onClick={toggleTheme} title="Chuyển giao diện Sáng/Tối">{theme === 'dark' ? '☀️ Sáng' : '🌙 Tối'}</Btn>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isAdmin ? 'bg-white/25 text-white' : 'bg-white/15 text-white/90'}`}>
            {isAdmin ? (ROLE_LABEL[profileRole] || 'Quản trị') : 'Người xem'}
          </span>
          {session
            ? <Btn onClick={logout} title={session.user.email}>🔓 Thoát</Btn>
            : <Btn onClick={() => { setEmail(''); setPassword(''); setLoginErr(''); setLoginOpen(true) }}>🔒 Đăng nhập</Btn>}
        </div>
      </header>

      {/* Nav */}
      <nav className="sticky z-10 flex flex-wrap gap-1.5 px-4 py-2.5 bg-panel border-b border-line no-print" style={{ top: 58 }}>
        {visible.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition ${tab === t.id ? 'bg-brand text-white' : 'text-muted hover:text-ink hover:bg-panel2'}`}>
            {t.label}
          </button>
        ))}
        <span className="ml-auto flex gap-1.5">
          <Btn onClick={() => window.print()} className="text-muted">🖨️ In / PDF</Btn>
        </span>
      </nav>

      <main className="max-w-[1200px] mx-auto p-5">
        <Active />
      </main>

      <footer className="text-muted text-xs text-center py-6 no-print">
        Trung tâm điều hành Tổ KHCN · Năm học {S.namHoc}
      </footer>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="🔒 Đăng nhập (BGH / Tổ trưởng / Tổ phó)">
        <Input type="email" value={email} autoFocus placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-2" />
        <Input type="password" value={password} placeholder="Mật khẩu"
          onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') doLogin() }}
          className="w-full mb-3" />
        <div className="flex justify-end gap-2">
          <Btn onClick={() => setLoginOpen(false)}>Hủy</Btn>
          <Btn onClick={doLogin}>{busy ? 'Đang vào…' : 'Đăng nhập'}</Btn>
        </div>
        {loginErr && <div className="text-bad text-sm mt-2">{loginErr}</div>}
        <div className="text-muted text-xs mt-2">Giáo viên chỉ xem thì không cần đăng nhập.</div>
      </Modal>
    </div>
  )
}

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase, hasSupabase } from '../lib/supabase.js'
import { seed, GOOD, NOTYET } from './seed.js'
import { WD, nextDow, daysTo } from '../lib/dates.js'

// v5: roster 19 GV + 4 lớp "Chưa phân công". Backend = Supabase (auth email/mật khẩu + RLS + audit + realtime).
const LS_DATA = 'khcn_v5'
const LS_ME = 'khcn_me_v5'
const LS_GVF = 'khcn_gvfilter_v5'
const LS_THEME = 'khcn_theme_v5' // 'light' (mặc định) | 'dark'
const EDITOR_ROLES = ['tp', 'tt', 'bgh'] // vai được phép sửa/lưu

function loadData() {
  try {
    const j = JSON.parse(localStorage.getItem(LS_DATA))
    if (j && j.weekly && j.snaps) {
      const s = seed()
      // đảm bảo đủ trường khi nâng cấp (forward-compatible)
      for (const k of ['reports', 'events', 'classAssign', 'monthPlan', 'namHocList', 'giao', 'linkCats', 'bgh', 'tracks', 'weekly', 'deadlines', 'subjects', 'assign', 'leadA0B0', 'tabLinks'])
        if (!j[k]) j[k] = s[k]
      if (!j.namHoc) j.namHoc = s.namHoc
      if (!j.snaps) j.snaps = {}
      if (!j.adminPin) j.adminPin = s.adminPin
      return j
    }
  } catch (e) { /* ignore */ }
  return seed()
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [S, setS] = useState(loadData)
  const [me, setMeState] = useState(() => localStorage.getItem(LS_ME) || '')
  const [gvFilter, setGvFilterState] = useState(() => localStorage.getItem(LS_GVF) || '')
  const [theme, setThemeState] = useState(() => localStorage.getItem(LS_THEME) || 'light')
  const [session, setSession] = useState(null)
  const [profileRole, setProfileRole] = useState('') // '' | 'gv' | 'bgh' | 'tt' | 'tp'

  useEffect(() => { localStorage.setItem(LS_DATA, JSON.stringify(S)) }, [S])
  useEffect(() => { localStorage.setItem(LS_ME, me) }, [me])
  useEffect(() => { localStorage.setItem(LS_GVF, gvFilter) }, [gvFilter])
  useEffect(() => {
    localStorage.setItem(LS_THEME, theme)
    const el = document.documentElement
    if (theme === 'dark') el.setAttribute('data-theme', 'dark'); else el.removeAttribute('data-theme')
  }, [theme])

  // Cập nhật dữ liệu bất biến: set(n => { mutate n })
  const set = (mutator) => setS(prev => { const n = structuredClone(prev); mutator(n); return n })
  const replaceAll = (data) => {
    setS(prev => {
      const s = seed()
      if (data.adminPin === undefined) data.adminPin = prev.adminPin || s.adminPin
      for (const k of Object.keys(s)) if (data[k] === undefined) data[k] = s[k]
      return data
    })
  }
  const setMe = (v) => setMeState(v || '')
  const setGvFilter = (v) => setGvFilterState(v || '')
  const toggleTheme = () => setThemeState(t => (t === 'dark' ? 'light' : 'dark'))

  const pkeyOf = (n) => `${n.namHoc}|${n.periodMode}|${n.periodValue}`
  const pkey = pkeyOf(S)

  // đảm bảo nhánh snaps tồn tại rồi mutate
  const snapAtKey = (n, key, ...path) => {
    if (!n.snaps[key]) n.snaps[key] = {}
    let cur = n.snaps[key]
    for (const p of path) { if (!cur[p]) cur[p] = {}; cur = cur[p] }
    return cur
  }
  const snapAt = (n, ...path) => snapAtKey(n, pkeyOf(n), ...path)

  // Chấm vở luôn theo THÁNG: đang xem Tuần X · Tháng Y thì dữ liệu chấm vở vẫn ghi/đọc ở key Tháng Y
  const monKeyOf = (n) => {
    const m = /Tháng\s*(\d+)/.exec(n.periodValue || '')
    return m ? `${n.namHoc}|Tháng|Tháng ${m[1]}` : pkeyOf(n)
  }

  // ---- Track snapshots (theo GV) ----
  const getSt = (tid, rid) => {
    const s = S.snaps[pkey]
    return (s && s[tid] && s[tid][rid]) ? s[tid][rid] : { status: '—', note: '' }
  }
  const setSt = (tid, rid, k, v) => set(n => {
    const cell = snapAt(n, tid, rid)
    if (cell.status === undefined) { cell.status = '—'; cell.note = '' }
    cell[k] = v
  })

  // ---- Class snapshots (theo lớp: canvas | vo) — có % hoàn thành (pct) cho canvas ----
  const getCls = (mang, lop) => {
    const s = S.snaps[pkey]
    return (s && s.cls && s.cls[mang] && s.cls[mang][lop]) ? s.cls[mang][lop] : { st: '—', note: '', done: false, pct: '' }
  }
  const setCls = (mang, lop, k, v) => set(n => {
    const cell = snapAt(n, 'cls', mang, lop)
    if (cell.st === undefined) { cell.st = '—'; cell.note = ''; cell.done = false; cell.pct = '' }
    cell[k] = v
  })
  const toggleClsDone = (mang, lop) => {
    const cur = getCls(mang, lop); const nd = !cur.done
    set(n => {
      const cell = snapAt(n, 'cls', mang, lop)
      if (cell.st === undefined) { cell.st = '—'; cell.note = ''; cell.done = false; cell.pct = '' }
      cell.done = nd
      if (nd) cell.st = 'Đã điền'
    })
  }
  const isConflict = (mang, lop) => {
    const c = getCls(mang, lop)
    return c.done === true && (c.st === 'Chưa điền' || c.st === 'Điền thiếu/sai')
  }
  // MỘT nguồn phân công duy nhất: Canvas/Vở theo lớp lấy từ S.assign (môn KHTN).
  const cvAssign = () => {
    const rows = (S.assign || []).filter(a => a.mon === 'KHTN').map(a => ({ lop: a.lop, gv: a.gv, khoi: a.lop[0] }))
    return rows.length ? rows : (S.classAssign || [])
  }

  const conflicts = () => {
    const out = []
    for (const m of ['canvas', 'vo'])
      for (const a of cvAssign())
        if (isConflict(m, a.lop)) out.push({ mang: m, lop: a.lop, gv: a.gv, c: getCls(m, a.lop) })
    return out
  }

  // ---- Chấm vở theo Lớp × Môn (LUÔN lưu theo kỳ Tháng) ----
  const getMon = (lop, mon) => {
    const s = S.snaps[monKeyOf(S)]
    const k = `${lop}|${mon}`
    return (s && s.mon && s.mon[k]) ? s.mon[k] : { st: '—', note: '' }
  }
  const setMonSt = (lop, mon, k, v) => set(n => {
    const cell = snapAtKey(n, monKeyOf(n), 'mon', `${lop}|${mon}`)
    if (cell.st === undefined) { cell.st = '—'; cell.note = '' }
    cell[k] = v
  })

  // ---- Số liệu LEAD / Dự giờ theo GV (kind: 'lead' | 'dugio') ----
  const NUM_DEF = { lead: { dk: '', th: '', dks: '', ths: '' }, dugio: { dk: '', th: '', lk: '' } }
  const getNum = (kind, rid) => {
    const s = S.snaps[pkey]
    return (s && s.num && s.num[kind] && s.num[kind][rid]) ? s.num[kind][rid] : { ...NUM_DEF[kind] }
  }
  const setNum = (kind, rid, k, v) => set(n => {
    const cell = snapAt(n, 'num', kind, rid)
    if (cell[k] === undefined && Object.keys(cell).length === 0) Object.assign(cell, NUM_DEF[kind])
    cell[k] = v === '' ? '' : Math.max(0, +v || 0)
  })

  // ---- Deadlines gộp (weekly + mốc + sự kiện có ngày) ----
  const allDeadlines = () => {
    const out = []
    S.weekly.filter(w => w.on).forEach(w => {
      const d = nextDow(w.dow)
      out.push({ name: w.name, when: d, label: WD[w.dow] + (w.time ? ' ' + w.time : ''), kind: 'Lặp tuần', n: daysTo(d), u: w.u || '', id: w.id, src: 'w' })
    })
    S.deadlines.forEach(x => {
      if (x.date) { const d = new Date(x.date + 'T00:00:00'); out.push({ name: x.name, when: d, label: d.toLocaleDateString('vi-VN'), kind: 'Mốc', n: daysTo(d), note: x.note, u: x.u || '', id: x.id, src: 'd' }) }
      else out.push({ name: x.name, when: null, label: '(chưa đặt ngày)', kind: 'Mốc', n: 9999, note: x.note, u: x.u || '', id: x.id, src: 'd' })
    })
    S.events.forEach(x => {
      if (x.date) { const d = new Date(x.date + 'T00:00:00'); out.push({ name: '🏆 ' + x.ten, when: d, label: d.toLocaleDateString('vi-VN'), kind: 'Sự kiện', n: daysTo(d), u: x.u || '', id: x.id, src: 'e' }) }
    })
    return out.sort((a, b) => a.n - b.n)
  }

  // ---- PHÂN QUYỀN (Supabase Auth email + mật khẩu) ----
  // role 'admin' cho tab-visibility khi vai ∈ {tp,tt,bgh}; 'view' cho GV/chưa đăng nhập.
  const role = (session && EDITOR_ROLES.includes(profileRole)) ? 'admin' : 'view'
  const isAdmin = role === 'admin'
  const isAdminRef = useRef(false)
  useEffect(() => { isAdminRef.current = isAdmin }, [isAdmin])

  const fetchRole = async (uid) => {
    if (!supabase || !uid) { setProfileRole(''); return }
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', uid).single()
      setProfileRole((data && data.role) || 'gv')
    } catch { setProfileRole('gv') }
  }

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      if (data.session) fetchRole(data.session.user.id)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess || null)
      if (sess) fetchRole(sess.user.id); else setProfileRole('')
    })
    return () => { try { sub.subscription.unsubscribe() } catch (e) { /* ignore */ } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email, password) => {
    if (!supabase) throw new Error('Chưa cấu hình Supabase (thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')
    const { data, error } = await supabase.auth.signInWithPassword({ email: (email || '').trim(), password: password || '' })
    if (error) throw new Error(/invalid login/i.test(error.message) ? 'Sai email hoặc mật khẩu' : error.message)
    await fetchRole(data.user.id)
    return true
  }
  const logout = async () => { try { if (supabase) await supabase.auth.signOut() } finally { setSession(null); setProfileRole('') } }

  // ---- ĐỒNG BỘ (Supabase bảng app_state) ----
  const cloudPull = async () => {
    if (!supabase) throw new Error('Chưa cấu hình Supabase.')
    const { data, error } = await supabase.from('app_state').select('data, updated_at').eq('id', 1).single()
    if (error) throw new Error(error.message)
    if (data && data.data && data.data.weekly) replaceAll(data.data)
    return data && data.updated_at ? new Date(data.updated_at).toLocaleString('vi-VN') : ''
  }
  const cloudPush = async () => {
    if (!supabase) throw new Error('Chưa cấu hình Supabase.')
    if (!session) throw new Error('Cần đăng nhập để lưu.')
    if (!isAdmin) throw new Error('Vai của bạn (' + (profileRole || 'gv') + ') không có quyền lưu.')
    const { error } = await supabase.from('app_state')
      .update({ data: S, updated_at: new Date().toISOString(), updated_by: session.user.email }).eq('id', 1)
    if (error) throw new Error(error.message)
    supabase.from('audit_log').insert({ actor: session.user.email, role: profileRole, action: 'save', target: 'app_state', summary: 'Lưu dữ liệu chung' }).then(() => {}, () => {})
    return new Date().toLocaleString('vi-VN')
  }

  // Tự tải + realtime khi có Supabase. Người XEM tự cập nhật khi có thay đổi;
  // người SỬA (isAdmin) không bị đè khi đang nhập dở (chủ động bấm Tải nếu cần).
  useEffect(() => {
    if (!supabase) return
    cloudPull().catch(() => {})
    const ch = supabase.channel('app_state_rt')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_state' }, (payload) => {
        if (!isAdminRef.current && payload.new && payload.new.data && payload.new.data.weekly) replaceAll(payload.new.data)
      }).subscribe()
    return () => { try { supabase.removeChannel(ch) } catch (e) { /* ignore */ } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const val = {
    S, set, replaceAll, role, isAdmin, session, profileRole, hasSupabase,
    login, logout, me, setMe, gvFilter, setGvFilter, theme, toggleTheme,
    cloudPull, cloudPush,
    pkey, getSt, setSt, getCls, setCls, toggleClsDone, isConflict, conflicts, allDeadlines, cvAssign,
    getMon, setMonSt, getNum, setNum,
    GOOD, NOTYET
  }
  return <Ctx.Provider value={val}>{children}</Ctx.Provider>
}

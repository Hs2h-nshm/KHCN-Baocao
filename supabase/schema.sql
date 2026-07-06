-- =====================================================================
--  KHCN-DIEU-HANH · Supabase schema + RLS  (MVP JSON blob)
--  Chạy 1 lần trong Supabase → SQL Editor → New query → Run.
--  Vai: gv (mặc định, chỉ xem) · bgh · tt (tổ trưởng) · tp (tổ phó, full)
-- =====================================================================

-- 1) profiles: gắn vai cho mỗi tài khoản đăng nhập ------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'gv' check (role in ('gv','bgh','tt','tp')),
  created_at timestamptz default now()
);

-- Tự tạo profile khi có user mới (mặc định vai 'gv'; TP sửa vai sau)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'gv')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Hàm lấy vai của user hiện tại (dùng trong RLS)
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'gv')
$$;

-- 2) app_state: 1 dòng JSON CÔNG KHAI (GV xem không cần đăng nhập) --------------
create table if not exists public.app_state (
  id         int primary key default 1,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by text,
  constraint app_state_singleton check (id = 1)
);
insert into public.app_state (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- 3) private_state: dữ liệu NHẠY CẢM (ghi chú họp, mục BGH...) cần đăng nhập ----
create table if not exists public.private_state (
  id         int primary key default 1,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by text,
  constraint private_state_singleton check (id = 1)
);
insert into public.private_state (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- 4) audit_log: ai-làm-gì-lúc-nào --------------------------------------------------
create table if not exists public.audit_log (
  id      bigint generated always as identity primary key,
  actor   text,            -- email người, hoặc 'agent:openclaw'
  role    text,
  action  text,            -- 'save' | 'delete' | 'agent_push'
  target  text,
  summary text,
  at      timestamptz default now()
);

-- =====================================================================
--  RLS (bảo mật tại tầng database — không bypass được ở trình duyệt)
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.app_state     enable row level security;
alter table public.private_state enable row level security;
alter table public.audit_log     enable row level security;

-- profiles: xem chính mình (TP xem/sửa hết)
drop policy if exists prof_self  on public.profiles;
drop policy if exists prof_admin on public.profiles;
create policy prof_self  on public.profiles for select
  using (id = auth.uid() or public.my_role() = 'tp');
create policy prof_admin on public.profiles for all
  using (public.my_role() = 'tp') with check (public.my_role() = 'tp');

-- app_state: AI CŨNG ĐỌC (kể cả chưa đăng nhập); chỉ tp/tt/bgh được GHI
drop policy if exists app_read  on public.app_state;
drop policy if exists app_write on public.app_state;
create policy app_read  on public.app_state for select using (true);
create policy app_write on public.app_state for update
  using (public.my_role() in ('tp','tt','bgh'))
  with check (public.my_role() in ('tp','tt','bgh'));

-- private_state: chỉ người đã đăng nhập mới đọc; ghi tp/tt/bgh
drop policy if exists priv_read  on public.private_state;
drop policy if exists priv_write on public.private_state;
create policy priv_read  on public.private_state for select
  using (auth.role() = 'authenticated');
create policy priv_write on public.private_state for update
  using (public.my_role() in ('tp','tt','bgh'))
  with check (public.my_role() in ('tp','tt','bgh'));

-- audit_log: tp/tt/bgh xem; người đã đăng nhập được chèn (khi lưu). Agent chèn qua service_role (bỏ qua RLS).
drop policy if exists audit_read   on public.audit_log;
drop policy if exists audit_insert on public.audit_log;
create policy audit_read   on public.audit_log for select
  using (public.my_role() in ('tp','tt','bgh'));
create policy audit_insert on public.audit_log for insert
  with check (auth.role() = 'authenticated');

-- =====================================================================
--  SAU KHI "Add user" trong Authentication, chạy các lệnh dưới để gán vai
--  (đổi email cho đúng). GV KHÔNG cần tài khoản.
--    update public.profiles set role='tp'  where email='tophchcn@...';   -- tổ phó (full)
--    update public.profiles set role='tt'  where email='totruong@...';   -- tổ trưởng
--    update public.profiles set role='bgh' where email='bgh@...';        -- BGH
--
--  LƯU Ý (mô hình JSON blob): "xóa sự kiện" thực chất là UPDATE app_state.data,
--  nên tầng DB chỉ phân biệt được ĐỌC vs GHI; phân biệt "sửa" vs "xóa" là do
--  giao diện app kiểm soát theo vai. Muốn ép "xóa" ở tầng DB thì cần tách bảng
--  quan hệ (giai đoạn sau).
-- =====================================================================

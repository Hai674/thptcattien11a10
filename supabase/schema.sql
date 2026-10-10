-- ========================================================
-- SCHEMA DATABASE SUPABASE CHO WEBSITE LỚP 11A10 THPT CÁT TIÊN
-- Chạy đoạn mã SQL này tại: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- (Đã hỗ trợ DROP POLICY IF EXISTS để chạy lại bao nhiêu lần cũng không báo lỗi)
-- ========================================================

-- 1. BẢNG HỒ SƠ TÀI KHOẢN (PROFILES) LIÊN KẾT VỚI SUPABASE AUTH
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  photo_url text,
  role text default 'member' check (role in ('admin', 'member')),
  class_id text default '11A10',
  status text default 'active' check (status in ('active', 'pending', 'blocked')),
  phone_number text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tự động kích hoạt toàn bộ tài khoản hiện tại
update public.profiles set status = 'active' where status = 'pending';

-- Bật RLS (Row Level Security) cho bảng profiles
alter table public.profiles enable row level security;

-- Policies cho profiles
drop policy if exists "Mọi người có thể xem hồ sơ học sinh" on public.profiles;
create policy "Mọi người có thể xem hồ sơ học sinh"
  on public.profiles for select
  using (true);

drop policy if exists "Người dùng có thể cập nhật hồ sơ của mình" on public.profiles;
create policy "Người dùng có thể cập nhật hồ sơ của mình"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Cho phép tạo hồ sơ khi đăng ký" on public.profiles;
create policy "Cho phép tạo hồ sơ khi đăng ký"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. TRIGGER TỰ ĐỘNG TẠO HỒ SƠ KHI ĐĂNG KÝ AUTH MỚI (TỰ ĐỘNG ACTIVE MỌI TÀI KHOẢN)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, photo_url, role, class_id, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    case 
      when new.email = 'admin@11a10.edu.vn' then 'admin' 
      else 'member' 
    end,
    '11A10',
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Đăng ký trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. BẢNG DANH SÁCH HỌC SINH (MEMBERS)
create table if not exists public.members (
  id text primary key,
  full_name text not null,
  role text default 'Thành viên',
  position text default 'Học sinh',
  birth_date text,
  phone text,
  email text,
  quote text,
  hobbies text[],
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.members enable row level security;

drop policy if exists "Cho phép xem danh sách học sinh" on public.members;
create policy "Cho phép xem danh sách học sinh"
  on public.members for select
  using (true);

drop policy if exists "Cho phép cập nhật danh sách học sinh" on public.members;
create policy "Cho phép cập nhật danh sách học sinh"
  on public.members for all
  using (true);

-- 4. BẢNG THÔNG BÁO LỚP HỌC (ANNOUNCEMENTS)
create table if not exists public.announcements (
  id text primary key,
  title text not null,
  content text not null,
  priority text default 'normal' check (priority in ('urgent', 'normal')),
  author_id text default 'admin',
  author_name text default 'Ban Cán Sự 11A10',
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

drop policy if exists "Cho phép đọc thông báo" on public.announcements;
create policy "Cho phép đọc thông báo"
  on public.announcements for select
  using (true);

drop policy if exists "Cho phép ban cán sự quản lý thông báo" on public.announcements;
create policy "Cho phép ban cán sự quản lý thông báo"
  on public.announcements for all
  using (true);

-- 5. BẢNG BÀI ĐĂNG KỶ NIỆM / THƯ VIỆN ẢNH (PHOTO_POSTS)
create table if not exists public.photo_posts (
  id text primary key,
  author_name text not null,
  author_avatar text,
  role text default 'Học sinh 11A10',
  caption text,
  images text[] default '{}',
  likes integer default 1,
  comments jsonb default '[]'::jsonb,
  created_at text not null
);

alter table public.photo_posts enable row level security;

drop policy if exists "Cho phép xem bài đăng kỷ niệm" on public.photo_posts;
create policy "Cho phép xem bài đăng kỷ niệm"
  on public.photo_posts for select
  using (true);

drop policy if exists "Cho phép tương tác bài đăng kỷ niệm" on public.photo_posts;
create policy "Cho phép tương tác bài đăng kỷ niệm"
  on public.photo_posts for all
  using (true);

-- 6. BẢNG THỜI KHÓA BIỂU (TIMETABLES)
create table if not exists public.timetables (
  id text primary key default '11A10',
  class_id text default '11A10',
  schedule jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by text default 'Ban Cán Sự 11A10'
);

alter table public.timetables enable row level security;

drop policy if exists "Cho phép xem thời khóa biểu" on public.timetables;
create policy "Cho phép xem thời khóa biểu"
  on public.timetables for select
  using (true);

drop policy if exists "Cho phép cập nhật thời khóa biểu" on public.timetables;
create policy "Cho phép cập nhật thời khóa biểu"
  on public.timetables for all
  using (true);

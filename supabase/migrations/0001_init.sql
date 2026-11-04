-- ============================================================================
-- NazProject — Initial schema
-- French courses + mathematics e-learning platform
-- Hierarchy: Category -> Level -> Course -> Lesson
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums ----------------------------------------------------------------------
create type user_role    as enum ('student', 'admin');
create type content_status as enum ('draft', 'published');
create type lesson_type  as enum ('article', 'video', 'pdf', 'quiz');
create type entitlement_status as enum ('pending', 'granted', 'revoked');

-- ============================================================================
-- PROFILES  (1:1 with auth.users)
-- ============================================================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        user_role not null default 'student',
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper: is the current user an admin?  (used across RLS policies)
create or replace function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
-- CATALOG:  categories -> levels -> courses -> lessons
-- ============================================================================
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon        text,                       -- emoji or icon key
  color       text default '#4f46e5',     -- accent color for the category card
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create table levels (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name        text not null,              -- e.g. "Primaire", "Collège", "A1"
  slug        text not null,
  description text,
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  unique (category_id, slug)
);

create table courses (
  id            uuid primary key default gen_random_uuid(),
  level_id      uuid not null references levels(id) on delete cascade,
  title         text not null,
  slug          text not null,
  description   text,
  cover_url     text,
  is_premium    boolean not null default false,
  price         numeric(10,2) default 0,   -- TND; display only in Phase 1
  status        content_status not null default 'draft',
  position      int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (level_id, slug)
);

create table lessons (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  title       text not null,
  slug        text not null,
  type        lesson_type not null default 'article',
  -- article: rich HTML/JSON in `content`; video: video_url; pdf: file_url; quiz: see quizzes
  content     text,
  video_url   text,
  file_url    text,
  duration_min int,                        -- optional, for display
  is_premium  boolean not null default false,
  status      content_status not null default 'draft',
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (course_id, slug)
);

-- ============================================================================
-- QUIZZES  (a quiz-type lesson has one quiz with many questions)
-- ============================================================================
create table quizzes (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid not null unique references lessons(id) on delete cascade,
  pass_score    int not null default 50,   -- percent needed to pass
  created_at    timestamptz not null default now()
);

create table quiz_questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references quizzes(id) on delete cascade,
  prompt      text not null,
  explanation text,
  position    int not null default 0
);

create table quiz_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references quiz_questions(id) on delete cascade,
  label       text not null,
  is_correct  boolean not null default false,
  position    int not null default 0
);

-- ============================================================================
-- STUDENT ACTIVITY
-- ============================================================================
create table enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  course_id   uuid not null references courses(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

create table lesson_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  lesson_id     uuid not null references lessons(id) on delete cascade,
  completed     boolean not null default false,
  last_viewed   timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  quiz_id     uuid not null references quizzes(id) on delete cascade,
  score       int not null,               -- percent
  passed      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- ENTITLEMENTS  (premium access — Phase 1: admin grants manually)
-- ============================================================================
create table entitlements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  course_id   uuid not null references courses(id) on delete cascade,
  status      entitlement_status not null default 'pending',
  note        text,                        -- e.g. payment reference
  granted_by  uuid references profiles(id),
  granted_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================================
-- ANALYTICS  (lightweight)
-- ============================================================================
create table page_views (
  id          bigint generated always as identity primary key,
  path        text not null,
  course_id   uuid references courses(id) on delete set null,
  lesson_id   uuid references lessons(id) on delete set null,
  user_id     uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Indexes --------------------------------------------------------------------
create index on levels (category_id);
create index on courses (level_id);
create index on lessons (course_id);
create index on quiz_questions (quiz_id);
create index on quiz_options (question_id);
create index on enrollments (user_id);
create index on lesson_progress (user_id);
create index on entitlements (user_id);
create index on page_views (created_at);
create index on page_views (course_id);

-- updated_at trigger ---------------------------------------------------------
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger courses_touch before update on courses
  for each row execute function touch_updated_at();
create trigger lessons_touch before update on lessons
  for each row execute function touch_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles        enable row level security;
alter table categories      enable row level security;
alter table levels          enable row level security;
alter table courses         enable row level security;
alter table lessons         enable row level security;
alter table quizzes         enable row level security;
alter table quiz_questions  enable row level security;
alter table quiz_options    enable row level security;
alter table enrollments     enable row level security;
alter table lesson_progress enable row level security;
alter table quiz_attempts   enable row level security;
alter table entitlements    enable row level security;
alter table page_views      enable row level security;

-- PROFILES
create policy "own profile read"   on profiles for select using (auth.uid() = id or is_admin());
create policy "own profile update" on profiles for update using (auth.uid() = id);
create policy "admin profile all"  on profiles for all using (is_admin()) with check (is_admin());

-- CATALOG: public can read PUBLISHED content; admins do everything.
create policy "cats public read"   on categories for select using (true);
create policy "cats admin write"   on categories for all using (is_admin()) with check (is_admin());

create policy "levels public read" on levels for select using (true);
create policy "levels admin write" on levels for all using (is_admin()) with check (is_admin());

create policy "courses public read" on courses
  for select using (status = 'published' or is_admin());
create policy "courses admin write" on courses for all using (is_admin()) with check (is_admin());

create policy "lessons public read" on lessons
  for select using (status = 'published' or is_admin());
create policy "lessons admin write" on lessons for all using (is_admin()) with check (is_admin());

-- QUIZ content: readable (gating of premium lessons handled server-side).
create policy "quizzes read"  on quizzes for select using (true);
create policy "quizzes admin" on quizzes for all using (is_admin()) with check (is_admin());
create policy "qq read"       on quiz_questions for select using (true);
create policy "qq admin"      on quiz_questions for all using (is_admin()) with check (is_admin());
-- Hide which option is correct from non-admins at the API level (see server code).
create policy "qo read"       on quiz_options for select using (true);
create policy "qo admin"      on quiz_options for all using (is_admin()) with check (is_admin());

-- ENROLLMENTS: students manage their own; admins see all.
create policy "enroll own read"  on enrollments for select using (auth.uid() = user_id or is_admin());
create policy "enroll own write" on enrollments for insert with check (auth.uid() = user_id);
create policy "enroll own del"   on enrollments for delete using (auth.uid() = user_id or is_admin());

-- PROGRESS: own rows only (admin read for analytics).
create policy "progress own"  on lesson_progress for all
  using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id);

-- QUIZ ATTEMPTS: own rows (admin read).
create policy "attempts own" on quiz_attempts for all
  using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id);

-- ENTITLEMENTS: student can read & request (insert pending) own; admin grants.
create policy "ent own read"    on entitlements for select using (auth.uid() = user_id or is_admin());
create policy "ent own request" on entitlements for insert
  with check (auth.uid() = user_id and status = 'pending');
create policy "ent admin all"   on entitlements for all using (is_admin()) with check (is_admin());

-- PAGE VIEWS: anyone can insert a view; only admins read.
create policy "views insert" on page_views for insert with check (true);
create policy "views admin"  on page_views for select using (is_admin());

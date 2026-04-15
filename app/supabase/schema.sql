-- ========================================================
-- AllThingsCambridge Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================================
-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- ── Profiles ────────────────────────────────────────────
create type user_role as enum ('student', 'admin');
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    role user_role not null default 'student',
    is_subscribed boolean not null default false,
    subscribed_until timestamptz,
    created_at timestamptz not null default now()
);
-- Auto-create profile on signup
create or replace function handle_new_user() returns trigger language plpgsql security definer
set search_path = public as $$ begin
insert into public.profiles (id, full_name)
values (new.id, new.raw_user_meta_data->>'full_name');
return new;
end;
$$;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure handle_new_user();
-- ── Levels ──────────────────────────────────────────────
create table levels (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    description text,
    icon text,
    "order" int not null default 0,
    created_at timestamptz not null default now()
);
-- Seed levels
insert into levels (name, slug, description, icon, "order")
values (
        'Checkpoint',
        'checkpoint',
        'Cambridge Lower Secondary for ages 11-14',
        '📖',
        1
    ),
    (
        'O Level',
        'o-level',
        'Cambridge Upper Secondary for ages 14-16',
        '🎓',
        2
    ),
    (
        'IGCSE',
        'igcse',
        'International General Certificate, ages 14-16',
        '🏆',
        3
    ),
    (
        'A Level',
        'a-level',
        'Cambridge Advanced Level for ages 16-19',
        '⭐',
        4
    );
-- ── Subjects ────────────────────────────────────────────
create table subjects (
    id uuid primary key default uuid_generate_v4(),
    level_id uuid not null references levels(id) on delete cascade,
    name text not null,
    slug text not null,
    description text,
    icon text,
    is_premium boolean not null default false,
    created_at timestamptz not null default now(),
    unique(level_id, slug)
);
-- ── Topics ──────────────────────────────────────────────
create table topics (
    id uuid primary key default uuid_generate_v4(),
    subject_id uuid not null references subjects(id) on delete cascade,
    name text not null,
    slug text not null,
    "order" int not null default 0,
    created_at timestamptz not null default now(),
    unique(subject_id, slug)
);
-- ── Resources ───────────────────────────────────────────
create type resource_type as enum ('note', 'past_paper', 'topical_question');
create table resources (
    id uuid primary key default uuid_generate_v4(),
    subject_id uuid not null references subjects(id) on delete cascade,
    topic_id uuid references topics(id) on delete
    set null,
        type resource_type not null,
        title text not null,
        content text,
        file_url text,
        is_premium boolean not null default false,
        created_at timestamptz not null default now()
);
-- ── Flashcard Decks ─────────────────────────────────────
create table flashcard_decks (
    id uuid primary key default uuid_generate_v4(),
    subject_id uuid not null references subjects(id) on delete cascade,
    topic_id uuid references topics(id) on delete
    set null,
        title text not null,
        is_premium boolean not null default false,
        card_count int not null default 0,
        created_at timestamptz not null default now()
);
-- ── Flashcards ──────────────────────────────────────────
create table flashcards (
    id uuid primary key default uuid_generate_v4(),
    deck_id uuid not null references flashcard_decks(id) on delete cascade,
    front text not null,
    back text not null,
    "order" int not null default 0,
    created_at timestamptz not null default now()
);
-- ── User Flashcard Progress ─────────────────────────────
create type flashcard_status as enum ('learning', 'known');
create table user_flashcard_progress (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references profiles(id) on delete cascade,
    flashcard_id uuid not null references flashcards(id) on delete cascade,
    status flashcard_status not null,
    updated_at timestamptz not null default now(),
    unique(user_id, flashcard_id)
);
-- ── Blog Posts ──────────────────────────────────────────
create table blog_posts (
    id uuid primary key default uuid_generate_v4(),
    author_id uuid references profiles(id) on delete
    set null,
        title text not null,
        slug text unique not null,
        content text,
        cover_image text,
        published boolean not null default false,
        published_at timestamptz,
        created_at timestamptz not null default now()
);
-- ── Forum Posts ─────────────────────────────────────────
create table forum_posts (
    id uuid primary key default uuid_generate_v4(),
    author_id uuid references profiles(id) on delete
    set null,
        title text not null,
        body text not null,
        subject_id uuid references subjects(id) on delete
    set null,
        view_count int not null default 0,
        created_at timestamptz not null default now()
);
-- ── Forum Replies ───────────────────────────────────────
create table forum_replies (
    id uuid primary key default uuid_generate_v4(),
    post_id uuid not null references forum_posts(id) on delete cascade,
    author_id uuid references profiles(id) on delete
    set null,
        body text not null,
        created_at timestamptz not null default now()
);
-- ── Payments ────────────────────────────────────────────
create type payment_status as enum ('pending', 'success', 'failed');
create table payments (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references profiles(id) on delete cascade,
    paystack_reference text unique not null,
    plan text not null,
    amount int not null,
    currency text not null default 'USD',
    status payment_status not null default 'pending',
    created_at timestamptz not null default now()
);
-- ========================================================
-- Row Level Security (RLS)
-- ========================================================
alter table profiles enable row level security;
alter table levels enable row level security;
alter table subjects enable row level security;
alter table topics enable row level security;
alter table resources enable row level security;
alter table flashcard_decks enable row level security;
alter table flashcards enable row level security;
alter table user_flashcard_progress enable row level security;
alter table blog_posts enable row level security;
alter table forum_posts enable row level security;
alter table forum_replies enable row level security;
alter table payments enable row level security;
-- Public read (non-premium content)
create policy "Public can read levels" on levels for
select using (true);
create policy "Public can read subjects" on subjects for
select using (true);
create policy "Public can read topics" on topics for
select using (true);
create policy "Public can read resources" on resources for
select using (
        not is_premium
        or get_active_user_id() is not null
    );
create policy "Public can read decks" on flashcard_decks for
select using (true);
create policy "Public can read flashcards" on flashcards for
select using (true);
create policy "Public can read blog posts" on blog_posts for
select using (published = true);
create policy "Public can read forum posts" on forum_posts for
select using (true);
create policy "Public can read forum replies" on forum_replies for
select using (true);
-- Function to get the current user ID, favoring JWT but falling back to Passkey header
create or replace function get_active_user_id() returns uuid language plpgsql security definer
set search_path = public as $$
declare
  active_user_id uuid;
begin
  active_user_id := auth.uid();
  if active_user_id is null then
    begin
      active_user_id := (current_setting('request.headers', true)::json->>'x-passkey-user')::uuid;
    exception when others then
      active_user_id := null;
    end;
  end if;
  return active_user_id;
end;
$$;

-- Security Definer function to check admin role
create or replace function is_admin() returns boolean language plpgsql security definer
set search_path = public as $$ 
begin
  return (
    select (role = 'admin')
    from public.profiles
    where id = get_active_user_id()
  );
end;
$$;
-- Profiles
create policy "Users can read own profile" on profiles for
select using (get_active_user_id() = id);
create policy "Users can update own profile" on profiles for
update using (get_active_user_id() = id);
create policy "Admins can read all profiles" on profiles for
select using (is_admin());
-- User can write own flashcard progress
create policy "User manages own progress" on user_flashcard_progress for all using (get_active_user_id() = user_id);
-- Users can post to forums
create policy "Auth users can create forum posts" on forum_posts for
insert with check (get_active_user_id() = author_id);
create policy "Auth users can create replies" on forum_replies for
insert with check (get_active_user_id() = author_id);
-- Users can insert their own payments
create policy "Users can insert payments" on payments for
insert with check (get_active_user_id() = user_id);
create policy "Users can read own payments" on payments for
select using (get_active_user_id() = user_id);
-- Admins can do everything
create policy "Admins full access on levels" on levels for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins full access on subjects" on subjects for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins full access on topics" on topics for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins full access on resources" on resources for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins full access on decks" on flashcard_decks for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins full access on flashcards" on flashcards for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins full access on blog" on blog_posts for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins read all payments" on payments for
select using (is_admin());
-- ========================================================
-- Storage bucket
-- ========================================================
-- Run this in Supabase Dashboard > Storage:
-- Create a bucket named "content" and set it to Public.
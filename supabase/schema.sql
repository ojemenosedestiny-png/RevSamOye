-- Run once in the Supabase SQL editor (safe to run again — it only adds what's missing).
-- Row Level Security is enabled with no policies, so only the server (service-role key) can read or write.

-- Counseling bookings ---------------------------------------------------------
create table if not exists public.counseling_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  city text not null,
  counseling_type text not null,
  mode text not null,
  preferred_date date not null,
  preferred_time text not null,
  description text not null,
  consent boolean not null default false,
  status text not null default 'new'
);
alter table public.counseling_requests add column if not exists notes text;
alter table public.counseling_requests add column if not exists updated_at timestamptz;
alter table public.counseling_requests enable row level security;

-- Newsletter ------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique
);
alter table public.newsletter_subscribers enable row level security;

-- Site settings (photos & video chosen in the admin panel) --------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

-- Events managed from the admin panel -----------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  venue text,
  online boolean not null default false,
  online_label text,
  description text not null default '',
  speakers text[] not null default '{}',
  register_url text,
  published boolean not null default true
);
alter table public.events enable row level security;

-- Public storage bucket for uploaded photos and videos ------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

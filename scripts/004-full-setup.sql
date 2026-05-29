-- Mobile Mechanic Booking Platform full setup.
-- Run in Supabase SQL editor. This script is idempotent where practical.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type appointment_status as enum ('pending', 'postponed', 'completed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type review_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create table if not exists service_zip_codes (
  zip_code text primary key check (zip_code ~ '^[0-9]{5}$'),
  created_at timestamptz not null default now()
);

create table if not exists zip_code_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  zip_code text not null check (zip_code ~ '^[0-9]{5}$'),
  created_at timestamptz not null default now(),
  unique (email, zip_code)
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 50),
  last_name text not null check (char_length(last_name) between 1 and 50),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (phone ~ '^[0-9]{10}$'),
  zip_code text not null check (zip_code ~ '^[0-9]{5}$'),
  address text not null,
  additional_info text check (additional_info is null or char_length(additional_info) <= 500),
  appointment_date date not null,
  appointment_time text not null check (appointment_time in ('08:00', '10:00', '12:00', '14:00', '16:00')),
  status appointment_status not null default 'pending',
  vehicle_year text not null check (vehicle_year ~ '^[0-9]{4}$'),
  vehicle_make text not null,
  vehicle_model text not null,
  engine_type text not null,
  service_type text not null,
  referral_source text,
  assigned_mechanic text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists appointments_date_time_unique
on appointments (appointment_date, appointment_time)
where status != 'cancelled';

create table if not exists technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name ~ '^[A-Za-z ''-]{1,50}$'),
  area text,
  phone text not null check (phone ~ '^[0-9]{10}$'),
  join_date date,
  availability text,
  specialties text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (name, phone)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null check (char_length(reviewer_name) between 1 and 100),
  reviewer_email text not null check (reviewer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 1000),
  service_type text,
  status review_status not null default 'pending',
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at
before update on appointments
for each row execute function set_updated_at();

insert into service_zip_codes (zip_code) values
  ('95811'), ('95814'), ('95815'), ('95816'), ('95817'),
  ('95818'), ('95819'), ('95820'), ('95821'), ('95822'),
  ('95823'), ('95825'), ('95826'), ('95827'), ('95828'),
  ('95831'), ('95833'), ('95834'), ('95835'), ('95838')
on conflict (zip_code) do nothing;

alter table service_zip_codes enable row level security;
alter table zip_code_waitlist enable row level security;
alter table appointments enable row level security;
alter table technicians enable row level security;
alter table reviews enable row level security;
alter table admin_users enable row level security;

-- TODO: tighten RLS before production
drop policy if exists "development read service zips" on service_zip_codes;
create policy "development read service zips"
on service_zip_codes for select
using (true);

-- TODO: tighten RLS before production
drop policy if exists "development read approved reviews" on reviews;
create policy "development read approved reviews"
on reviews for select
using (status = 'approved');

-- TODO: tighten RLS before production
drop policy if exists "development insert waitlist" on zip_code_waitlist;
create policy "development insert waitlist"
on zip_code_waitlist for insert
with check (true);

-- Admin/API writes use the Supabase service role key, which bypasses RLS.

-- Create the first admin manually after generating a bcrypt hash, for example:
-- insert into admin_users (email, password_hash)
-- values ('admin@example.com', '$2b$12$replace_with_a_real_bcrypt_hash');

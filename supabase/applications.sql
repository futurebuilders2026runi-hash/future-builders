-- Run in the Supabase SQL editor. Safe to re-run; preserves existing rows.
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  "firstName" text,
  "lastName" text,
  "fullName" text,
  degree text,
  year text,
  phone text,
  email text,
  why text,
  background text,
  "aiExperience" text,
  locale text default 'he',
  kind text default 'application',
  "submittedAt" timestamptz not null default now()
);

-- Accommodate an existing table used by the original application form.
alter table public.applications
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists "firstName" text,
  add column if not exists "lastName" text,
  add column if not exists "fullName" text,
  add column if not exists degree text,
  add column if not exists year text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists why text,
  add column if not exists background text,
  add column if not exists "aiExperience" text,
  add column if not exists locale text default 'he',
  add column if not exists kind text default 'application',
  add column if not exists "submittedAt" timestamptz default now();

-- The old form may have required a "built" answer. The new form uses background.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'applications' and column_name = 'built'
  ) then
    alter table public.applications alter column built drop not null;
  end if;
end $$;

create index if not exists applications_submitted_at_idx
  on public.applications ("submittedAt" desc);

-- Registrations contain private contact information. Only server-side service
-- role access is allowed; never expose an anon/public client to this table.
alter table public.applications enable row level security;
revoke all on public.applications from anon, authenticated;
grant select, insert on public.applications to service_role;

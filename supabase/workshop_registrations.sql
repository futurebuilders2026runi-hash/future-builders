-- Run in the Supabase SQL editor. Safe to re-run; preserves existing rows.
-- Registrations for hands-on workshops (see src/lib/workshop-registrations.ts).
create table if not exists public.workshop_registrations (
  id uuid primary key default gen_random_uuid(),
  workshop text not null,
  "fullName" text not null,
  phone text not null,
  email text not null,
  participation text not null check (participation in ('solo', 'team')),
  "teamMembers" text,
  idea text,
  "aiDaily" text,
  locale text default 'he',
  "submittedAt" timestamptz not null default now()
);

create index if not exists workshop_registrations_workshop_idx
  on public.workshop_registrations (workshop, "submittedAt" desc);

-- Contains private contact details: server-side service role access only.
alter table public.workshop_registrations enable row level security;
revoke all on public.workshop_registrations from anon, authenticated;
grant select, insert on public.workshop_registrations to service_role;

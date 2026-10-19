-- Run in the Supabase SQL editor. Safe to re-run; preserves existing rows.
-- One row per tracked page open / button click (see src/lib/link-events.ts).
create table if not exists public.link_events (
  id bigint generated always as identity primary key,
  slug text not null,
  event text not null check (event in ('view', 'register_click')),
  lang text,
  source text,
  visitor_id text,
  created_at timestamptz not null default now()
);

create index if not exists link_events_slug_created_at_idx
  on public.link_events (slug, created_at desc);

-- Written and read only by the server with the service role key.
alter table public.link_events enable row level security;
revoke all on public.link_events from anon, authenticated;
grant select, insert on public.link_events to service_role;

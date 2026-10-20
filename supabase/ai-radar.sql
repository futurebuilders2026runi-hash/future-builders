-- AI Radar: additive, safe to re-run; does not modify existing site tables.
begin;

do $$
declare entity text;
begin
  foreach entity in array array['news','models','companies','tools','events','categories','sources','jobs','reviews','audit'] loop
    execute format('create table if not exists public.radar_%I (
      id text primary key,
      data jsonb not null check (jsonb_typeof(data) = ''object'' and data->>''id'' = id),
      updated_at timestamptz not null default now()
    )', entity);
    execute format('alter table public.radar_%I enable row level security', entity);
    execute format('revoke all on public.radar_%I from anon, authenticated', entity);
    execute format('grant select, insert, update, delete on public.radar_%I to service_role', entity);
    execute format('create index if not exists radar_%I_status_idx on public.radar_%I ((data->>''status''))', entity, entity);
  end loop;
end $$;

create unique index if not exists radar_news_source_url_idx on public.radar_news ((data->>'sourceUrl'));
create index if not exists radar_news_published_idx on public.radar_news ((data->>'publishedAt') desc);
create index if not exists radar_events_start_idx on public.radar_events ((data->>'startsAt'));
create index if not exists radar_jobs_start_idx on public.radar_jobs ((data->>'startedAt') desc);

-- Distributed lease prevents simultaneous cron/manual imports. Ownership is
-- required to release a lease; a crashed job can be retried after ten minutes.
create table if not exists public.radar_locks (
  name text primary key, owner text not null, expires_at timestamptz not null
);
alter table public.radar_locks enable row level security;
revoke all on public.radar_locks from anon, authenticated;
grant all on public.radar_locks to service_role;

create or replace function public.radar_acquire_lock(lock_owner text)
returns boolean language plpgsql security invoker set search_path = public as $$
declare acquired text;
begin
  insert into public.radar_locks (name, owner, expires_at)
  values ('import', lock_owner, now() + interval '10 minutes')
  on conflict (name) do update set owner = excluded.owner, expires_at = excluded.expires_at
    where radar_locks.expires_at < now()
  returning owner into acquired;
  return coalesce(acquired = lock_owner, false);
end $$;

create or replace function public.radar_release_lock(lock_owner text)
returns void language sql security invoker set search_path = public as $$
  delete from public.radar_locks where name = 'import' and owner = lock_owner;
$$;

revoke all on function public.radar_acquire_lock(text), public.radar_release_lock(text) from public, anon, authenticated;
grant execute on function public.radar_acquire_lock(text), public.radar_release_lock(text) to service_role;

-- Private bucket: uploads require the server's service key. Public image reads
-- are limited to generated image names through /api/radar/media/[name].
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ai-radar-media', 'ai-radar-media', false, 5242880, array['image/webp'])
on conflict (id) do nothing;

-- Existing signed admin sessions are reused. No public authentication table or
-- additional credentials are introduced. All writes go through the server.
notify pgrst, 'reload schema';
commit;

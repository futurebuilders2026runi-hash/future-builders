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

-- Added 26.11.2026: study year and track.
alter table public.workshop_registrations
  add column if not exists degree text,
  add column if not exists year text;

-- Added 26.11.2026: which idea-pool idea was picked (ids match `poolIdeaIds`
-- in src/lib/workshop-schema.ts). Up to 3 registrations per idea.
alter table public.workshop_registrations
  add column if not exists "poolIdea" text;

-- Backfill picks saved before the column existed (stored only as idea text).
update public.workshop_registrations r
set "poolIdea" = m.id
from (values
  ('trip', 'מארגנים חופשה עם חברים', 'Planning a trip with friends'),
  ('secondhand', 'יד שנייה בקמפוס', 'Second-hand on campus'),
  ('food', 'איפה אוכלים היום?', 'Where are we eating today?'),
  ('summaries', 'מאגר סיכומים לסטודנטים', 'Student summaries hub'),
  ('roommates', 'ניהול דירת שותפים', 'Shared apartment manager'),
  ('rides', 'מערכת למציאת טרמפים', 'Campus ride-sharing'),
  ('lostfound', 'מערכת אבדות ומציאות', 'Lost & found'),
  ('scheduler', 'מערכת לתיאום מפגשים קבוצתיים', 'Group meeting scheduler'),
  ('lending', 'מערכת להשאלת ציוד', 'Equipment lending'),
  ('recipes', 'מערכת לניהול מתכונים', 'Recipe manager'),
  ('workout', 'מערכת למציאת שותפים לאימונים', 'Workout partner finder')
) as m(id, he, en)
where r."poolIdea" is null
  and (r.idea = 'מהמאגר: ' || m.he or r.idea = 'From the pool: ' || m.en);

create index if not exists workshop_registrations_workshop_idx
  on public.workshop_registrations (workshop, "submittedAt" desc);

-- Contains private contact details: server-side service role access only.
alter table public.workshop_registrations enable row level security;
revoke all on public.workshop_registrations from anon, authenticated;
grant select, insert on public.workshop_registrations to service_role;

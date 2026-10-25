-- YES CRM : rappels d'agenda (notifications téléphone)
create table if not exists public.crm_push (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  rem_min int not null default 30,
  ua text,
  created_at timestamptz not null default now()
);
alter table public.crm_push enable row level security;
drop policy if exists "push own" on public.crm_push;
create policy "push own" on public.crm_push for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.crm_push_sent (
  key text primary key,
  sent_at timestamptz not null default now()
);
alter table public.crm_push_sent enable row level security;

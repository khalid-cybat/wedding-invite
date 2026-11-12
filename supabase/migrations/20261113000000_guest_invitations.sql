create table public.invitation_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  invitation_token text not null unique check (char_length(invitation_token) >= 32),
  event_ids text[] not null check (
    cardinality(event_ids) > 0
    and event_ids <@ array['manhandi', 'barat', 'walima']::text[]
  ),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.invitation_admins enable row level security;
alter table public.guests enable row level security;

create or replace function public.is_invitation_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.invitation_admins as admin
    where admin.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_invitation_admin() from public;
grant execute on function public.is_invitation_admin() to authenticated;

create policy "Admins can view their own admin record"
  on public.invitation_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Admins can view guests"
  on public.guests
  for select
  to authenticated
  using (public.is_invitation_admin());

create policy "Admins can create guests"
  on public.guests
  for insert
  to authenticated
  with check (public.is_invitation_admin());

create policy "Admins can update guests"
  on public.guests
  for update
  to authenticated
  using (public.is_invitation_admin())
  with check (public.is_invitation_admin());

revoke all on public.invitation_admins from anon, authenticated;
grant select on public.invitation_admins to authenticated;
revoke all on public.guests from anon, authenticated;
grant select, insert, update on public.guests to authenticated;

create or replace function public.get_guest_invitation(p_invitation_token text)
returns table (guest_name text, event_ids text[])
language sql
stable
security definer
set search_path = ''
as $$
  select guest.name, guest.event_ids
  from public.guests as guest
  where guest.invitation_token = p_invitation_token
    and guest.active;
$$;

revoke all on function public.get_guest_invitation(text) from public;
grant execute on function public.get_guest_invitation(text) to anon, authenticated;

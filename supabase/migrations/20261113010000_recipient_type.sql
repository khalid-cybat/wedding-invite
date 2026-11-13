alter table public.guests
  add column if not exists recipient_type text not null default 'guest';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.guests'::regclass
      and conname = 'guests_recipient_type_check'
  ) then
    alter table public.guests
      add constraint guests_recipient_type_check
      check (recipient_type in ('guest', 'group'));
  end if;
end;
$$;

drop function if exists public.get_guest_invitation(text);

create function public.get_guest_invitation(p_invitation_token text)
returns table (guest_name text, recipient_type text, event_ids text[])
language sql
stable
security definer
set search_path = ''
as $$
  select guest.name, guest.recipient_type, guest.event_ids
  from public.guests as guest
  where guest.invitation_token = p_invitation_token
    and guest.active;
$$;

revoke all on function public.get_guest_invitation(text) from public;
grant execute on function public.get_guest_invitation(text) to anon, authenticated;

notify pgrst, 'reload schema';

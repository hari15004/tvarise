-- Website content overrides used by the /admin editor.
-- Apply once in the Supabase SQL Editor before using the admin panel.

create table if not exists public.cms_content (
  collection text not null check (collection in ('site', 'home', 'services', 'team', 'projects', 'building')),
  slug text not null,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (collection, slug)
);

alter table public.cms_content enable row level security;

create or replace function public.is_tvarise_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_tvarise_admin() from public, anon, authenticated;
grant execute on function public.is_tvarise_admin() to authenticated;

create or replace function public.prevent_profile_role_self_promotion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    if tg_op = 'INSERT' and new.role = 'admin' then
      raise exception 'Profile roles cannot be assigned by the account owner';
    end if;
    if tg_op = 'UPDATE' and new.role is distinct from old.role then
      raise exception 'Profile roles cannot be changed by the account owner';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_self_promotion on public.profiles;
create trigger prevent_profile_role_self_promotion
  before insert or update of role on public.profiles
  for each row execute function public.prevent_profile_role_self_promotion();
revoke all on function public.prevent_profile_role_self_promotion() from public, anon, authenticated, service_role;

create or replace function public.get_public_cms_content(target_collection text)
returns table (slug text, content jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.slug,
    case
      when c.content ->> 'deleted' = 'true'
        or c.content ->> 'published' = 'false'
      then jsonb_build_object('deleted', true)
      else c.content
    end
  from public.cms_content as c
  where c.collection = target_collection;
$$;

revoke all on function public.get_public_cms_content(text) from public;
grant execute on function public.get_public_cms_content(text) to anon, authenticated;

drop policy if exists "Admins can read website content" on public.cms_content;
create policy "Admins can read website content"
  on public.cms_content for select
  to authenticated
  using ((select public.is_tvarise_admin()));

drop policy if exists "Admins can insert website content" on public.cms_content;
create policy "Admins can insert website content"
  on public.cms_content for insert
  to authenticated
  with check ((select public.is_tvarise_admin()));

drop policy if exists "Admins can update website content" on public.cms_content;
create policy "Admins can update website content"
  on public.cms_content for update
  to authenticated
  using ((select public.is_tvarise_admin()))
  with check ((select public.is_tvarise_admin()));

drop policy if exists "Admins can delete website content" on public.cms_content;
create policy "Admins can delete website content"
  on public.cms_content for delete
  to authenticated
  using ((select public.is_tvarise_admin()));

grant select on public.cms_content to authenticated;
grant insert, update, delete on public.cms_content to authenticated;

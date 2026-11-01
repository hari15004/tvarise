create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  email text not null check (
    char_length(email) between 3 and 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  request text not null check (char_length(request) between 1 and 3000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.contact_inquiries enable row level security;

drop policy if exists "Public can submit contact inquiries" on public.contact_inquiries;
create policy "Public can submit contact inquiries"
  on public.contact_inquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read contact inquiries" on public.contact_inquiries;
create policy "Admins can read contact inquiries"
  on public.contact_inquiries for select
  to authenticated
  using ((select public.is_tvarise_admin()));

drop policy if exists "Admins can mark contact inquiries read" on public.contact_inquiries;
create policy "Admins can mark contact inquiries read"
  on public.contact_inquiries for update
  to authenticated
  using ((select public.is_tvarise_admin()))
  with check ((select public.is_tvarise_admin()));

grant insert on public.contact_inquiries to anon, authenticated;
grant select, update on public.contact_inquiries to authenticated;

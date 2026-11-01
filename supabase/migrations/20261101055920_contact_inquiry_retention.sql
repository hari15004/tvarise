create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at);

select cron.schedule(
  'delete-expired-contact-inquiries',
  '0 * * * *',
  $job$
    delete from public.contact_inquiries
    where created_at < now() - interval '10 days';
  $job$
);

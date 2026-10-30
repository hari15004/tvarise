# Website admin

The admin console at `/admin` edits the live content used by the website: site settings, homepage copy, services, projects, team members, and currently-building items. Collection records can be added, unpublished, or removed. The editor accepts JSON so every content field in the current data model can be changed; layout code, styling, and application behavior are not editable content.

## One-time setup

1. Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured in the app environment.
2. Apply the migrations in order: [`20261030_admin_content.sql`](../supabase/migrations/20261030_admin_content.sql), then [`20261030_lock_down_admin_helpers.sql`](../supabase/migrations/20261030_lock_down_admin_helpers.sql). The connected production project already has both migrations.
3. Create/sign up the intended admin user through Supabase Auth and ensure that user has a row in `public.profiles`.
4. Promote that account using its actual email:

   ```sql
   update public.profiles as p
   set role = 'admin'
   from auth.users as u
   where p.id = u.id
     and u.email = 'YOUR_ADMIN_EMAIL';
   ```

5. Sign in at `/login`, then open `/admin`.

The client uses only the Supabase anon key. Server actions verify the signed-in user's `profiles.role`, and database row-level security independently restricts writes to admins. Never add a service-role key to the app.

The migration also prevents an authenticated account from changing its own profile role. Promote admins only through the trusted Supabase SQL Editor as shown above.

## Editing

- Edit the JSON document and save it. The server validates the document structure before writing.
- Keep each collection item's `slug` identical to the record slug; use lowercase letters, numbers, and hyphens.
- Set `published` to `false` to keep a record as a draft. Removing a content-file-backed record creates a database tombstone so it remains removed after deploys.
- Media values are existing paths or URLs; this version does not upload files.
- The original JSON files remain as defaults/fallbacks. Admin overrides persist in Supabase across deployments.

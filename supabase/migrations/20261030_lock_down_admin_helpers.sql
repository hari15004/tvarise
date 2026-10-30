-- Supabase applies default function grants to API roles; explicitly minimize
-- helper access while retaining the authenticated RPC call used by RLS.
revoke all on function public.is_tvarise_admin() from public, anon, authenticated;
grant execute on function public.is_tvarise_admin() to authenticated;

-- Trigger functions are invoked by the trigger and should not be API-callable.
revoke all on function public.prevent_profile_role_self_promotion()
  from public, anon, authenticated, service_role;

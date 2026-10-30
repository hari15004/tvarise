import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { getMember } from "./content";
import type { TeamMember } from "./types";

// Public read, cache hota hai. Save ke baad tag "member-<slug>" se refresh hota hai.
// JSON sirf structure ke liye (slug, order, etc). Content Supabase se aata hai.
export async function getMemberLive(slug: string): Promise<TeamMember | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`member-${slug}`);

  const base = await getMember(slug);
  if (!base) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return base;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return base;

  return {
    ...base,
    name: data.name || base.name,
    role: data.role_title || base.role,
    shortLine: data.short_line || base.shortLine,
    bio: data.bio || base.bio,
    portrait: data.portrait || base.portrait || null,
    links: Array.isArray(data.links) ? data.links : base.links,
    skills: Array.isArray(data.skills) ? data.skills : base.skills ?? [],
    email: data.email || base.email,
    available: data.available ?? base.available,
    work: Array.isArray(data.work) ? data.work : base.work ?? [],
  };
}

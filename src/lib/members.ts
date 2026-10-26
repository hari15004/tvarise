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

  const base = getMember(slug);
  if (!base) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return base;

  return {
    ...base,
    name: data.name || base.name,
    role: data.role_title,
    shortLine: data.short_line,
    bio: data.bio,
    portrait: data.portrait || null,
    links: Array.isArray(data.links) ? data.links : [],
    skills: data.skills ?? [],
    email: data.email,
    available: data.available,
    work: Array.isArray(data.work) ? data.work : [],
  };
}

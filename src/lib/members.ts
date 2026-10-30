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
  const { data: cmsContent, error: cmsError } = await supabase
    .rpc("get_public_cms_content", { target_collection: "team" })
    .eq("slug", slug)
    .maybeSingle();
  if (cmsError) throw new Error(`Could not load team content for "${slug}": ${cmsError.message}`);
  if (cmsContent) return base;

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

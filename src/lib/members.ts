import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { getMember } from "./content";
import type { TeamMember } from "./types";

// Public read: cookies nahi use hoti, isliye cache ho sakta hai.
// Save ke baad hum tag "member-<slug>" se cache refresh karenge.
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
    role: data.role_title || base.role,
    bio: data.bio || base.bio,
    skills: data.skills?.length ? data.skills : base.skills,
    email: data.email || base.email,
    available: data.available,
    work: data.work?.length ? data.work : base.work,
  };
}

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createClient as createSessionClient } from "./supabase/server";
import type {
  BuildingItem,
  CollectionItem,
  HomeContent,
  Project,
  CmsCollection,
  CmsDocument,
  Service,
  SiteSettings,
  TeamMember,
} from "./types";

// Server-only: JSON remains the source of defaults; Supabase stores admin edits.
const CONTENT_DIR = path.join(process.cwd(), "content");
const CMS_TABLE = "cms_content";
type CmsOverride = { slug: string; content: Record<string, unknown> };

function readJson<T>(file: string): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch (err) {
    throw new Error(`Content error in ${file}: ${(err as Error).message}`);
  }
}

function readCollectionFiles<T extends CollectionItem>(folder: string): T[] {
  const dir = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const file = path.join(dir, f);
      const item = readJson<T>(file);
      if (typeof item.slug !== "string" || typeof item.order !== "number") {
        throw new Error(`Content error in ${file}: "slug" (text) and "order" (number) are required.`);
      }
      return item;
    })
    .sort((a, b) => a.order - b.order);
}

function getCmsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

async function getOverrides(collection: string): Promise<CmsOverride[]> {
  const client = getCmsClient();
  if (!client) return [];

  const { data, error } = await client.rpc("get_public_cms_content", {
    target_collection: collection,
  });
  if (error) {
    throw new Error(`Could not load admin content for "${collection}": ${error.message}`);
  }
  return (data ?? []) as CmsOverride[];
}

async function getDocument<T>(collection: "site" | "home", file: string): Promise<T> {
  const base = readJson<T>(path.join(CONTENT_DIR, file));
  const overrides = await getOverrides(collection);
  const override = overrides.find((item) => item.slug === "singleton");
  return override?.content && typeof override.content === "object"
    ? ({ ...base, ...override.content } as T)
    : base;
}

async function getCollection<T extends CollectionItem>(
  folder: string,
  collection: string
): Promise<T[]> {
  const items = new Map(readCollectionFiles<T>(folder).map((item) => [item.slug, item]));
  const overrides = await getOverrides(collection);

  for (const row of overrides) {
    if (row.content?.deleted === true) {
      items.delete(row.slug);
    } else if (row.content && typeof row.content === "object") {
      const base = items.get(row.slug);
      items.set(row.slug, { ...base, ...row.content } as T);
    }
  }

  return [...items.values()]
    .filter((item) => item.published !== false)
    .sort((a, b) => a.order - b.order);
}

export async function getSite(): Promise<SiteSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms-site");
  const site = await getDocument<SiteSettings>("site", "site.json");
  return {
    ...site,
    contactEmail: site.contactEmail === "placeholder@example.com" ? "hey@tvarise.com" : site.contactEmail,
    social: site.social.length > 0
      ? site.social
      : ["Instagram", "LinkedIn", "Facebook"].map((label) => ({ label, href: "" })),
  };
}

export async function getHome(): Promise<HomeContent> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms-home");
  return getDocument<HomeContent>("home", "home.json");
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms-services");
  return getCollection<Service>("services", "services");
}

export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms-team");
  const team = await getCollection<TeamMember>("team", "team");
  const client = getCmsClient();
  if (!client || team.length === 0) return team;

  const { data, error } = await client
    .from("members")
    .select("slug, name, role_title, short_line, bio, portrait, links, skills, email, available, work");
  if (error) throw new Error(`Could not load team profiles: ${error.message}`);

  const profiles = new Map((data ?? []).map((member) => [member.slug, member]));
  return team.map((member) => {
    const profile = profiles.get(member.slug);
    if (!profile) return member;
    return {
      ...member,
      name: profile.name || member.name,
      role: profile.role_title || member.role,
      shortLine: profile.short_line || member.shortLine,
      bio: profile.bio || member.bio,
      portrait: profile.portrait || member.portrait || null,
      links: Array.isArray(profile.links) ? profile.links : member.links,
      skills: Array.isArray(profile.skills) ? profile.skills : member.skills ?? [],
      email: profile.email || member.email,
      available: profile.available ?? member.available,
      work: Array.isArray(profile.work) ? profile.work : member.work ?? [],
    };
  });
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms-projects");
  return getCollection<Project>("projects", "projects");
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter(
    (project) => project.featured && !project.placeholder && !project.inProgress
  );
}

export async function getBuildingItems(): Promise<BuildingItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms-building");
  return getCollection<BuildingItem>("building", "building");
}

export async function getMember(slug: string): Promise<TeamMember | null> {
  return (await getTeam()).find((member) => member.slug === slug) ?? null;
}

export async function getAdminContentSnapshot(): Promise<CmsDocument[]> {
  const collections: CmsCollection[] = ["services", "team", "projects", "building"];
  const supabase = await createSessionClient();
  const { data, error } = await supabase.from(CMS_TABLE).select("collection, slug, content");
  if (error) throw new Error(`Could not load admin content: ${error.message}`);
  const rows = data ?? [];

  const getSingleton = <T>(collection: "site" | "home", file: string) => {
    const base = readJson<T>(path.join(CONTENT_DIR, file));
    const override = rows.find((row) => row.collection === collection && row.slug === "singleton");
    return override?.content && typeof override.content === "object"
      ? ({ ...base, ...override.content } as T)
      : base;
  };
  const entries = collections.map((collection) => {
    const items = new Map(
      readCollectionFiles<CollectionItem>(collection).map((item) => [item.slug, item])
    );
    for (const row of rows.filter((entry) => entry.collection === collection)) {
      if (row.content?.deleted === true) {
        items.delete(row.slug);
      } else if (row.content && typeof row.content === "object") {
        items.set(row.slug, { ...items.get(row.slug), ...row.content } as CollectionItem);
      }
    }
    return [...items.values()].map((item) => ({
      collection,
      slug: item.slug,
      content: item as unknown as Record<string, unknown>,
    }));
  });
  const site = getSingleton<SiteSettings>("site", "site.json");
  const home = getSingleton<HomeContent>("home", "home.json");

  return [
    { collection: "site", slug: "singleton", content: site as unknown as Record<string, unknown> },
    { collection: "home", slug: "singleton", content: home as unknown as Record<string, unknown> },
    ...entries.flat(),
  ];
}

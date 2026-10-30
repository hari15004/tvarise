"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminContentSnapshot } from "@/lib/content";
import type { CmsCollection } from "@/lib/types";

const collections: CmsCollection[] = ["site", "home", "services", "team", "projects", "building"];
const entryCollections = new Set<CmsCollection>(["services", "team", "projects", "building"]);

type Link = { label: string; href: string };
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

function isLink(value: unknown): value is Link {
  return isRecord(value) && isString(value.label) && isSafeHref(value.href);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isSafeHref(value: unknown): value is string {
  return (
    isString(value) &&
    (value.startsWith("/") && !value.startsWith("//") ||
      /^(https?:\/\/|mailto:|tel:)/i.test(value))
  );
}

function isCmsCollection(value: unknown): value is CmsCollection {
  return typeof value === "string" && collections.includes(value as CmsCollection);
}

function isValidDocument(collection: CmsCollection, slug: string, value: unknown): value is JsonRecord {
  if (!isRecord(value)) return false;
  if (collection === "site") {
    const pages = value.pages;
    const memberSectionLabels = value.memberSectionLabels;
    return (
      isString(value.name) &&
      isString(value.tagline) &&
      isString(value.accentColor) &&
      /^#[\da-f]{6}$/i.test(value.accentColor) &&
      isString(value.heroTitle) &&
      isString(value.heroSubtitle) &&
      isString(value.heroTagline) &&
      isString(value.heroWorkLabel) &&
      isString(value.viewProjectLabel) &&
      isString(value.scrollLabel) &&
      isString(value.contactEmail) &&
      isString(value.footerContactLabel) &&
      isString(value.socialLabel) &&
      isRecord(memberSectionLabels) &&
      ["about", "skills", "work", "links"].every((key) =>
        isString(memberSectionLabels[key])
      ) &&
      Array.isArray(value.nav) &&
      value.nav.every(isLink) &&
      isLink(value.cta) &&
      Array.isArray(value.social) &&
      value.social.every((item) =>
        isRecord(item) &&
        isString(item.label) &&
        (item.href === "" || isSafeHref(item.href))
      ) &&
      (pages === undefined ||
        (isRecord(pages) &&
          ["work", "services", "about", "contact"].every(
            (key) =>
              isRecord(pages[key]) &&
              isString(pages[key].label) &&
              isString(pages[key].title) &&
              isString(pages[key].note)
          )))
    );
  }
  if (collection === "home") {
    const about = value.about;
    const sections = value.sections;
    const sectionOrder = value.sectionOrder;
    const sectionVisibility = value.sectionVisibility;
    return (
      (sectionVisibility === undefined ||
        (isRecord(sectionVisibility) &&
          ["services", "work", "building", "process", "team", "about", "cta"].every(
            (key) => typeof sectionVisibility[key] === "boolean"
          ))) &&
      (sectionOrder === undefined ||
        (Array.isArray(sectionOrder) &&
          sectionOrder.every((key) =>
            ["services", "work", "building", "process", "team", "about", "cta"].includes(
              String(key)
            )
          ) &&
          new Set(sectionOrder).size === sectionOrder.length)) &&
      (sections === undefined ||
        (isRecord(sections) &&
          ["services", "work", "building", "process", "team"].every(
            (key) =>
              isRecord(sections[key]) &&
              isString(sections[key].label) &&
              isString(sections[key].title)
          ))) &&
      isRecord(about) &&
      isString(about.label) &&
      isString(about.title) &&
      isString(about.text) &&
      Array.isArray(value.why) &&
      value.why.every((item) => isRecord(item) && isString(item.title) && isString(item.text)) &&
      Array.isArray(value.process) &&
      value.process.every((item) => isRecord(item) && isString(item.title) && isString(item.text)) &&
      isRecord(value.cta) &&
      isString(value.cta.title) &&
      isString(value.cta.text) &&
      (value.cta.label === undefined || isString(value.cta.label))
    );
  }

  if (
    value.slug !== slug ||
    slug.length > 80 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    typeof value.order !== "number" ||
    (value.published !== undefined && typeof value.published !== "boolean")
  ) {
    return false;
  }

  if (collection === "services") {
    return (
      isString(value.title) &&
      isString(value.summary) &&
      isString(value.pieceId) &&
      (value.published === false ||
        (isNonEmptyString(value.title) && isNonEmptyString(value.pieceId))) &&
      isStringArray(value.includes)
    );
  }
  if (collection === "team") {
    return (
      isString(value.name) &&
      isString(value.role) &&
      isString(value.shortLine) &&
      isString(value.bio) &&
      (value.portrait === null || isString(value.portrait)) &&
      Array.isArray(value.links) &&
      value.links.every(isLink) &&
      isString(value.pieceId) &&
      (value.published === false ||
        (isNonEmptyString(value.name) &&
          isNonEmptyString(value.role) &&
          isNonEmptyString(value.pieceId))) &&
      (value.email === undefined || isString(value.email)) &&
      (value.available === undefined || typeof value.available === "boolean") &&
      (value.skills === undefined || isStringArray(value.skills)) &&
      (value.work === undefined ||
        (Array.isArray(value.work) &&
          value.work.every(
            (item) =>
              isRecord(item) &&
              isString(item.title) &&
              isString(item.summary) &&
              (item.link === undefined || isSafeHref(item.link)) &&
              (item.image === undefined || isString(item.image))
          )))
    );
  }
  if (collection === "projects") {
    return (
      isString(value.title) &&
      (value.year === null || typeof value.year === "number") &&
      isStringArray(value.services) &&
      isStringArray(value.team) &&
      (value.cover === null || isString(value.cover)) &&
      isString(value.summary) &&
      typeof value.featured === "boolean" &&
      (value.inProgress === undefined || typeof value.inProgress === "boolean") &&
      (value.published === false || isNonEmptyString(value.title))
    );
  }
  return (
    isString(value.title) &&
    isString(value.description) &&
    isString(value.status) &&
    isString(value.updatedAt) &&
    (value.published === false ||
      (isNonEmptyString(value.title) && isNonEmptyString(value.status))) &&
    (value.progress === undefined ||
      (typeof value.progress === "number" && value.progress >= 0 && value.progress <= 100))
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { supabase: null, error: "Admin login required hai." };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return { supabase: null, error: "Admin role verify nahi ho paya." };
  if (profile?.role !== "admin") return { supabase: null, error: "Sirf admin content edit kar sakta hai." };
  return { supabase, error: "" };
}

function invalidateContent(collection: CmsCollection) {
  revalidateTag(`cms-${collection}`, "max");
  revalidatePath("/", "layout");
}

export async function saveContentDocument(
  collection: CmsCollection,
  slug: string,
  json: string
): Promise<{ ok: boolean; error: string }> {
  if (!isCmsCollection(collection) || typeof slug !== "string" || typeof json !== "string") {
    return { ok: false, error: "Invalid content request." };
  }
  const access = await requireAdmin();
  if (!access.supabase) return { ok: false, error: access.error };
  if (collection === "site" || collection === "home") {
    if (slug !== "singleton") return { ok: false, error: "Invalid settings record." };
  } else if (
    !entryCollections.has(collection) ||
    slug.length > 80 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    return { ok: false, error: "Slug mein sirf lowercase letters, numbers aur hyphens use karein." };
  }
  if (json.length > 128_000) return { ok: false, error: "Content 128 KB se chhota hona chahiye." };

  let content: unknown;
  try {
    content = JSON.parse(json);
  } catch {
    return { ok: false, error: "JSON valid nahi hai. Syntax check karke dobara save karein." };
  }
  if (!isValidDocument(collection, slug, content)) {
    return { ok: false, error: "Content structure required fields se match nahi karti." };
  }

  const { error } = await access.supabase
    .from("cms_content")
    .upsert({ collection, slug, content }, { onConflict: "collection,slug" });
  if (error) return { ok: false, error: "Save fail hua. Database migration aur admin permissions check karein." };

  invalidateContent(collection);
  return { ok: true, error: "" };
}

export async function getInlineEditorContent(): Promise<
  { ok: true; documents: Awaited<ReturnType<typeof getAdminContentSnapshot>> } |
  { ok: false; error: string }
> {
  const access = await requireAdmin();
  if (!access.supabase) return { ok: false, error: access.error };

  try {
    return { ok: true, documents: await getAdminContentSnapshot() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Website content load nahi ho paya.",
    };
  }
}

export async function deleteContentDocument(
  collection: CmsCollection,
  slug: string
): Promise<{ ok: boolean; error: string }> {
  if (!isCmsCollection(collection) || typeof slug !== "string") {
    return { ok: false, error: "Invalid content request." };
  }
  const access = await requireAdmin();
  if (!access.supabase) return { ok: false, error: access.error };
  if (
    !entryCollections.has(collection) ||
    slug.length > 80 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    return { ok: false, error: "Is content ko delete nahi kar sakte." };
  }

  const { error } = await access.supabase
    .from("cms_content")
    .upsert({ collection, slug, content: { deleted: true } }, { onConflict: "collection,slug" });
  if (error) return { ok: false, error: "Delete fail hua. Database migration aur admin permissions check karein." };

  invalidateContent(collection);
  return { ok: true, error: "" };
}

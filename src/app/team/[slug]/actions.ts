"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Link = { label: string; href: string };
type Work = { title: string; summary: string; link?: string; image?: string };

export async function saveMember(
  slug: string,
  fields: {
    name: string;
    role_title: string;
    short_line?: string;
    bio: string;
    skills: string[];
    email: string;
    available: boolean;
    links?: Link[];
    work?: Work[];
    portfolioUrl?: string;
    portrait: string | null;
  }
) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Login karo pehle." };

  const safeUrl = (u: string) => {
    const value = (u || "").trim().slice(0, 300);
    if (!value) return "";

    try {
      const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
      return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
    } catch {
      return "";
    }
  };

  const clean: Record<string, unknown> = {
    name: (fields.name ?? "").trim().slice(0, 80),
    role_title: (fields.role_title ?? "").trim().slice(0, 120),
    bio: (fields.bio ?? "").trim().slice(0, 2000),
    skills: (fields.skills ?? []).map((s) => s.trim().slice(0, 40)).filter(Boolean).slice(0, 20),
    email: (fields.email ?? "").trim().slice(0, 120),
    available: !!fields.available,
    portrait: safeUrl(fields.portrait ?? ""),
  };

  if (fields.short_line !== undefined) {
    clean.short_line = fields.short_line.trim().slice(0, 160);
  }
  if (fields.links !== undefined) {
    const links = fields.links
      .map((l) => ({ label: l.label.trim().slice(0, 40), href: safeUrl(l.href) }))
      .filter((l) => l.label && l.href)
      .slice(0, 10);
    const portfolioUrl = safeUrl(fields.portfolioUrl ?? "");
    clean.links = portfolioUrl
      ? [...links.filter((link) => link.label.toLowerCase() !== "portfolio"), { label: "Portfolio", href: portfolioUrl }].slice(0, 10)
      : links.filter((link) => link.label.toLowerCase() !== "portfolio");
  }
  if (fields.work !== undefined) {
    clean.work = fields.work
      .map((w) => ({
        title: w.title.trim().slice(0, 100),
        summary: w.summary.trim().slice(0, 500),
        link: safeUrl(w.link || ""),
        image: safeUrl(w.image || ""),
      }))
      .filter((w) => w.title)
      .slice(0, 20);
  }

  if (!clean.name) return { ok: false, error: "Naam khali nahi ho sakta." };

  const { data, error } = await supabase
    .from("members")
    .update(clean)
    .eq("slug", slug)
    .select("slug");

  if (error) return { ok: false, error: "Save nahi hua." };
  if (!data || data.length === 0) return { ok: false, error: "Tumhe ye page edit karne ki permission nahi hai." };

  updateTag(`member-${slug}`);
  updateTag("cms-team");
  return { ok: true, error: "" };
}
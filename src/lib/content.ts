import fs from "node:fs";
import path from "node:path";
import type {
  BuildingItem,
  CollectionItem,
  HomeContent,
  Project,
  Service,
  SiteSettings,
  TeamMember,
} from "./types";

// Server-only: reads the JSON files in /content at build/request time.
const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(file: string): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch (err) {
    throw new Error(`Content error in ${file}: ${(err as Error).message}`);
  }
}

// Reads every .json file in /content/<folder>, drops unpublished items,
// and sorts by `order`. Missing folder = empty list (section can hide itself).
function readCollection<T extends CollectionItem>(folder: string): T[] {
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
    .filter((item) => item.published !== false)
    .sort((a, b) => a.order - b.order);
}

export function getSite(): SiteSettings {
  return readJson<SiteSettings>(path.join(CONTENT_DIR, "site.json"));
}

export const getServices = () => readCollection<Service>("services");
export const getTeam = () => readCollection<TeamMember>("team");
export const getProjects = () => readCollection<Project>("projects");
export const getFeaturedProjects = () => getProjects().filter((p) => p.featured);
export const getBuildingItems = () => readCollection<BuildingItem>("building");

export function getHome(): HomeContent {
  return readJson<HomeContent>(path.join(CONTENT_DIR, "home.json"));
}

export const getMember = (slug: string) => getTeam().find((m) => m.slug === slug) ?? null;

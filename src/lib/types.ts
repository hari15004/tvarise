export type NavItem = { label: string; href: string };

export type SiteSettings = {
  placeholder?: boolean;
  name: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  nav: NavItem[];
  cta: NavItem;
  social: NavItem[];
};

export type CollectionItem = {
  slug: string;
  order: number;
  published?: boolean;
  placeholder?: boolean;
};

export type Service = CollectionItem & {
  title: string;
  summary: string;
  includes: string[];
  pieceId: string;
};

export type TeamMember = CollectionItem & {
  name: string;
  role: string;
  shortLine: string;
  bio: string;
  portrait: string | null;
  links: NavItem[];
  pieceId: string;
};

export type Project = CollectionItem & {
  title: string;
  year: number | null;
  services: string[];
  team: string[];
  cover: string | null;
  summary: string;
  featured: boolean;
  clientName?: string;
};

export type BuildingItem = CollectionItem & {
  title: string;
  description: string;
  status: string;
  progress?: number;
  updatedAt: string;
};

export type HomeContent = {
  placeholder?: boolean;
  about: { label: string; title: string; text: string };
  why: { title: string; text: string }[];
  process: { title: string; text: string }[];
  cta: { title: string; text: string };
};

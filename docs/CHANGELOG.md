# CHANGELOG.md

Meaningful changes only. Format: DATE / VERSION / CHANGE / FILES AFFECTED / REASON / TEST STATUS

---

## 2026-10-30 / v0.4.0
- **Change:** Added a protected `/admin` JSON content manager for global site settings, homepage copy, services, projects, team, and currently-building items. Supabase content overrides are merged with the repository JSON defaults and protected by RLS.
- **Files affected:** `src/app/admin/`, `src/lib/content.ts`, affected App Router pages, `supabase/migrations/20261030_admin_content.sql`, admin/security/decision docs.
- **Reason:** Let admins maintain placeholder and live site content without source edits.
- **Test status:** `npx tsc --noEmit`, `git diff --check`, and `npm run build` passed using the repository JSON fallback. Applied both migrations to the connected Supabase project; confirmed `cms_content` RLS, published-content RPC, and an existing admin profile.

## 2026-10-12 / v0.0.1 (planning)
- **Change:** Specification approved and documentation set created. No code written.
- **Files affected:** `docs/PROJECT_SPEC.md`, `docs/AI_HANDOFF.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/SEO.md`, `docs/SECURITY.md`, `docs/CONTENT.md`, `docs/TESTING.md`, `docs/DEPLOYMENT.md`
- **Reason:** Plan and document the project before any implementation, so future developers (human or AI) can continue safely.
- **Test status:** Not applicable (documentation only).
- **Note:** Applied owner correction: no visible "joining-soon" team slot (see `DECISIONS.md` D-009).

---

## 2026-10-12 / v0.1.0-dev (Foundation step 1)
- **Change:** Added the Foundation: Next.js app layout, design tokens and global styles, navbar with accessible mobile menu, footer, home hero (basic), route stubs for /work /services /team /about /contact, content loader, placeholder content (4 services, 4 team members, 3 projects).
- **Files affected:** `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/{work,services,team,about,contact}/page.tsx`, `src/components/{Navbar,Footer,PageStub}.tsx`, `src/lib/{content,types}.ts`, `content/**`, docs.
- **Reason:** Start the working website (build-first approach).
- **Test status:** NOT RUN. The build environment had no network access, so install, build and lint were not executed. To be verified locally by running `npm run dev`, `npm run build` and `npm run lint`.

---

## 2026-10-12 / v0.2.0-dev (Home Chunk 1: Hero + motion foundation)
- **Change:** Added global motion layer (GSAP + ScrollTrigger, Lenis smooth scroll, scroll reveals, magnetic buttons, desktop cursor ring, tier detection Full/Lite/Static), first-visit intro, cinematic hero (masked word reveal, sticky scroll exit, outlined studio name parallax), placeholder 3D Sculpture (one piece per published team member, assemble, mouse parallax, scroll explode, particles, runtime downgrade), film grain, Static fallback.
- **Files affected:** new `src/motion/*`, `src/three/*`, `src/components/Intro.tsx`, `src/components/hero/*`; changed `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/components/Navbar.tsx`, `src/components/PageStub.tsx`; docs.
- **Reason:** Move from foundation to the cinematic experience (Phase 2/3 start), hero first.
- **Test status:** NOT RUN. No network in the build environment (dependencies not installed, no build/lint/browser test). To be verified locally.
- **New dependencies:** `gsap`, `lenis`, `three`, `@types/three` (dev).

---

## 2026-10-12 / v0.3.0-dev (Home Chunk 2: remaining sections)
- **Change:** Studio renamed Tvarise (placeholder copy). Added Services (bento), Selected Work (clip reveal + image parallax), Currently Building (hides when empty), How We Work (scroll-filled line), Team (cards), About (word-by-word scroll statement + 3 points), Final CTA (Sculpture reassembly, giant wordmark). Added `data-clip` reveals, parallax, process scenes, card spotlight. Automatic section numbering.
- **Files affected:** new `src/components/home/*`, `src/app/home.css`, `src/motion/{scroll,spotlight}.ts`, `content/home.json`; changed `src/app/{layout,page}.tsx`, `src/motion/{state,reveal,MotionProvider}.ts(x)`, `src/three/sculpture.ts`, `src/lib/{types,content}.ts`, `content/site.json`.
- **Reason:** Build the full home page in the reference-inspired structure.
- **Test status:** NOT RUN (no network in the build environment). To be verified locally.

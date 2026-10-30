# DECISIONS.md

Every important decision is recorded here. Never silently change an important architectural decision: add a new entry that supersedes the old one.

Format: DATE / DECISION / WHY / ALTERNATIVES CONSIDERED / CONSEQUENCES

---

## D-001 Experience-first creative portfolio
- **Date:** 2026-10-12
- **Decision:** The site is a high-end creative portfolio where animation and 3D are a core part of the experience, not a normal corporate agency site.
- **Why:** The goal is a memorable "wow" reaction that proves the team's creative level.
- **Alternatives:** Minimal agency site; moderate animation.
- **Consequences:** Heavier motion and 3D work; strict performance, tier and accessibility rules needed to keep it usable.

## D-002 Reference template used for inspiration only
- **Date:** 2026-10-12
- **Decision:** Use the template's animation quality, dark premium feel and interactions as inspiration only. Do not copy its Earth/WebGL scene, branding, copy or structure.
- **Why:** The studio needs its own identity.
- **Alternatives:** Reskin the template.
- **Consequences:** Original hero concept and original layout; template's old pinned Three.js version and shader hacks are not reused.

## D-003 Hero direction: the Sculpture
- **Date:** 2026-10-12
- **Decision:** Hero is a multi-piece 3D sculpture + large typography + particles + scroll choreography. Exact 3D shape is NOT locked and is decided later with the 3D designer. Build begins with placeholder pieces.
- **Why:** Ownable, tells the "team as one studio" story, showcases 3D skill, and launch is not blocked on the final model.
- **Alternatives:** Single signature object, abstract environment, original planet scene, typography-led hybrid only.
- **Consequences:** Needs a Sculpture controller, per-section states, and a generic placeholder piece. Fallback is a single signature object with section-based lighting changes.

## D-004 Three experience tiers
- **Date:** 2026-10-12
- **Decision:** Full, Lite and Static tiers, chosen by capability detection with runtime downgrade.
- **Why:** Keeps the experience impressive on strong devices and usable on phones, weak devices, no-WebGL and reduced-motion users.
- **Alternatives:** One experience for all; desktop-only 3D.
- **Consequences:** Each feature must define behavior for all three tiers; Static assets needed.

## D-005 Loader behavior
- **Date:** 2026-10-12
- **Decision:** About 3s cinematic loader on first visit only; shortened or skipped for returning visitors; must not delay real content; has a Skip control and a hard time cap.
- **Why:** Impressive entry without punishing repeat visitors or hurting performance.
- **Alternatives:** Loader on every visit; no loader.
- **Consequences:** Needs a returning-visitor flag in browser storage; content must be present in HTML from the start.

## D-006 Page rhythm
- **Date:** 2026-10-12
- **Decision:** Loud, quiet, loud rhythm across sections (see `PROJECT_SPEC.md` section 4).
- **Why:** Prevents fatigue and keeps animation feeling art-directed.
- **Alternatives:** Uniform intensity.
- **Consequences:** Quiet sections (Currently Building, About) use restrained motion.

## D-007 Content-driven architecture
- **Date:** 2026-10-12
- **Decision:** Projects, services, team, testimonials and building items are data files in `/content` validated by schema; pages read from data.
- **Why:** Add content without redesign; Git-versioned; no database needed.
- **Alternatives:** CMS from day one; hardcoded pages.
- **Consequences:** A CMS can be added later on the same schema. Build fails on invalid content.

## D-008 Recommended stack
- **Date:** 2026-10-12
- **Decision:** Next.js (App Router) + TypeScript, Tailwind, React Three Fiber, GSAP ScrollTrigger, Lenis, MDX/JSON + Zod, Resend + Turnstile, Vercel or Cloudflare Pages, Plausible or Umami.
- **Why:** SEO-friendly rendering, persistent layout for the 3D stage, mature animation tooling, minimal infrastructure.
- **Alternatives:** Astro, raw Three.js, Motion-only animation, headless CMS now.
- **Consequences:** GSAP license terms must be checked; hosting, email and analytics choices still **[TBD]**.

## D-009 No placeholder team slot on the live site
- **Date:** 2026-10-12
- **Decision:** The Team section shows only published members. No empty, placeholder or "joining soon" member is displayed. The fifth role/member is undecided; the architecture only has to support adding one later without redesign. (Supersedes the earlier `joining-soon` status idea in the draft spec.)
- **Why:** Owner decision; avoids showing an empty or unfinished member.
- **Alternatives:** Visible "joining soon" slot.
- **Consequences:** Team entries use a `published` flag instead of a `joining-soon` status. Adding the fifth member is a content-only change.

## D-010 Sculpture piece count follows published team members
- **Date:** 2026-10-12
- **Decision:** Pieces in the Sculpture are generated from the pieces config, one per published team member. With four members at launch the Sculpture has four pieces; a new member adds a piece (custom model or generic placeholder).
- **Why:** Follows from D-009 and the requirement to add members without rebuilding.
- **Alternatives:** Fixed five pieces with one shown as unassigned.
- **Consequences:** The final Sculpture design must work with a varying piece count, or be designed so a new piece can be added later. **Flagged for owner confirmation with the 3D designer.**

## D-011 No database, login, admin panel or payments at launch (SUPERSEDED by D-021)
- **Date:** 2026-10-12
- **Decision:** Static/content-driven site with one contact-form server route.
- **Why:** Smaller attack surface, lower cost, simpler maintenance.
- **Alternatives:** Admin panel/CMS now.
- **Consequences:** Content edits happen via files (or a CMS added later).

## D-012 Privacy-friendly analytics
- **Date:** 2026-10-12
- **Decision:** Use cookieless, privacy-friendly analytics. Tool **[TBD]**.
- **Why:** Minimal data collection; may avoid a consent banner (to be verified by a legal professional).
- **Alternatives:** Google Analytics.
- **Consequences:** Fewer analytics features; legal review still required.

## D-013 Legal items need professional review
- **Date:** 2026-10-12
- **Decision:** Privacy Policy and cookie/consent approach are flagged for review by a qualified legal professional. No compliance claims are made without it.
- **Why:** Legal requirements must not be invented.
- **Alternatives:** Self-written policies.
- **Consequences:** Legal review is a release gate.

## D-014 Foundation uses plain CSS tokens; Tailwind installed but unused for now
- **Date:** 2026-10-12
- **Decision:** Phase 1 styling uses one hand-written `globals.css` with design tokens (CSS variables). The scaffold may install Tailwind, but components do not use it yet. Tailwind is introduced only if it clearly helps.
- **Why:** Fastest path to a working site; avoids Tailwind version differences in the scaffold; tokens stay in one place.
- **Alternatives:** Tailwind-first styling (original recommendation in D-008).
- **Consequences:** D-008 is partly superseded for styling. If Tailwind is adopted later, tokens must be mapped to it, not duplicated.

## D-015 Foundation content loader: JSON files read on the server, light validation, Zod deferred
- **Date:** 2026-10-12
- **Decision:** Content lives in `/content` as one JSON file per item (site.json, services/, team/, projects/, building/). A small server-side loader reads, filters unpublished, sorts by `order`, and checks `slug` and `order`. Full schema validation (Zod) and MDX case studies come later.
- **Why:** Keeps the first version small while still being content-driven and extensible.
- **Alternatives:** Zod + MDX from day one.
- **Consequences:** Full validation is still a pending task (see PROGRESS.md). All foundation content is marked `placeholder: true`; the site is set to noindex while `site.placeholder` is true.

## D-016 Raw Three.js instead of React Three Fiber for the Sculpture
- **Date:** 2026-10-12
- **Decision:** The Sculpture is a small vanilla Three.js module (`src/three/sculpture.ts`) mounted by one React component, not React Three Fiber.
- **Why:** Fewer dependencies, no React-renderer compatibility risk with Next.js 16, full control of the frame loop (shared with GSAP's ticker, so it stays in sync with smooth scroll), simpler to dispose and downgrade by tier.
- **Alternatives:** React Three Fiber + drei (original recommendation in D-008).
- **Consequences:** D-008 is partly superseded for 3D. New dependencies: `three`, `@types/three`. If a final glTF model is used, a loader is added inside `sculpture.ts` only.

## D-017 Hero is a tall section with a sticky screen; 3D stage lives in the root layout
- **Date:** 2026-10-12
- **Decision:** The hero is 220svh tall with a sticky 100svh screen (plain CSS sticky, no GSAP pin). Scroll progress through it is written to `stageInput.heroProgress` and drives text exit, big-name parallax and the Sculpture. The 3D stage is mounted once in `layout.tsx`, active on `/` only, and created lazily (never for the Static tier).
- **Why:** Robust, accessible scroll moment without scroll-jacking; keeps one persistent stage for later sections.
- **Alternatives:** GSAP `pin`; stage inside the home page only.
- **Consequences:** Later sections request Sculpture states through `src/motion/state.ts` / the controller; the stage fades out at the end of the hero until Chunk 2 defines its behavior.

## D-018 Intro, motion-on flag and failsafe
- **Date:** 2026-10-12
- **Decision:** An inline boot script in `layout.tsx` sets `data-motion` (on/off) and `data-intro` before first paint. Intro shows on the first visit only (localStorage key `studio-intro-seen`), about 2.6s, skippable, waits for the 3D stage with a 3s cap. Failsafe: if the app has not started within 5s, motion is switched off and everything is shown.
- **Why:** Prevents a flash of unstyled/animated content, never blocks the site, honors reduced motion.
- **Alternatives:** Loader on every visit; hiding content in JS only.
- **Consequences:** `<html>` has `suppressHydrationWarning`. Elements animate from CSS-hidden states only while `data-motion="on"`.

## D-019 Studio name is Tvarise; new visual reference is conicorn.framer.ai (structure only)
- **Date:** 2026-10-12
- **Decision:** Studio name is **Tvarise** (tvar = speed, rise = up). The owner wants the site to feel like https://conicorn.framer.ai/. Only its structure/ideas are used (numbered sections, bento services, numbered process, work cards, team cards, giant wordmark, big CTA). Its text, stats, testimonials, logos and pricing are NOT used. Exact colors/fonts/animation of the reference could not be read (text-only fetch); the visual design is original and driven by tokens, to be tuned from screenshots.
- **Why:** Owner request; avoids copying a paid template and avoids fake content.
- **Alternatives:** Pixel-copying the reference.
- **Consequences:** Section order stays as in the approved spec. Testimonials, stats, logos and pricing stay hidden/absent until real content exists. The hero may later switch to a looping 3D-designer video (open question to the owner); until then the placeholder Sculpture stays.

## D-020 Sculpture reassembles at the final CTA
- **Date:** 2026-10-12
- **Decision:** `stageInput.ctaProgress` (set by the Final CTA section) blends the Sculpture from its hero-exit state to a centered, assembled state and brings the canvas back to near full opacity.
- **Why:** Fulfils the approved "pieces reunite at the final CTA" idea with a small change.
- **Alternatives:** Separate timeline per section (planned later for Services).
- **Consequences:** Sculpture behavior for the Services section (pieces separating) is still pending.
## D-021 Supabase login and member-page editing (admin role)
- **Date:** 2026-10-26
- **Decision:** Supabase Auth (email + password) and a `members` table are used. A member can edit their own page. A user whose `profiles.role` is `admin` can edit any member page. JSON in `/content` stays as structure and fallback.
- **Why:** The team wants to edit page text without changing code.
- **Alternatives:** Edit JSON in Git only.
- **Consequences:** Supersedes D-011 for login and database. Site-wide editing by one admin is planned next, not built yet. Env var names only: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.

## D-022 Supabase-backed site content admin
- **Date:** 2026-10-30
- **Decision:** Add `/admin` for accounts with `profiles.role = 'admin'`. It edits site settings, homepage content, services, projects, team, and currently-building records as validated JSON. Supabase `cms_content` overrides the repository's JSON defaults; a migration provides public reads and admin-only writes enforced by RLS.
- **Why:** The owner needs to update placeholder copy and site content without editing code or redeploying, while preserving the existing file-based defaults and authenticated member-page editing.
- **Alternatives:** Continue editing JSON through Git; adopt a hosted third-party CMS.
- **Consequences:** Apply `supabase/migrations/20261030_admin_content.sql` and promote an existing Supabase Auth account before `/admin` can save content. Arbitrary component/layout/style changes and media uploads are outside the content model.
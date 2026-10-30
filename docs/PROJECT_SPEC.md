# PROJECT_SPEC.md

Permanent specification of the intended final product. Anything marked **[TBD]** is undecided and must NOT be invented. Changes to approved items must be recorded in `DECISIONS.md`.

Status: specification approved (2026-10-12). No code written yet.

## 1. Overview

- **Project:** portfolio website for a small multidisciplinary creative/digital team of five friends. Studio name **[TBD]**.
- **Type:** high-end, experience-first creative portfolio (award-level feel), NOT a corporate agency site.
- **Goal:** first-second reaction of "wow", backed by real work, clear services and an easy way to start a project.
- **Audience:** prospective clients in India and internationally **[TBD: segments]**.
- **Primary action:** click "LET'S WORK" and send an enquiry. **Secondary:** view work, meet the team.
- **Known roles:** (1) Facebook/Instagram Ads + Social Media Management, (2) App Designer, (3) Web Designer, (4) 3D Designer + 3D Animation, (5) **[TBD, undecided]**.
- **Reference:** a SaaS template was used ONLY as inspiration for animation quality, premium dark feel and interaction. Its Earth/WebGL concept, branding, content and structure are NOT used.

## 2. Approved principles

- Experience first; technology chosen to deliver it, not the reverse.
- Hero: **the Sculpture** (3D pieces + big typography + particles + scroll choreography). Exact 3D shape NOT locked; decided later with the 3D designer.
- Three tiers: **Full / Lite / Static**.
- Page rhythm: loud, quiet, loud.
- Loader: about 3s cinematic on first visit only; shortened/skipped for returning visitors; never delays real content.
- Everything content-driven: add team, services, projects, case studies, testimonials as data without redesign.
- No invented clients, projects, testimonials, statistics, achievements or team details.

## 3. Sitemap

| URL | Page |
|---|---|
| `/` | Home (scroll journey) |
| `/work` | Work index, filterable by service |
| `/work/[slug]` | Case study |
| `/services` | Services overview |
| `/services/[slug]` | Service detail (optional, only when content exists) |
| `/team` | Team |
| `/team/[slug]` | Member page (optional) |
| `/about` | About |
| `/contact` | Let's Work |
| `/privacy` | Privacy Policy |
| `/404`, `/500` | Designed error pages |

Not now: blog, shop, multilingual, site search. Admin panel and login were added later; see `DECISIONS.md` D-021 and D-022.

## 4. Homepage journey

| # | Section | Intensity | Purpose |
|---|---|---|---|
| 0 | Entry/loader | Loud | First impression, first visit only |
| 1 | Hero | Loud | Sculpture + giant studio typography + CTA |
| 2 | Services | Loud | Pinned sequence; each service takes focus in turn |
| 3 | Selected Work | Loud | Large immersive project previews |
| 4 | Currently Building | Quiet | Subtle live/progress strip |
| 5 | How We Work | Medium | Scroll-driven process story |
| 6 | Team | Loud | Interactive portraits linked to the Sculpture |
| 7 | About / Why Us | Quiet | Typography-driven statement |
| 8 | Final CTA | Loudest | Sculpture reassembles; "LET'S WORK" is the only focus |
| 9 | Footer | Quiet | Links, contact, legal |

All copy **[TBD]**, written with the team. Sections with no data hide themselves.

## 5. Work / portfolio

- Index: large grid/list, filter by service; tiles show cover, title, services, year.
- Home "Selected Work": projects flagged `featured`, ordered by `order`, default 4 to 6.
- Interaction: hover media preview, custom cursor "View" (desktop), shared-element transition into case study.
- Few real projects at launch: layout adapts; never show fake work. Count at launch **[TBD]**.

## 6. Case-study structure

1. Hero media, title, year, services, team involved
2. Overview/brief (client name optional)
3. Challenge/goal (optional)
4. Approach (optional)
5. Media blocks in any order: image, full-bleed, video, side-by-side, 3D viewer, before/after
6. Results (optional; only real, verifiable facts)
7. Testimonial (optional)
8. Credits (linked to team)
9. Next project link

Written in MDX using these block types. Each project fills only the blocks it has.

## 7. Services system

Fields: `title`, `slug`, `summary`, `icon/visual`, `includes[]`, `pieceId`, optional detail page. Related projects derived by tag. Layout supports 3 to 8 services. The pinned Services sequence is generated from the list.

## 8. Team system

- Fields: `name`, `slug`, `role`, `shortLine`, `bio`, `portrait`, `links[]`, `pieceId`, `order`, `published`.
- Only **published** members are shown. There is NO empty, placeholder or "joining soon" slot on the live site. The fifth member is added later as a normal entry.
- Hover/tap on a card highlights that member's Sculpture piece.
- All team details **[TBD]**, supplied by the team.

## 9. Currently Building

Fields: `title`, `description`, `status`, `progress?`, `team`, `link?`, `updatedAt`. Section hides when empty; old items auto-hide after a configurable period **[TBD]**. Quiet animation only.

## 10. About

Home: typography-led statement with word-by-word reveal. `/about`: studio story, approach, tools. Copy **[TBD]**. Must state plain facts (who, what, where, how to contact), only facts supplied by the team.

## 11. Contact / Let's Work

"LET'S WORK" leads to `/contact`. Form: name, email, services needed (from data), budget range (optional), message, country/timezone (optional). Server-side send to studio inbox. States: sending, success, validation errors, failure with fallback email **[TBD address]**. Minimum data collected; privacy note shown.

## 12. Navigation

Desktop: Logo, Work, Services, Team, About, Contact, prominent LET'S WORK on the right; hides on scroll down, returns on scroll up. Mobile: logo + LET'S WORK + menu opening a full-screen animated menu. Breadcrumbs only on detail pages.

## 13. Motion system

Principles: one motion language, one big move at a time, motion guides attention, never blocks reading, shared easing and timing tokens. Patterns: masked text reveals, clip-path media reveals, inner parallax, pinned sequences, magnetic buttons, custom cursor states (desktop), card tilt/spotlight, animated route transitions, subtle particles. No heavy glow. All motion code in a shared layer.

## 14. 3D and tiers

See `ARCHITECTURE.md`. One persistent 3D stage; Sculpture controller with states; pieces generated from config; placeholder shapes first. Piece count follows published team members. Tiers: Full, Lite, Static, chosen by capability detection, with runtime downgrade.

## 15. Responsive

Mobile-first. Test widths 320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920. Mobile defaults to Lite, tap replaces hover, 44px touch targets. Browsers: current Chrome, Edge, Firefox, Safari (macOS/iOS), Android Chrome.

## 16. Content model

See `CONTENT.md`. Files in `/content`, validated by schema at build time. Relationships by ID (project to services to team), never duplicated.

## 17. SEO / GEO

See `SEO.md`.

## 18. Accessibility

Semantic HTML, skip link, visible focus, full keyboard support, reduced motion honored (no scroll-jacking), linear fallback for pinned sections, contrast verified on dark backgrounds, no info by color alone, accessible forms, skippable loader, pausable videos, captions where there is speech.

## 19. Performance

Targets on mid-range mobile: LCP under 2.5s, INP under 200ms, CLS under 0.1. Content paints before 3D. Hero model budget about 3 MB **[TBD, confirm with 3D designer]**. Modern image formats, lazy loading, limited fonts, animate transform/opacity only, pause 3D offscreen, cap pixel ratio on phones.

## 20. Security

See `SECURITY.md`.

## 21. Analytics

Privacy-friendly cookieless tool **[TBD: Plausible or Umami]**. Track page views, sources, CTA clicks, form submissions, project views, scroll depth on key pages, tier used, Web Vitals. No personal data beyond the contact form.

## 22. Testing and deployment

See `TESTING.md` and `DEPLOYMENT.md`.

## 23. Legal / privacy (needs review by a qualified professional)

Privacy Policy required (contact form). Cookie/consent need depends on tools used; verify. Terms of Service likely not needed now **[TBD, confirm]**. Copyright notice; client permission to show work/name; testimonial permission; data deletion process for enquiries **[TBD]**. Never claim compliance or certifications we do not have.

## 24. Tech stack (recommended)

Next.js (App Router) + TypeScript; Tailwind CSS + design tokens; Three.js via React Three Fiber (+ drei); GSAP + ScrollTrigger (check license terms); Lenis; Motion or View Transitions for route transitions; MDX + JSON/YAML + Zod in `/content`; server route + transactional email (e.g. Resend) + Turnstile; Vercel or Cloudflare Pages; Plausible or Umami. No database, login or payments at launch. Costs **[TBD]**.

## 25. Folder structure (planned)

```
/docs
/content   site.json, services/, team/, projects/, building/, testimonials/, pieces.json
/public    media, models, fonts
/src
  app/         routes
  components/  ui/, sections/, case-study/
  motion/      shared easing, durations, text/scroll/cursor utilities
  three/       stage, Sculpture controller, pieces, tier detection
  lib/         content loaders, schema, SEO helpers
  styles/      tokens, global styles
/tests         unit, component, e2e
```

## 26. Adding content later

| To add | How | Code change? |
|---|---|---|
| Project / case study | New folder in `/content/projects` | No |
| Service | New file in `/content/services`; assign a piece | No |
| Team member | New file in `/content/team`; add piece entry or use generic piece | No (custom model needs an asset) |
| Testimonial | New file; section appears once one exists | No |
| Building item | New file | No |
| New block type or page | New component following patterns; record in DECISIONS | Yes |

## 27. Roadmap

1. Foundation (repo, tokens, schema, layout, nav/footer, placeholder pages)
2. Motion layer + Sculpture prototype with placeholder pieces and tiers
3. Home sections, then Work and case-study templates
4. Contact flow, SEO, analytics, security headers
5. Real content and final 3D assets
6. Testing, performance, accessibility pass, launch

Future options (NOT now): blog/journal, CMS, multilingual, testimonials section, service detail pages.

## 28. Definition of Done

A feature is done only when: implemented; responsive; accessible; error/loading/empty states handled; all three tiers checked; security and SEO reviewed; performance within targets; tests passed; docs updated; `PROGRESS.md` checkbox updated.

## 29. Open items (needed from the team)

Studio name, logo, tagline, accent color; team names/bios/portraits and the fifth role; real projects and client permissions; contact email, socials, any physical address; domain, budget, hosting choice; final Sculpture design and asset timeline; legal review; pricing/currency display policy for international clients.

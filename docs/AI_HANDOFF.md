# AI_HANDOFF.md

**Every AI developer MUST read this file before touching the project, then the relevant parts of `PROJECT_SPEC.md`.** Update this file after every meaningful change.

Last updated: 2026-10-12

## PROJECT NAME
Tvarise (tvar = speed, rise = up)

## PROJECT PURPOSE
High-end, experience-first creative portfolio website for a small multidisciplinary creative/digital team (five friends), targeting clients in India and internationally. See `PROJECT_SPEC.md`.

## CURRENT STATUS
- Planning complete; 11 docs are the specification.
- Foundation step 1 verified locally (build passes).
- Home Chunk 1 (hero + motion foundation + placeholder Sculpture) written, **not yet verified locally**.
- Approach: build-first. Chunks: 1 Hero + motion foundation, 2 remaining home sections, 3 Work/case study, 4 Contact, then polish and final 3D.

## TECH STACK (planned, not yet installed)
Installed: Next.js 16 (App Router, Cache Components), TypeScript, ESLint. Added in Chunk 1: gsap (+ScrollTrigger), lenis, three, @types/three. Styling is plain CSS tokens (D-014). 3D is vanilla Three.js (D-016). Still planned: MDX/Zod content validation, Resend + Turnstile, analytics.

## PROJECT STRUCTURE
Created so far: `/content`, `/src/app`, `/src/components`, `/src/lib`, `/docs`. Planned folders (`/src/motion`, `/src/three`, `/tests`) do not exist yet.

## IMPORTANT FILES
- `content/**` (placeholder content), `src/lib/content.ts`, `src/lib/types.ts`
- `src/app/layout.tsx` (boot script, providers, stage), `src/app/globals.css` (tokens + styles)
- `src/motion/` (`state.ts` tier/intro/stage input, `tier.ts`, `gsap.ts`, `MotionProvider.tsx`, `reveal.ts`, `magnetic.ts`, `Cursor.tsx`, `tokens.ts`)
- `src/three/` (`sculpture.ts` controller, `SculptureStage.tsx`)
- `src/components/` (`Navbar`, `Footer`, `Intro`, `PageStub`, `hero/Hero`, `hero/MaskedWords`)

## IMPORTANT COMPONENTS
None yet. Planned: 3D stage, Sculpture controller, tier detection, motion layer, content loaders, section components, case-study blocks.

## DATABASE STRUCTURE
None. No database at launch. Content lives in `/content` files validated by schema.

## API STRUCTURE
Planned: one contact-form server route. Nothing else.

## DESIGN SYSTEM
Not yet defined. Direction: premium dark, one accent color **[TBD]**, bold tight typography, glass-style cards, restrained glow. Tokens (easing, durations, spacing, type scale) to be defined in the Foundation phase and recorded in `DECISIONS.md`.

## ROUTES (planned)
`/`, `/work`, `/work/[slug]`, `/services`, `/services/[slug]` (optional), `/team`, `/team/[slug]` (optional), `/about`, `/contact`, `/privacy`, 404, 500.

## FEATURES
See `PROJECT_SPEC.md`.

## COMPLETED FEATURES
None verified yet.

## IN-PROGRESS FEATURES
Home Chunk 2: all remaining home sections (awaiting local verification). Chunk 1 hero is verified by the owner.

## PENDING FEATURES
All. See `PROGRESS.md`.

## KNOWN BUGS
None (no code).

## KNOWN LIMITATIONS / RISKS
- Final Sculpture 3D design and timeline unknown.
- Real projects, team content and brand assets not yet supplied.
- GSAP license terms must be checked for this use.
- Legal/privacy approach needs professional review.
- Piece count of the Sculpture follows published team members (see `DECISIONS.md` D-010).

## IMPORTANT DECISIONS
See `DECISIONS.md`.

## DO NOT CHANGE RULES
- Do not change the approved architecture, URLs, content schema or tier model without recording it in `DECISIONS.md` and telling the owner first.
- Do not copy the reference template's Earth/WebGL scene, branding, copy or structure.
- Do not show placeholder, empty or "joining soon" team members on the live site.
- Do not force the loader on returning visitors; never let it delay real content.
- Do not put secrets in frontend code or commit `.env`.
- Do not hardcode projects, team, services or testimonials into page layouts.
- Do not rewrite working code unnecessarily.

## AI WORKING RULES
1. Read this file, then the relevant parts of `PROJECT_SPEC.md`.
2. Inspect the existing implementation and current status.
3. Identify affected files and briefly explain the planned change.
4. Make the smallest safe change; do not break unrelated functionality.
5. Run appropriate checks/tests; report exactly what changed, what was tested, what remains broken.
6. Update this file and `PROGRESS.md`; update `CHANGELOG.md` for meaningful changes and `DECISIONS.md` for architectural changes.

**The AI must NEVER:** expose secrets; invent credentials, APIs, user data, studio/team/client/project details, reviews, statistics, certifications or legal compliance; silently remove functionality, change URLs, change content structure or change authentication behavior; delete files without explanation; add unnecessary dependencies; mark unfinished tasks complete; claim tests passed without running them; guarantee SEO, Google ranking or AI-search visibility. If uncertain, say so.

## ENVIRONMENT SETUP
Node.js and npm. Created with `create-next-app`. Extra packages: `npm install gsap lenis three` and `npm install -D @types/three`.

## RUN / BUILD / TEST COMMANDS
- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Lint: `npm run lint`
- Tests: not set up yet.

## DEPLOYMENT PROCESS
See `DEPLOYMENT.md`. Not yet configured.

## CURRENT TASK
Owner verifies Home Chunk 2 locally.

## NEXT RECOMMENDED TASK
Tune visual style from owner screenshots of the reference; Sculpture separation during Services; Work index + case-study template; Contact flow; hero video option.

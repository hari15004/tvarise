# AI_HANDOFF.md

**Every AI developer MUST read this file before touching the project, then the relevant parts of `PROJECT_SPEC.md`.** Update this file after every meaningful change.

Last updated: 2026-10-14

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
Supabase tables: `members` (per-member page content, owner in `user_id`) and `profiles` (`role`, admin or not). `/content` JSON stays as structure and fallback. Content lives in `/content` files validated by schema.

## API STRUCTURE
Server action `saveMember` in `src/app/team/[slug]/actions.ts`. The contact-form route is still planned.. Nothing else.

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

## UPDATE 2026-10-14 (read this first; it overrides older lines above)
- Build passes locally (npm install clean, npm run build OK, 7 routes). Live site: https://tvarise.vercel.app/ (noindex while content is placeholder). Repo: herry1404/tvarise, branch main.
- Home Chunk 2 sections exist in src/components/home/ and show on the live site with placeholder content. PROGRESS.md boxes are still unticked. Older lines above saying src/three, src/motion or home sections do not exist are outdated.
- Sculpture is now a golden-bronze horse loaded from public/models/bronze_horse.glb (replaces the shards). Knobs at the top of src/three/sculpture.ts: HORSE_URL, HORSE_SIZE, HORSE_YAW, HORSE_COLOR.
- Warm glow sits behind the horse. Horse and glow fade out when the hero ends. At the final CTA the glow bursts and the horse zooms in from behind it.
- Big "Tvarise" name (.hero__bigname in globals.css) is solid white with a light golden tint and soft glow. Tagline "Where Creativity, Design & Technology Rise Together" sits under it (.hero__tagline, CSS appended at the end of globals.css). The hero "Placeholder copy" tag was removed from Hero.tsx.
- Pending: remove the leftover line "Placeholder copy. Final headline and intro will be written with the team." under the hero headline (source file not found yet). Tune tagline spacing and size.
- Risk: horse model permission is verbal only. The file came from a GetLayers AI (Textura Agency) template asset. On 2026-10-14 the owner said the relative who owns that site gave the OK. Keep a written OK. If withdrawn, swap the model file (only the file, HORSE_YAW and HORSE_SIZE change).
- Owner is a beginner and writes Hinglish. Give one step at a time, ask for the output to be pasted back, and give full files for big edits.

## UPDATE 2026-10-14 (later, read this too)
- Hero.tsx tagline fix: scrolling back to the top no longer calls play(), so the big "Tvarise" name does not vanish and re-fade. The tagline now types in from the end (stagger from "end") in the onLeaveBack handler. Owner has not yet confirmed this in the browser.
- The unused backspace() function is still in Hero.tsx and may cause a lint warning.
- The hero line "Placeholder copy. Final headline and intro..." was not found in src or content, it may already be gone. The only remaining "Placeholder copy" tag is in About.tsx (shown when content.placeholder is true).
- Next task: redesign Services ("What we do") from bento cards into large rows (big number + big title, hover expands summary and includes, line draws on scroll, stacked rows on mobile). Not started yet. Do not paste it before checking .bento and .card CSS in globals.css.

## UPDATE 2026-10-14 (latest, overrides the Services plan above)
- Services ("What we do") is now a sticky card stack (owner picked it from 4 mockups). It replaces the row/hover-expand plan above. Markup in src/components/home/Services.tsx (classes svc, svc__card, svc__inner, svc__top, svc__n, svc__count, svc__title, svc__text, svc__list; each card gets a --i CSS variable). CSS is under "Services: rows" in src/app/home.css. Old .bento CSS is removed. .card classes are untouched.
- Owner confirmed in the browser that Services looks fine. Not yet checked: prefers-reduced-motion and the full/lite/static tier behaviour for the stack (it only uses position: sticky and the existing data-reveal).
- All visible "Placeholder" tags were removed from Team, Work, Services, Footer, About and Process. The "placeholder": true flags in /content JSON were kept on purpose, because site.placeholder drives the noindex robots rule in layout.tsx.
- Process.tsx still receives a placeholder prop that is now unused, and page.tsx still passes it. Clean up later if lint complains.
- Placeholder TEXT inside content JSON (e.g. "Placeholder description", "Placeholder Project 01") still shows on screen until the team gives real copy. Do not invent copy.
- Build passes (npm run build, 7 routes).

## UPDATE 2026-10-15 (phone view polish, in progress)
- Phone hero horse moved down and made smaller in src/three/sculpture.ts layout(): baseY 1.5 -> 0.4 and baseScale 0.5 -> 0.4 (phone only, desktop values unchanged). Reason: by calculation at 390x844 the horse sat behind the tagline. This is a first guess made without a screenshot; the owner will check on a real phone after the Vercel deploy and report.
- Frame-loop phone targets (sc ce target baseScale*0.75, py target 0.5) were NOT changed yet. Check the final CTA zoom-in on phone next.
- Still to check on phone: Services stack, other sections, nav, footer, horizontal overflow, lite tier performance.
- Build passes (npm run build).
## UPDATE 2026-10-26
- /team is now the list page and /team/[slug] has the Suspense EditGate. Next.js is 16.4.3. tsbuildinfo and .vercel are untracked and ignored. The Google Form script was moved out of public/. Next planned: single-admin /admin panel.
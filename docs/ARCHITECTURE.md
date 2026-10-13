# ARCHITECTURE.md

Planned architecture. Nothing here is implemented yet. Changes must be recorded in `DECISIONS.md`.

## 1. Principles
- Content first: text and structure render in HTML before any 3D loads.
- One persistent 3D stage; sections request states and never touch 3D internals.
- Everything driven by data in `/content`.
- Three tiers (Full / Lite / Static) for every animated feature.
- Few dependencies; heavy libraries loaded only where used.

## 2. Rendering approach
- Next.js App Router, static generation for all pages (content is file-based).
- Root layout mounts, once: the 3D stage canvas, smooth-scroll provider, route-transition wrapper, nav and footer.
- The 3D canvas is decorative: hidden from assistive tech, `pointer-events: none` behind content.

## 3. Content flow
`/content` files -> schema validation (Zod, at build) -> typed loaders in `/src/lib` -> section and page components.
- Relationships by ID: project -> services -> team members. Derived lists (for example related projects) are computed, never duplicated by hand.
- A CMS could replace the file source later without changing components, as long as the schema stays the same.

## 4. 3D stage
- **Stage:** one canvas, one camera, shared lights, shared post effects kept minimal.
- **Sculpture controller:** holds the pieces and a set of named states, for example `assembled`, `scattered`, `focus(pieceId)`, `tinted(color)`, `reassembled`. Sections call `setState(...)`; the controller animates between states with shared easing.
- **Pieces config (`content/pieces.json`):** one entry per published team member: `pieceId`, model path (optional), positions per state. If no custom model exists, a generic placeholder piece is used.
- **Piece count** follows published team members (`DECISIONS.md` D-010).
- **Scroll link:** a scroll controller maps scroll progress and section visibility to Sculpture states (GSAP ScrollTrigger + Lenis).
- **Hover/tap link:** Team card hover or tap calls `focus(pieceId)`.
- **Assets:** compressed glTF (Draco/Meshopt), compressed textures, hero model budget about 3 MB **[TBD with 3D designer]**, loaded after first paint.
- **Lifecycle:** pause rendering when the tab is hidden or the stage is offscreen; dispose resources on tier downgrade.

## 5. Tier system
| Tier | Selected when | Behavior |
|---|---|---|
| Full | Capable desktop/laptop with WebGL | Full stage, particles, all effects |
| Lite | Phones, mid devices, Save-Data, low memory | Same story, simpler geometry, fewer particles, 2D/CSS motion for text |
| Static | No WebGL, load failure, `prefers-reduced-motion` | Designed still images, calm fades, all content intact, no scroll-jacking |

- **Detection inputs:** WebGL support, device memory/GPU class, viewport size, reduced-motion preference, network/Save-Data.
- **Runtime downgrade:** a frame-rate monitor drops Full to Lite, or Lite to Static, if the device struggles. The choice is stored for the session.
- Every animated component declares its behavior for all three tiers.

## 6. Motion layer (`/src/motion`)
Shared tokens (easing, durations, stagger, distances, parallax strength) and reusable utilities: masked text reveal, clip-path reveal, inner parallax, pinned sequence helper, magnetic button, cursor controller, route transition. Components import from here; no ad-hoc timings inside components.

## 7. Loader
- First visit: about 3s cinematic intro with real progress, Skip control and a hard time cap.
- Returning visitors (flag in browser storage): short intro or none.
- Real content is already in the HTML; the loader never gates it. If assets are slow, content shows and 3D joins when ready.

## 8. Routing and transitions
- Animated transitions between routes; the 3D stage persists across them.
- Case-study open uses a shared-element transition from the project tile; falls back to a simple fade in Static tier or unsupported browsers.

## 9. Contact flow
Form -> client validation -> server route (re-validation, rate limit, spam check) -> transactional email to the studio inbox. No database. See `SECURITY.md`.

## 10. Performance strategy
Load order: HTML/text, fonts, hero visuals, 3D stage, below-the-fold media. Animate transform and opacity only. Cap device pixel ratio on phones. Code-split 3D and animation libraries so Static-tier users never download them.

## 11. Extension points
- **Add a team member:** new file in `/content/team` + piece entry; no component change.
- **Add a service:** new file in `/content/services`; the pinned sequence picks it up.
- **Add a project:** new folder in `/content/projects`.
- **Add a case-study block type:** new component registered in the block map; record in `DECISIONS.md`.
- **Add a CMS:** swap the content source behind the loaders.

## 12. Open technical items
- Final Sculpture model, piece count at launch (four known members) and asset budget **[TBD]**
- Hosting target (Vercel or Cloudflare Pages) **[TBD]**
- GSAP license check
- JavaScript budget, to be set after the first prototype

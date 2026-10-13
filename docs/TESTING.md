# TESTING.md

Testing strategy and release gates. No tests exist yet. Never claim tests passed without running them.

## 1. Test types

| Type | Covers |
|---|---|
| Unit | Content schema validation, tier-detection logic, helpers, SEO/metadata builders |
| Component | Cards, nav, forms, case-study blocks, team/service lists (including empty and many-item cases) |
| Integration | Content loaders to pages; Sculpture controller state changes; tier downgrade |
| End-to-end | Home journey, Work to case study to next project, contact form success and failure |
| Accessibility | Automated checks + manual keyboard and screen-reader passes |
| Responsive | Width matrix below, on real devices where possible |
| Browser | Supported browser list below |
| Performance | Core Web Vitals on mid-range mobile for all three tiers |
| SEO | Metadata, canonicals, sitemap, robots, structured data validation |
| Security | Headers, dependency audit, form abuse tests |
| Error states | 404, 500, form failure, slow/failed 3D load, no WebGL |

## 2. Responsive matrix
320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920 px. Check hero type readability (including when the Sculpture passes in front), nav/menu behavior, pinned sections, cards, case-study layouts.

## 3. Supported browsers
Current Chrome, Edge, Firefox, Safari (macOS and iOS), Android Chrome. Older browsers receive the Static tier; no promise of full-effect support.

## 4. Tier tests
For each of Full, Lite, Static: content fully readable, all links work, no layout shift, no console errors. Also test: forced tier downgrade, reduced-motion on, WebGL disabled, Save-Data on, slow network.

## 5. Loader tests
First visit shows the intro; returning visit is shortened or skipped; Skip works; content is available even if assets are slow or fail.

## 6. Content-driven tests
Add a team member, a service and a project using only content files; confirm pages, Sculpture pieces and navigation update with no code change. Test with zero testimonials, zero building items and fewer than three projects (sections adapt or hide).

## 7. Form tests
Valid submission, missing fields, invalid email, oversized input, repeated submissions (rate limit), honeypot trigger, server failure, success state, keyboard-only use, screen-reader announcements.

## 8. Performance targets
LCP under 2.5s, INP under 200ms, CLS under 0.1 on mid-range mobile. JavaScript and asset budgets **[TBD after prototype]**.

## 9. Release gate (all must pass)
- [ ] Unit, component, integration and E2E tests pass
- [ ] Accessibility checks pass (keyboard, focus, contrast, reduced motion, screen reader)
- [ ] Responsive matrix and browser list verified
- [ ] All three tiers verified
- [ ] Performance targets met
- [ ] SEO checklist passed (`SEO.md`)
- [ ] Security checklist passed (`SECURITY.md`)
- [ ] Legal/privacy review done
- [ ] Docs and `PROGRESS.md` updated
- [ ] Definition of Done met for every feature (`PROJECT_SPEC.md` section 28)

## 10. Reporting
After any change, report exactly what was tested, how, and the result, plus anything not tested.

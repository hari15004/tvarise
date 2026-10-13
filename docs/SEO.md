# SEO.md

SEO and GEO (AI-search readiness) plan. No ranking or AI-visibility results are guaranteed. All copy and keywords are **[TBD]** until the team supplies real content.

## 1. Technical foundations
- Statically generated HTML so crawlers see all text; the 3D canvas is decorative and hidden from assistive tech.
- One H1 per page, logical heading order, semantic landmarks.
- Clean, stable URLs (see sitemap in `PROJECT_SPEC.md`); never change URLs silently; use redirects if one must change.
- Canonical URL on every page; no duplicate content between list and detail pages.
- `sitemap.xml` and `robots.txt` generated from content.
- Custom 404 with helpful links; correct HTTP status codes.
- Favicon and app icons; theme color.

## 2. Per-page metadata
Titles and descriptions come from content data, with a template fallback. Open Graph and Twitter/X cards on every page; a generated social image per project.

| Page | Search intent | Title / description / H1 |
|---|---|---|
| Home | Find and understand the studio | **[TBD]** |
| Work | Browse portfolio | **[TBD]** |
| Case study | Evaluate a specific project | Generated from project data |
| Services | Find a service provider | **[TBD]** |
| Team | Learn who they would work with | **[TBD]** |
| About | Trust and credibility | **[TBD]** |
| Contact | Start a project | **[TBD]** |

Primary keyword, secondary topics and internal links per page: **[TBD]**, decided at content stage. No keyword stuffing; copy must be genuinely useful.

## 3. Structured data (Schema.org)
- Organization and WebSite (site-wide)
- BreadcrumbList (detail pages)
- CreativeWork (case studies)
- Person (team members, with real, supplied details only)
- Service (services)
- LocalBusiness: only if a real physical business address exists **[TBD]**
- Review/AggregateRating: only with real, compliant, permitted reviews. Never invent.
- Validate all structured data before release.

## 4. GEO / AI-search readiness
Make the site clear to search engines and AI systems:
- Plain factual statements: who we are, what we offer, who it is for, where we operate, how to contact.
- Consistent entity information (name, description, links) across the site, schema and social profiles.
- Descriptive headings and structured content; FAQ sections only where genuinely useful.
- Author/credit information on case studies; sources for any factual claim.
- Content update process: owner reviews facts before publishing (see `CONTENT.md`).
- Never: fake reviews, fake authority, fake citations, fake statistics, spammy AI-search manipulation.

## 5. International readiness
- English-first with simple, clear language.
- Contact page states timezone/availability **[TBD, only if true]**.
- Pricing/currency display policy **[TBD]**.
- hreflang is not needed until a second language exists.

## 6. Images and media
- Descriptive filenames and meaningful alt text on every image; decorative visuals use empty alt.
- Video has a poster and an accessible description.
- Responsive sizes, modern formats, lazy loading below the fold.

## 7. Performance as SEO
Core Web Vitals targets: LCP under 2.5s, INP under 200ms, CLS under 0.1 (see `TESTING.md`). 3D and animation must not degrade these.

## 8. SEO checks before release
- [ ] Titles/descriptions unique and present on every page
- [ ] Canonicals correct
- [ ] Sitemap and robots.txt valid
- [ ] Structured data validated
- [ ] Open Graph/social cards render
- [ ] No broken internal links; 404 behaves correctly
- [ ] Pages indexable (no accidental noindex)
- [ ] Mobile usability checked

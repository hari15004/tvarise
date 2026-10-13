# CONTENT.md

Content rules, data model and how to add content. **No studio, team, client, project, testimonial or statistic content is invented.** Everything below marked **[TBD]** must be supplied by the team.

## 1. Content principles
- Real, factual, specific. No generic filler, no fake reviews, no fake statistics, no fake clients, no fake expertise.
- Copy serves user intent: what we do, for whom, proof, how to start.
- Tone and brand voice **[TBD]**; decided with the team.
- Every factual claim must be verifiable by the team before publishing.
- Client names, logos and work are shown only with permission.

## 2. Data model (files in `/content`, validated at build)

**site.json:** studio name **[TBD]**, tagline **[TBD]**, contact email **[TBD]**, social links **[TBD]**, nav items, CTA text, accent color **[TBD]**.

**Service** (`/content/services/<slug>`): `title`, `slug`, `summary`, `icon/visual`, `includes[]`, `pieceId`, `order`, `published`.

**TeamMember** (`/content/team/<slug>`): `name`, `slug`, `role`, `shortLine`, `bio`, `portrait` (with alt), `links[]`, `pieceId`, `order`, `published`. Only published members appear. No placeholder members.

**Project** (`/content/projects/<slug>/`): `title`, `slug`, `year`, `services[]`, `team[]`, `cover` (media + alt), `summary`, `featured`, `order`, `published`, `clientName?` (optional, permission required), `body` (MDX using the case-study blocks), SEO overrides (optional).

**BuildingItem** (`/content/building/<slug>`): `title`, `description`, `status`, `progress?`, `team[]`, `link?`, `updatedAt`.

**Testimonial** (`/content/testimonials/<slug>`): `quote`, `author`, `role`, `project?`, `permissionConfirmed` (must be true). The section stays hidden until at least one real, permitted testimonial exists.

**pieces.json:** `pieceId`, model path (optional), state positions. See `ARCHITECTURE.md`.

## 3. Case-study blocks
Hero media, overview, challenge, approach, image, full-bleed image, video, side-by-side, 3D viewer, before/after, results (verifiable facts only), testimonial, credits, next project.

## 4. Media rules
- Every image has alt text and dimensions; decorative images use empty alt.
- Videos have a poster, are muted by default when autoplaying, can be paused, and have captions if there is speech.
- Original files kept separately; optimized versions generated for the site.
- Hero/Sculpture model must stay within the asset budget **[TBD]**.

## 5. How to add things

| To add | Steps |
|---|---|
| Project | Create folder in `/content/projects`, add data + MDX + media, set `published` |
| Team member | Add file in `/content/team`, add portrait, add piece entry (custom model or generic), set `published` |
| Service | Add file in `/content/services`, assign a piece |
| Testimonial | Add file with permission confirmed |
| Building item | Add file with current `updatedAt` |

Run content validation and the build; fix any schema errors before publishing.

## 6. Update process and ownership
- Content owner for each area **[TBD]**.
- Every new or changed claim, name or number is checked by the person responsible before publishing.
- Review "Currently Building" items regularly so nothing stale stays visible.
- Record meaningful content-structure changes in `CHANGELOG.md`.

## 7. Content still needed
Studio name, logo, tagline; accent color; brand voice; team bios and portraits; service descriptions; real projects with permissions and media; About story; contact details; privacy policy text (legal review).

# DEPLOYMENT.md

Deployment plan. Nothing is configured yet. Hosting, domain, email service and costs are **[TBD]**.

## 1. Hosting
- Recommended: Vercel or Cloudflare Pages (static/server rendering, global CDN, easy deploys, free or low-cost tier). Final choice **[TBD]**.
- No database or server infrastructure at launch. One contact-form server route.

## 2. Environments
| Environment | Purpose |
|---|---|
| Local | Development |
| Preview | Automatic per-branch previews for review (not indexed: noindex + no sitemap) |
| Production | Live site on the real domain |

## 3. Environment variables (names only; never commit values)
Planned, to be confirmed at implementation:
- Email service API key **[name TBD]**
- Studio inbox address
- Turnstile (or chosen CAPTCHA) site key and secret key
- Analytics site identifier
- Site URL

Secrets are stored in the hosting provider's environment settings only.

## 4. Build and release process
1. Work on a branch; open a pull request.
2. Automated checks: lint, type check, content validation, tests, dependency audit.
3. Review the preview deployment (all tiers, mobile, forms).
4. Merge to main; production deploys automatically.
5. Smoke test production: home, work, a case study, contact form, 404, sitemap, robots.
6. Update `CHANGELOG.md`, `PROGRESS.md` and `AI_HANDOFF.md`.

Exact commands **[TBD until the project is initialized]**.

## 5. Domain and HTTPS
- Domain name **[TBD]**; registrar with two-factor authentication.
- HTTPS enforced, HSTS enabled, one canonical host (www or non-www) with a redirect for the other.
- Email sending domain configured (SPF/DKIM/DMARC) **[TBD]**.

## 6. Monitoring
Uptime check, error reporting (free tier) and Web Vitals tracking. Alert recipient **[TBD]**.

## 7. Backup and rollback
- Code and content are in Git (the main backup). Original media stored separately **[TBD]**.
- Rollback: redeploy the previous successful production build from the hosting dashboard.

## 8. Pre-launch checklist
- [ ] Production build passes
- [ ] Environment variables set
- [ ] Domain connected, HTTPS working
- [ ] Preview/staging noindex removed only on production
- [ ] robots.txt and sitemap correct
- [ ] Analytics working and privacy approach confirmed
- [ ] Contact form delivers to the real inbox
- [ ] Monitoring active
- [ ] Release gate in `TESTING.md` passed
- [ ] Legal/privacy review done
- [ ] Final QA on real iOS and Android devices

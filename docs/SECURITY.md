# SECURITY.md

Security checklist and policy. Supabase login and member-page editing exist (see DECISIONS.md D-021); the site content admin uses Supabase with RLS (D-022). No payments and no file uploads yet.

## Rules (always)
- NEVER put private API keys, passwords, tokens or credentials in frontend code.
- Secrets live in environment variables only; `.env` files are never committed; document variable NAMES (not values) in `DEPLOYMENT.md`.
- If a feature creates a security risk, identify it before implementation and record it in `DECISIONS.md`.

## Checklist

| Area | Requirement | Status |
|---|---|---|
| HTTPS | HTTPS only; HSTS enabled | [ ] |
| Security headers | CSP, X-Content-Type-Options, frame protection (clickjacking), Referrer-Policy, Permissions-Policy | [ ] |
| CSP | Strict policy; allow only needed script/style/media/font hosts; review when adding third-party scripts | [ ] |
| Input validation | All contact-form fields validated on the server (length, format); never trust client validation | [ ] |
| Output encoding | No raw HTML from user input; MDX content authored by the team only | [ ] |
| XSS | Framework escaping; no `dangerouslySetInnerHTML` with untrusted data | [ ] |
| CSRF | Contact route protected (origin checks / tokens as appropriate) | [ ] |
| Injection | No SQL (no database); no shell commands built from user input | [ ] |
| SSRF | Server route does not fetch user-supplied URLs | [ ] |
| Spam / abuse | Honeypot + CAPTCHA alternative (e.g. Cloudflare Turnstile); rate limiting on the contact route | [ ] |
| CORS | Contact route accepts only same-origin requests | [ ] |
| Email | Sender/recipient fixed server-side; user input never used as a header value unescaped (prevent header injection) | [ ] |
| Authentication / sessions / cookies | Supabase Auth with cookies; `src/proxy.ts` refreshes the session. Member edits also rely on Supabase RLS, which still needs verification. | [ ] |
| Admin content | `profiles.role = admin` checked in server actions; `cms_content` reads/writes are restricted by RLS, while a public RPC redacts drafts. | [ ] |
| File uploads | None at launch | [ ] |
| Dependencies | Lockfile committed; `audit` run on each release; minimal dependencies | [ ] |
| Supply chain | Pin versions; review new packages before adding; prefer well-maintained libraries; check licenses (including GSAP) | [ ] |
| Third parties | Limit and review analytics, form protection, fonts; document what data each receives | [ ] |
| Errors | Error pages and responses never leak stack traces or internals | [ ] |
| Logging | Log contact-route errors without storing message content unnecessarily | [ ] |
| Monitoring | Uptime check and error reporting (free tier) | [ ] |
| Backup | Content and code in Git; keep original media separately **[TBD]** | [ ] |
| Domain/hosting | Two-factor on hosting, domain registrar, email provider and GitHub accounts | [ ] |

## Privacy (security-related)
- Collect the minimum personal data (contact form only).
- Define retention for enquiry emails **[TBD]** and a deletion process.
- Cookieless analytics; no tracking of personal data.
- Privacy Policy and consent approach need review by a qualified legal professional.

## Before every release
Run the dependency audit, check headers, test form abuse cases (empty, oversized, malformed, repeated submissions), confirm no secrets in the repository or bundle.

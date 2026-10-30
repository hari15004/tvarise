import Link from "next/link";
import { cacheLife } from "next/cache";
import type { SiteSettings } from "@/lib/types";

function SocialIcon({ label }: { label: string }) {
  const platform = label.toLowerCase();
  if (platform.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="footer__social-dot" cx="18" cy="6" r="1" />
      </svg>
    );
  }
  if (platform.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 9v10M5 5v.1M10 19v-6a4 4 0 0 1 8 0v6M10 9v10" />
        <circle cx="5" cy="5" r="1" />
      </svg>
    );
  }
  if (platform.includes("facebook")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5C17.3 1.3 16.3 1 15 1c-3.5 0-5.5 2.1-5.5 5.8V9H7v4h2.5v8H14Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

// Cached on purpose: Cache Components forbids reading the current time
// during prerender, but allows it inside a cached function.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer({ site }: { site: SiteSettings }) {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__brand">
            {site.logo ? (
              <img
                src={site.logo}
                alt={site.name}
                style={{ width: "auto", height: "1.5rem", maxWidth: "9rem", objectFit: "contain" }}
              />
            ) : site.name}
          </p>
          <p className="footer__text">{site.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="footer__list">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="footer__link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="footer__label">{site.footerContactLabel}</p>
          {site.contactEmail ? (
            <a className="footer__link" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
          ) : (
            <Link className="footer__link" href="/contact">Send a project enquiry →</Link>
          )}
          {site.social.length > 0 && (
            <div className="footer__social">
              <p className="footer__label">{site.socialLabel}</p>
              <ul className="footer__social-list">
                {site.social.map((item) => (
                  <li key={item.href || item.label}>
                    {item.href ? (
                      <a className="footer__social-link" href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                        <SocialIcon label={item.label} />
                        <span>{item.label}</span>
                      </a>
                    ) : (
                      <span className="footer__social-link is-unlinked" aria-label={`${item.label} link not set`}>
                        <SocialIcon label={item.label} />
                        <span>{item.label}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            className="footer__edit-social"
            data-edit-collection="site"
            data-edit-slug="singleton"
            data-edit-field="social"
          >
            Edit social links
          </button>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>
          © <CurrentYear /> {site.name}
        </p>
      </div>
    </footer>
  );
}

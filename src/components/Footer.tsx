import Link from "next/link";
import { cacheLife } from "next/cache";
import type { SiteSettings } from "@/lib/types";

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
          <p className="footer__brand">{site.name}</p>
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
          <p className="footer__label">Contact</p>
          <a className="footer__link" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>
          © <CurrentYear /> {site.name}
        </p>
        {site.placeholder && <p className="tag">Placeholder content</p>}
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { Project } from "@/lib/types";
import { SectionHead } from "./SectionHead";

export function Work({ index, items }: { index: string; items: Project[] }) {
  if (items.length === 0) return null;

  return (
    <section id="work" className="section" aria-label="Selected work">
      <div className="container">
        <SectionHead index={index} label="Selected work" title="Work that moves" />
        <ul className="work__grid">
          {items.map((project, i) => (
            <li key={project.slug} className="work-card">
              {/* Detail pages come later; for now every card opens the work index. */}
              <Link href="/work" className="work-card__link" data-cursor>
                <div className="work-card__media" data-clip>
                  {project.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="work-card__img" src={project.cover} alt="" data-parallax />
                  ) : (
                    <div className="work-card__img work-card__img--empty" data-parallax>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  )}
                </div>
                <div className="work-card__body" data-reveal>
                  <h3 className="work-card__title">{project.title}</h3>
                  <p className="work-card__text">{project.summary}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="section__more" data-reveal>
          <Link href="/work" className="btn btn--ghost" data-magnetic>
            All work
          </Link>
        </div>
      </div>
    </section>
  );
}

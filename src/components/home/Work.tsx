import Link from "next/link";
import type { Project } from "@/lib/types";
import { SectionHead } from "./SectionHead";

export function Work({
  index,
  items,
  heading,
  showMore = true,
}: {
  index: string;
  items: Project[];
  heading?: { label: string; title: string };
  showMore?: boolean;
}) {
  if (items.length === 0) return null;
  const visibleItems = showMore ? items.slice(0, 6) : items;

  return (
    <section id="work" className="section" aria-label="Selected work">
      <div className="container">
        <SectionHead
          index={index}
          label={heading?.label ?? "Selected work"}
          title={heading?.title ?? "Work that moves"}
        />
        <ul className="work__grid">
          {visibleItems.map((project, i) => {
            const isProfileWork = project.slug.startsWith("profile-");
            const content = (
              <>
                <div
                  className="work-card__media"
                  data-clip
                  data-edit-collection={isProfileWork ? undefined : "projects"}
                  data-edit-slug={isProfileWork ? undefined : project.slug}
                  data-edit-field={isProfileWork ? undefined : "cover"}
                >
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
              </>
            );

            return (
              <li key={project.slug} className="work-card">
                {project.link ? (
                  <a
                    href={project.link}
                    className="work-card__link"
                    data-cursor
                  >
                    {content}
                  </a>
                ) : (
                  <Link href="/work" className="work-card__link" data-cursor>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="work__actions" data-reveal>
          {showMore && items.length > visibleItems.length && (
            <Link href="/work" className="btn btn--ghost" data-magnetic>
              See more
            </Link>
          )}
          <button type="button" className="work__add-project" data-edit-add-project="work">
            + Add project
          </button>
        </div>
      </div>
    </section>
  );
}

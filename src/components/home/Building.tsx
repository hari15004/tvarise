import type { Project } from "@/lib/types";
import { SectionHead } from "./SectionHead";

export function Building({
  index,
  items,
  heading,
}: {
  index: string;
  items: Project[];
  heading?: { label: string; title: string };
}) {
  return (
    <section id="building" className="section section--quiet" aria-label="Currently building">
      <div className="container">
        <SectionHead
          index={index}
          label={heading?.label ?? "Currently building"}
          title={heading?.title ?? "On the bench right now"}
        />
        <ul className="building building--projects">
          {items.length === 0 && (
            <li className="building__item building__item--empty">
              <span className="building__status">
                <span className="building__dot" aria-hidden="true" />
                Nothing in progress
              </span>
              <h3 className="building__title">What we’re building next</h3>
              <p className="building__text">
                Active projects will show here. Add a project in edit mode to get started.
              </p>
            </li>
          )}
          {items.map((item) => (
            <li key={item.slug} className="building__item" data-reveal>
              {item.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="building__image"
                  src={item.cover}
                  alt=""
                  data-edit-collection="projects"
                  data-edit-slug={item.slug}
                  data-edit-field="cover"
                />
              )}
              <div className="building__top">
                <h3
                  className="building__title"
                  data-edit-collection="projects"
                  data-edit-slug={item.slug}
                  data-edit-field="title"
                >
                  {item.title}
                </h3>
                <span
                  className="building__status"
                  data-edit-collection="projects"
                  data-edit-slug={item.slug}
                  data-edit-field="inProgress"
                >
                  <span className="building__dot" aria-hidden="true" />
                  In progress
                </span>
              </div>
              <p
                className="building__text"
                data-edit-collection="projects"
                data-edit-slug={item.slug}
                data-edit-field="summary"
              >
                {item.summary}
              </p>
              <button
                type="button"
                className="building__complete-edit"
                data-edit-collection="projects"
                data-edit-slug={item.slug}
                data-edit-complete-project={item.slug}
              >
                Mark complete → Move to Work that moves
              </button>
              {item.year && <span className="building__year">{item.year}</span>}
            </li>
          ))}
        </ul>
        <button type="button" className="building__add-project" data-edit-add-project="current">
          + Add current project
        </button>
      </div>
    </section>
  );
}

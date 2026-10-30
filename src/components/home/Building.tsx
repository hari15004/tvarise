import type { BuildingItem } from "@/lib/types";
import { SectionHead } from "./SectionHead";

// Renders nothing when /content/building is empty, so it never looks stale.
export function Building({
  index,
  items,
  heading,
}: {
  index: string;
  items: BuildingItem[];
  heading?: { label: string; title: string };
}) {
  if (items.length === 0) return null;

  return (
    <section id="building" className="section section--quiet" aria-label="Currently building">
      <div className="container">
        <SectionHead
          index={index}
          label={heading?.label ?? "Currently building"}
          title={heading?.title ?? "On the bench right now"}
        />
        <ul className="building">
          {items.map((item) => (
            <li key={item.slug} className="building__item" data-reveal>
              <div className="building__top">
                <h3 className="building__title">{item.title}</h3>
                <span className="building__status">
                  <span className="building__dot" aria-hidden="true" />
                  {item.status}
                </span>
              </div>
              <p className="building__text">{item.description}</p>
              {typeof item.progress === "number" && (
                <div
                  className="building__bar"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.progress}
                  aria-label={`${item.title} progress`}
                >
                  <span style={{ width: `${item.progress}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

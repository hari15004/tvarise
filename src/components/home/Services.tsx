import type { CSSProperties } from "react";
import type { Service } from "@/lib/types";
import { SectionHead } from "./SectionHead";

const serviceCopy: Record<string, { summary: string; includes: string[] }> = {
  "ads-social": {
    summary: "Build a clearer social presence and plan campaigns around the people you want to reach.",
    includes: ["Campaign strategy", "Creative direction", "Content planning", "Performance review"],
  },
  "app-design": {
    summary: "Shape mobile app ideas into intuitive screens and user journeys.",
    includes: ["User flows", "Interface design", "Interactive prototypes", "Design systems"],
  },
  "web-design": {
    summary: "Design and build responsive websites that make your brand easy to understand and use.",
    includes: ["Website strategy", "Responsive design", "Development", "Launch support"],
  },
  "3d-animation": {
    summary: "Bring products and ideas to life with expressive 3D visuals and motion.",
    includes: ["3D modeling", "Look development", "Animation", "Render delivery"],
  },
};

export function Services({
  index,
  items,
  heading,
}: {
  index: string;
  items: Service[];
  heading?: { label: string; title: string };
}) {
  if (items.length === 0) return null;

  return (
    <section id="services" className="section" aria-label="Services">
      <div className="container">
        <SectionHead
          index={index}
          label={heading?.label ?? "Services"}
          title={heading?.title ?? "What we do"}
        />
        <ul className="svc">
          {items.map((service, i) => (
            (() => {
              const fallback = serviceCopy[service.slug];
              const useFallback = service.placeholder || service.summary.toLowerCase().includes("placeholder");
              const summary = useFallback ? fallback?.summary ?? "Explore a tailored service for your next project." : service.summary;
              const includes = useFallback ? fallback?.includes ?? [] : service.includes;
              return (
            <li
              key={service.slug}
              className="svc__card"
              style={{ "--i": i } as CSSProperties}
            >
              <div className="svc__inner" data-reveal>
                <div className="svc__top">
                  <span className="svc__n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="svc__count">
                    {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                </div>
                <h3
                  className="svc__title"
                  data-edit-collection="services"
                  data-edit-slug={service.slug}
                  data-edit-field="title"
                >
                  {service.title}
                </h3>
                <p
                  className="svc__text"
                  data-edit-collection="services"
                  data-edit-slug={service.slug}
                  data-edit-field="summary"
                >
                  {summary}
                </p>
                {includes.length > 0 && (
                  <ul className="svc__list">
                    {includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
              );
            })()
          ))}
        </ul>
        <div className="svc__actions">
          <button type="button" className="svc__add-service" data-edit-add-service>
            + Add service
          </button>
        </div>
      </div>
    </section>
  );
}

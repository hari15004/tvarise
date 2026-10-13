import type { Service } from "@/lib/types";
import { SectionHead } from "./SectionHead";

export function Services({ index, items }: { index: string; items: Service[] }) {
  if (items.length === 0) return null;

  return (
    <section id="services" className="section" aria-label="Services">
      <div className="container">
        <SectionHead index={index} label="Services" title="What we do" />
        <ul className="bento">
          {items.map((service, i) => (
            <li key={service.slug} className="card bento__item" data-reveal data-spotlight>
              <span className="card__n">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="card__title">{service.title}</h3>
              <p className="card__text">{service.summary}</p>
              {service.includes.length > 0 && (
                <ul className="card__list">
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {service.placeholder && <span className="tag">Placeholder</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

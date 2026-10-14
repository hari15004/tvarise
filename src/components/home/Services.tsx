import type { CSSProperties } from "react";
import type { Service } from "@/lib/types";
import { SectionHead } from "./SectionHead";

export function Services({ index, items }: { index: string; items: Service[] }) {
  if (items.length === 0) return null;

  return (
    <section id="services" className="section" aria-label="Services">
      <div className="container">
        <SectionHead index={index} label="Services" title="What we do" />
        <ul className="svc">
          {items.map((service, i) => (
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
                <h3 className="svc__title">{service.title}</h3>
                <p className="svc__text">{service.summary}</p>
                {service.includes.length > 0 && (
                  <ul className="svc__list">
                    {service.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import type { HomeContent } from "@/lib/types";
import { SectionHead } from "./SectionHead";
import { Statement } from "./Statement";

export function About({ index, content }: { index: string; content: HomeContent }) {
  return (
    <section id="about" className="section section--quiet" aria-label="About">
      <div className="container">
        <SectionHead index={index} label={content.about.label} title={content.about.title} />
        <Statement text={content.about.text} />

        {content.why.length > 0 && (
          <ul className="why">
            {content.why.map((item, i) => (
              <li key={item.title} className="card why__item" data-reveal data-spotlight>
                <span className="card__n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="card__title">{item.title}</h3>
                <p className="card__text">{item.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

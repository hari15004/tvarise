import type { HomeContent } from "@/lib/types";
import { SectionHead } from "./SectionHead";
import { Statement } from "./Statement";

export function About({ index, content }: { index: string; content: HomeContent }) {
  return (
    <section id="about" className="section section--quiet" aria-label="About">
      <div className="container">
        <SectionHead index={index} label={content.about.label} title={content.about.title} />
        <Statement text={content.about.text} />
      </div>
    </section>
  );
}

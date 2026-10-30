"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/motion/gsap";
import { getTier, stageInput } from "@/motion/state";

type Props = {
  index: string;
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  wordmark: string;
  label: string;
};

export function FinalCta({ index, title, text, ctaLabel, ctaHref, wordmark, label }: Props) {
  const ref = useRef<HTMLElement>(null);

  // While this section scrolls in, the 3D pieces fly back together (see sculpture.ts).
  useEffect(() => {
    const el = ref.current;
    if (!el || getTier() === "static") return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      end: "top 15%",
      scrub: true,
      onUpdate: (st) => {
        stageInput.ctaProgress = st.progress;
      },
    });
    return () => {
      trigger.kill();
      stageInput.ctaProgress = 0;
    };
  }, []);

  return (
    <section ref={ref} id="contact-cta" className="cta" aria-label="Let's work together">
      <div className="container cta__inner">
        <p className="sec-label" data-reveal>
          <span className="sec-label__n">{index}</span>
          {label}
        </p>
        <h2 className="cta__title" data-reveal>
          {title}
        </h2>
        <p className="cta__text" data-reveal>
          {text}
        </p>
        <div data-reveal>
          <Link href={ctaHref} className="btn btn--primary btn--lg" data-magnetic>
            {ctaLabel}
          </Link>
        </div>
      </div>
      <p className="cta__wordmark" aria-hidden="true">
        {wordmark}
      </p>
    </section>
  );
}

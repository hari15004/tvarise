"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/motion/gsap";
import { getTier } from "@/motion/state";

// Words start dim and brighten one by one while scrolling (scroll-linked).
// Without motion (Static tier / reduced motion) the text is simply fully visible.
export function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || getTier() === "static") return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll(".statement__w"),
        { opacity: 0.18 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <p ref={ref} className="statement">
      {text.split(" ").map((word, i) => (
        <span key={i} className="statement__w">
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

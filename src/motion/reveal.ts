import { gsap, ScrollTrigger } from "./gsap";
import { EASE } from "./tokens";

// [data-reveal]: fade/slide up once when entering the viewport.
// [data-clip]:   clip-path wipe (images/cards) once when entering the viewport.
// Both start hidden by CSS only while <html data-motion="on">.
export function initReveals(): () => void {
  const triggers: ScrollTrigger[] = [];

  const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  if (els.length > 0) {
    triggers.push(
      ...ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 32, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: EASE.out, stagger: 0.08, overwrite: true },
          );
        },
      }),
    );
  }

  const clips = gsap.utils.toArray<HTMLElement>("[data-clip]");
  if (clips.length > 0) {
    triggers.push(
      ...ScrollTrigger.batch(clips, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.2,
              ease: EASE.inOut,
              stagger: 0.12,
              overwrite: true,
            },
          );
        },
      }),
    );
  }

  return () => triggers.forEach((t) => t.kill());
}

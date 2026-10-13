import { gsap, ScrollTrigger } from "./gsap";

// [data-parallax]: the element drifts inside its parent while the page scrolls.
// [data-process] wrapper: a line fills as you scroll and each [data-step] lights up.
export function initScrollScenes(): () => void {
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-process]").forEach((wrap) => {
      const fill = wrap.querySelector<HTMLElement>("[data-line-fill]");
      if (fill) {
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: wrap, start: "top 70%", end: "bottom 60%", scrub: true },
          },
        );
      }
      wrap.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 65%",
          onEnter: () => step.classList.add("is-active"),
          onLeaveBack: () => step.classList.remove("is-active"),
        });
      });
    });
  });

  return () => {
    ctx.revert();
    document.querySelectorAll(".is-active[data-step]").forEach((el) => el.classList.remove("is-active"));
  };
}

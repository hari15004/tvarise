"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/motion/gsap";
import { getTier, onIntroDone, stageInput } from "@/motion/state";
import { EASE, STAGGER } from "@/motion/tokens";
import { MaskedWords } from "./MaskedWords";

type Props = {
  title: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  bigName: string;
  tags: string[];
  placeholder: boolean;
};

const TAGLINE = "Where Creativity, Design & Technology Rise Together";

export function Hero({ title, sub, ctaLabel, ctaHref, bigName, tags }: Props) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || getTier() === "static") return;

    const q = gsap.utils.selector(root);
    let offIntro: () => void = () => {};

    const ctx = gsap.context((self) => {
      // Tagline typing: letters appear one by one. Paused until the entrance plays.
      const typing = gsap
        .timeline({ paused: true })
        .fromTo(q(".hero__char"), { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: 0.03, ease: "none" }, 0.5);

      // Entrance: headline words slide up and items fade up.
      // It runs after the intro, and again every time the visitor scrolls back to the top.
      let entrance: gsap.core.Timeline | null = null;
      const play = () => {
        entrance?.kill();
        entrance = gsap
          .timeline({ defaults: { ease: EASE.out } })
          .fromTo(q("[data-mask]"), { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: STAGGER.words }, 0)
          .fromTo(
            q("[data-hero]"),
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, stagger: STAGGER.items },
            0.45,
          );
      };
      // First load: the tagline types in, letter by letter.
      const typeIn = () => {
        typing.timeScale(1).play(0);
      };
      // Coming back from below: the full tagline shows, then backspaces away.
      const backspace = () => {
        typing.progress(1).timeScale(1.5).reverse();
      };
      offIntro = onIntroDone(() =>
        self.add(() => {
          play();
          typeIn();
        }),
      );

      // Leaving the top: the tagline erases itself. Coming back to the top: everything plays again.
      ScrollTrigger.create({
        trigger: root,
        start: "top+=40 top",
        onEnter: () => {
          typing.timeScale(3).reverse();
        },
        onLeaveBack: () =>
          self.add(() => {
            gsap.fromTo(q(".hero__char"), { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: { each: 0.03, from: "end" }, ease: "none", overwrite: "auto", onComplete: () => { typing.progress(1).pause(); } });
          }),
      });

      // Scroll: the hero is a tall section with a sticky screen inside it.
      // 1) Sculpture reads the progress (assemble, explode, drift).
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (st) => {
          stageInput.heroProgress = st.progress;
        },
      });

      // 2) Text drifts up and fades out during the first part of the scroll.
      gsap.to(q(".hero__inner"), {
        yPercent: -14,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * 0.8}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // 3) Big studio name slides sideways (parallax depth).
      gsap.to(q(".hero__bigname"), {
        xPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: true },
      });
    }, root);

    return () => {
      offIntro();
      ctx.revert();
      stageInput.heroProgress = 0;
    };
  }, []);

  const words = TAGLINE.split(" ");

  return (
    <section ref={rootRef} className="hero" aria-labelledby="hero-title">
      <div className="hero__sticky">
        <p className="hero__bigname" aria-hidden="true" data-hero>
          {bigName}
        </p>

        <p className="hero__tagline" aria-label={TAGLINE}>
          {words.map((word, wi) => (
            <Fragment key={wi}>
              <span aria-hidden="true" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                {word.split("").map((ch, ci) => (
                  <span key={ci} className="hero__char">
                    {ch}
                  </span>
                ))}
              </span>
              {wi < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </p>

        <div className="container hero__inner">
          <h1 id="hero-title" className="hero__title">
            <MaskedWords text={title} />
          </h1>
          <p className="hero__sub" data-hero>
            {sub}
          </p>
          <div className="hero__actions" data-hero>
            <Link href={ctaHref} className="btn btn--primary" data-magnetic>
              {ctaLabel}
            </Link>
            <Link href="/work" className="btn btn--ghost" data-magnetic>
              See the work
            </Link>
          </div>
        </div>

        <div className="container hero__meta" data-hero>
          <ul className="hero__tags">
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <span className="hero__cue" aria-hidden="true">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
